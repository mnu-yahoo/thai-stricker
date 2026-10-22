import type { TextGenerationPipeline } from "@huggingface/transformers";
import type { Exercise, Technique, Workout } from "../../types/domain";
import type { CoachKnowledge } from "./coachKnowledge";

export const COACH_MODEL_ID = "onnx-community/LFM2.5-350M-ONNX";
export const COACH_ACTIONS = ["technicalTips", "commonMistakes", "focusPoints", "explanation"] as const;
export type CoachAction = (typeof COACH_ACTIONS)[number];

export type CoachGenerationContext = {
  action: CoachAction;
  exercise: Exercise;
  techniques: Technique[];
  knowledge: CoachKnowledge[];
  workout?: Workout;
};

type GeneratedText = { generated_text: string | Array<{ role: string; content: string }> };
type CoachMessage = { role: "system" | "user"; content: string };

let generatorPromise: Promise<TextGenerationPipeline> | null = null;
let generatorDevice: "webgpu" | "wasm" = "wasm";

function hasWebGpu() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

async function createGenerator(forceWasm = false) {
  const { pipeline } = await import("@huggingface/transformers");
  const options = { dtype: "q4" as const };
  if (!forceWasm && hasWebGpu()) {
    try {
      const generator = await pipeline("text-generation", COACH_MODEL_ID, { ...options, device: "webgpu" });
      generatorDevice = "webgpu";
      return generator;
    } catch {
      // WebGPU can be exposed but unavailable to the model; fall through to WASM.
    }
  }
  const generator = await pipeline("text-generation", COACH_MODEL_ID, options);
  generatorDevice = "wasm";
  return generator;
}

export function buildCoachMessages(context: CoachGenerationContext): CoachMessage[] {
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ") || "None";
  const validatedKnowledge = context.knowledge.length
    ? context.knowledge.map((item) => [
      `Validated technique: ${item.technique}`,
      `Principles: ${item.principles.join(" | ")}`,
      `Common mistakes: ${item.commonMistakes.join(" | ")}`,
      `Focus points: ${item.focusPoints.join(" | ")}`,
      `Variations: ${item.variations.join(" | ")}`,
      `Safety: ${item.safetyNote}`,
    ].join("\n")).join("\n")
    : "No validated technique sheet available.";
  const workoutContext = context.workout
    ? `${context.workout.title} | ${context.workout.description || "No workout description"}`
    : "No workout selected";
  const actionLabel = {
    technicalTips: "technical tips",
    commonMistakes: "common mistakes to avoid",
    focusPoints: "focus points",
    explanation: "a short explanation of the exercise",
  }[context.action];

  return [
    {
      role: "system",
      content: [
        "You are Thai Stricker's concise technique coach.",
        "Give only practical advice about the exercise and training structure.",
        "Do not give medical, injury, nutrition, or supplement advice.",
        "If the user mentions pain or a health problem, advise them to consult a qualified professional.",
        "Use only the supplied context. Never invent techniques or workout facts.",
        "Answer in English, in 2 or 3 short sentences, directly addressing the requested action.",
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `Requested action: ${actionLabel}`,
        `Exercise: ${context.exercise.title}`,
        `Description: ${context.exercise.description || "No description"}`,
        `Additional tip: ${context.exercise.help || "No additional tip"}`,
        `Techniques: ${techniqueNames}`,
        validatedKnowledge,
        `Current workout: ${workoutContext}`,
      ].join("\n"),
    },
  ];
}

export function buildCoachPrompt(context: CoachGenerationContext) {
  return buildCoachMessages(context).map((message) => `${message.role}: ${message.content}`).join("\n");
}

export function getFallbackCoachResponse(context: CoachGenerationContext) {
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ");
  if (context.action === "explanation") return context.exercise.description || `Work on ${context.exercise.title} with control.`;
  if (context.action === "technicalTips") return context.exercise.help || `Stay precise and controlled on ${techniqueNames || context.exercise.title}.`;
  if (context.action === "commonMistakes") return "Avoid rushing, dropping your guard, or sacrificing precision for speed.";
  return `Stay focused on posture, breathing, and returning to guard during ${context.exercise.title}.`;
}

function extractGeneratedText(output: GeneratedText | GeneratedText[]) {
  const item = Array.isArray(output) ? output[0] : output;
  if (!item) return "";
  if (typeof item.generated_text === "string") return item.generated_text;
  return item.generated_text.at(-1)?.content || "";
}

function cleanGeneratedText(value: string) {
  return value
    .replace(/<\|im_end\|>[\s\S]*$/i, "")
    .replace(/^(assistant\s*[:：-]?\s*)/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateCoachResponse(context: CoachGenerationContext, timeoutMs = 25_000) {
  if (!context.knowledge.length) throw new Error("No validated coach knowledge is available for this technique");
  if (!generatorPromise) generatorPromise = createGenerator();
  const messages = buildCoachMessages(context);
  const run = async (generator: TextGenerationPipeline) => {
    const output = await Promise.race([
      generator(messages, { max_new_tokens: 80, do_sample: false, temperature: 0.1, return_full_text: true }),
      new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Coach generation timed out")), timeoutMs)),
    ]);
    const text = cleanGeneratedText(extractGeneratedText(output as GeneratedText | GeneratedText[]));
    if (!text || text.length > 500) throw new Error("Coach generated an unusable response");
    return text;
  };
  try {
    const generator = await Promise.race([
      generatorPromise,
      new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Coach model loading timed out")), timeoutMs)),
    ]);
    return await run(generator);
  } catch (error) {
    if (generatorDevice !== "webgpu") throw error;
    generatorPromise = createGenerator(true);
    const cpuGenerator = await Promise.race([
      generatorPromise,
      new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Coach CPU model loading timed out")), timeoutMs)),
    ]);
    return run(cpuGenerator);
  }
}

export function resetCoachEngineForTests() {
  generatorPromise = null;
  generatorDevice = "wasm";
}
