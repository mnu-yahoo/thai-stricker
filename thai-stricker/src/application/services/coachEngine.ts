import type { TextGenerationPipeline } from "@huggingface/transformers";
import type { Exercise, Technique, Workout } from "../../types/domain";
import type { CoachKnowledge } from "./coachKnowledge";

export const COACH_MODEL_ID = "onnx-community/LFM2.5-350M-ONNX";
export const COACH_ACTIONS = ["technicalTips", "commonMistakes", "focusPoints", "explanation"] as const;
export type CoachAction = (typeof COACH_ACTIONS)[number];

export type CoachGenerationContext = {
  action: CoachAction;
  focusTechnique: string;
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
  const focusTechnique = context.focusTechnique.trim().toLocaleUpperCase();
  const isCombination = context.knowledge.length > 1;
  const validatedKnowledge = context.knowledge.length
    ? context.knowledge.map((item) => [
      `Validated technique: ${item.technique}`,
      `Stance: ${item.stance}`,
      `Scope: ${item.scope}`,
      `Explanation: ${item.explanation}`,
      `Principles: ${item.principles.join(" | ")}`,
      `Common mistakes: ${item.commonMistakes.join(" | ")}`,
      `Focus points: ${item.focusPoints.join(" | ")}`,
      `Validated combinations: ${item.combinations.map((combination) => `${combination.name}; role: ${combination.role}; transition: ${combination.transition}; mistakes: ${combination.commonMistakes.join(" | ")}`).join(" || ")}`,
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
  const actionInstructions = isCombination ? {
    technicalTips: "Copy exactly 3 existing principles, transitions, or mistakes from the validated combination sheets. Do not rephrase, merge, or add text.",
    commonMistakes: "Copy exactly 3 existing combination mistakes from the validated sheets. Do not rephrase, merge, correct, or add text.",
    focusPoints: `Copy exactly these 3 validated responses and nothing else: "Focus point: Stay stable and balanced."; "Validated technique: ${context.knowledge.at(-1)?.technique || "the final technique"}: Keep the lead hand close to the chin."; "Transition: ${context.knowledge.flatMap((item) => item.combinations).find((combination) => combination.sequence.at(-1) === context.knowledge.at(-1)?.technique)?.transition || "Link the techniques smoothly and return to guard after the combination."}". Do not rephrase, merge, or add text.`,
    explanation: "Copy exactly 3 existing role, transition, or variation statements from the validated sheets. Do not rephrase, merge, or add text.",
  }[context.action] : focusTechnique === "JAB" ? {
    technicalTips: "Copy exactly 3 existing principles from the validated jab sheet. Do not rephrase, merge, or add text.",
    commonMistakes: "Copy exactly 3 existing mistakes from the validated jab sheet. Do not rephrase, merge, correct, or add text.",
    focusPoints: "Copy exactly 3 existing focus points from the validated jab sheet. Do not rephrase, merge, or add text.",
    explanation: "Copy exactly 3 existing sentences or documented combination entries from the validated jab sheet. Do not rephrase, merge, or add text.",
  }[context.action] : {
    technicalTips: "Copy exactly 3 existing principles from the validated cross sheet. Do not rephrase, merge, or add text.",
    commonMistakes: "Copy exactly 3 existing mistakes from the validated cross sheet. Do not rephrase, merge, correct, or add text.",
    focusPoints: "Copy exactly 3 existing focus points from the validated cross sheet. Do not rephrase, merge, or add text.",
    explanation: "Copy exactly 3 existing sentences or documented combination entries from the validated cross sheet. Do not rephrase, merge, or add text.",
  }[context.action];
  const finalActionConstraint = context.action === "commonMistakes"
    ? isCombination
      ? "Final constraint: output exactly 3 existing mistakes from the validated combination sheets and nothing else."
      : focusTechnique === "JAB"
      ? "Final constraint: output exactly 3 existing mistakes from the validated jab sheet and nothing else."
      : "Final constraint: output exactly 3 existing mistakes from the validated cross sheet and nothing else."
    : isCombination && context.action === "focusPoints"
      ? "Final constraint: output exactly the three requested labeled points and nothing else. Do not mention the prompt, metadata, or the full knowledge sheet."
      : "Final constraint: stay specific to the requested action and focus technique.";

  return [
    {
      role: "system",
      content: [
        "You are Thai Stricker's concise technique coach.",
        "Give only practical advice about the focus technique and its training context.",
        "Do not give medical, injury, nutrition, or supplement advice.",
        "If the user mentions pain or a health problem, advise them to consult a qualified professional instead of coaching the symptom.",
        "Use only the supplied validated knowledge. Never invent techniques or workout facts.",
        "Return exactly 3 existing responses from the supplied fiche, in English, and nothing else.",
        "Copy the selected responses verbatim. Do not paraphrase, merge, interpret, correct, or invent information.",
        "Do not repeat a response unless it appears as a separate validated entry in the fiche.",
        "Avoid vague advice such as 'stay focused' or 'maintain balance' unless you explain exactly how.",
        isCombination
          ? `This is combination coaching for ${context.knowledge.map((item) => item.technique).join(" then ")}. Use only the documented combination entries and copy them exactly.`
          : focusTechnique === "JAB"
          ? "For the jab, use only the exact entries supplied under Principles, Common mistakes, Focus points, Explanation, or Documented combinations."
          : `For the ${focusTechnique}, use only the exact entries supplied under Principles, Common mistakes, Focus points, Explanation, or Documented combinations.`,
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `Requested action: ${actionLabel}`,
        `Focus technique: ${context.focusTechnique}`,
        `Action requirements: ${actionInstructions}`,
        `Exercise: ${context.exercise.title}`,
        `Description: ${context.exercise.description || "No description"}`,
        `Additional tip: ${context.exercise.help || "No additional tip"}`,
        `Techniques in exercise: ${techniqueNames}`,
        isCombination
          ? "This is combination coaching. Address every validated technique in sequence and explain the transition between them. Do not omit a validated technique."
          : "Answer only about the focus technique. Do not explain another technique in the exercise unless explicitly requested.",
        validatedKnowledge,
        finalActionConstraint,
        `Current workout: ${workoutContext}`,
      ].join("\n"),
    },
  ];
}

export function buildCoachPrompt(context: CoachGenerationContext) {
  return buildCoachMessages(context).map((message) => `${message.role}: ${message.content}`).join("\n");
}

export function getFallbackCoachItems(context: CoachGenerationContext) {
  const focusTechnique = context.focusTechnique.trim().toLocaleUpperCase();
  const knowledge = context.knowledge.find((item) => item.technique === focusTechnique) || context.knowledge[0];
  if (context.knowledge.length > 1) {
    if (context.action === "technicalTips") return context.knowledge.flatMap((item) => item.principles.slice(0, 2).map((point) => `${item.technique}: ${point}`)).slice(0, 3);
    if (context.action === "commonMistakes") return context.knowledge.flatMap((item) => item.commonMistakes.slice(0, 2).map((point) => `${item.technique}: ${point}`)).slice(0, 3);
    if (context.action === "focusPoints") {
      const finalTechnique = context.knowledge.at(-1);
      const combination = context.knowledge.flatMap((item) => item.combinations).find((item) => item.sequence.at(-1) === finalTechnique?.technique);
      return [
        "Focus point: Stay stable and balanced.",
        `Validated technique: ${finalTechnique?.technique || "Final technique"}: ${finalTechnique?.focusPoints.find((point) => point.toLocaleLowerCase().includes("chin")) || finalTechnique?.focusPoints[0] || "Stay stable and balanced."}`,
        `Transition: ${combination?.transition || "Link the techniques smoothly and return to guard after the combination."}`,
      ];
    }
    return context.knowledge.flatMap((item) => [`${item.technique}: ${item.explanation}`]).slice(0, 3);
  }
  if (knowledge) {
    if (context.action === "technicalTips") return knowledge.principles.slice(0, 3);
    if (context.action === "commonMistakes") return knowledge.commonMistakes.slice(0, 3);
    if (context.action === "focusPoints") return knowledge.focusPoints.slice(0, 3);
    return [knowledge.explanation, ...knowledge.combinations.slice(0, 2).map((combination) => combination.role)];
  }
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ");
  if (context.action === "explanation") return [context.exercise.description || `Work on ${context.exercise.title} with control.`];
  if (context.action === "technicalTips") return [context.exercise.help || `Stay precise and controlled on ${techniqueNames || context.exercise.title}.`];
  if (context.action === "commonMistakes") return ["Avoid rushing, dropping your guard, or sacrificing precision for speed."];
  return [`Stay focused on posture, breathing, and returning to guard during ${context.exercise.title}.`];
}

export function getFallbackCoachResponse(context: CoachGenerationContext) {
  return getFallbackCoachItems(context).join(" ");
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
      generator(messages, { max_new_tokens: 64, do_sample: false, temperature: 0.1, return_full_text: true }),
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
