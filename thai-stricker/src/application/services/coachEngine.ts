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
  const focusKnowledge = context.knowledge.find((item) => item.technique === focusTechnique) || context.knowledge[0];
  const validatedKnowledge = context.knowledge.length
    ? context.knowledge.map((item) => [
      `Validated technique: ${item.technique}`,
      `Critical guard cue: ${item.criticalGuardCue}`,
      `Stance: ${item.stance}`,
      `Scope: ${item.scope}`,
      `Explanation: ${item.explanation}`,
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
  const actionInstructions = focusTechnique === "JAB" ? {
    technicalTips: "Give 2 or 3 concrete execution cues. Explain that the rear elbow stays down to protect the upper torso, while the rear hand stays close to the cheek for protection against a simultaneous or early counter from the opposite side, not to disrupt timing.",
    commonMistakes: "Give only these four short mistakes: do not drop the rear hand; do not expose the chin or lead cheek; snap the punch instead of pushing it; return to guard after the strike. Do not add elbow, stance, balance, or other details.",
    focusPoints: "Use exactly these eight short focus points and do not add other details: stay stable and balanced; keep the lead shoulder slightly raised; keep the rear hand close to the cheek; keep the elbow down and punch on a straight path; use coordination between the foot, hip, shoulder, and fist; rotate the front fist shortly before impact; prefer accuracy before power; quickly return to guard.",
    explanation: "Use exactly these explanation points and do not add other details: maintain stable posture to avoid falling; keep the rear hand close to the cheek to avoid counter attacks and stay protected; use the jab to disrupt the opponent's timing, measure distance, make contact, and prepare follow-up actions; make the jab explosive but controlled with the hand returning quickly to guard; keep this quick front-hand straight punch direct to the target.",
  }[context.action] : {
    technicalTips: "Give 2 or 3 concrete execution cues from the validated technique sheet, focusing on rear-foot drive, hip and shoulder rotation, a direct rear-hand path, lead-hand protection, and a quick return to guard.",
    commonMistakes: "Use only the validated common mistakes for the cross. Keep them short and specific to the rear-hand straight punch; do not substitute jab-specific mistakes.",
    focusPoints: "Use exactly the eight validated cross focus points and do not add other details.",
    explanation: "Use the validated cross explanation: stable defensive posture, lead hand protecting the chin, power transferred from the rear foot through the hip, waist, and shoulder, fist rotation shortly before contact, and a quick return to guard. Mention that the cross can follow the jab and set up kicks or combinations.",
  }[context.action];
  const finalActionConstraint = context.action === "commonMistakes"
    ? focusTechnique === "JAB"
      ? "Final constraint: output only the four requested jab mistakes. Do not mention the elbow cue in this answer."
      : "Final constraint: output only the validated cross mistakes. Do not add jab-specific mistakes or unrelated details."
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
        "Answer in English, in 1 or 2 short sentences, directly addressing the requested action.",
        "Do not repeat the same generic advice across different actions.",
        "Avoid vague advice such as 'stay focused' or 'maintain balance' unless you explain exactly how.",
        focusTechnique === "JAB"
          ? "For the jab, always apply the critical guard cue exactly: keep the rear elbow down to protect the upper torso; keep the rear hand close to the cheek to protect against a simultaneous or early counter from the opposite side while the jab is extended; keep the front elbow down for as long as possible, rotate it only just before the strike, then return it down as the arm returns to guard. Do not say that the rear hand protects timing, and do not replace this with 'quick elbow movement' or the vague phrase 'elbow pointed down during the strike'."
          : `For the ${focusTechnique}, apply this validated critical guard cue: ${focusKnowledge?.criticalGuardCue || "keep the guard active and return quickly to stance."}`,
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
        "Answer only about the focus technique. Do not explain another technique in the exercise unless explicitly requested.",
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

export function getFallbackCoachResponse(context: CoachGenerationContext) {
  const focusTechnique = context.focusTechnique.trim().toLocaleUpperCase();
  const knowledge = context.knowledge.find((item) => item.technique === focusTechnique) || context.knowledge[0];
  if (knowledge) {
    if (context.action === "technicalTips") return knowledge.principles.slice(0, 3).join(" ");
    if (context.action === "commonMistakes") return knowledge.commonMistakes.slice(0, 2).join(" ");
    if (context.action === "focusPoints") return knowledge.focusPoints.slice(0, 2).join(" ");
    return knowledge.explanation;
  }
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
