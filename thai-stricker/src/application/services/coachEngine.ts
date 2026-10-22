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

let generatorPromise: Promise<TextGenerationPipeline> | null = null;

function hasWebGpu() {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

async function createGenerator() {
  const { pipeline } = await import("@huggingface/transformers");
  const options = { dtype: "q4" as const };
  if (hasWebGpu()) {
    try {
      return await pipeline("text-generation", COACH_MODEL_ID, { ...options, device: "webgpu" });
    } catch {
      // WebGPU can be exposed but unavailable to the model; fall through to WASM.
    }
  }
  return pipeline("text-generation", COACH_MODEL_ID, options);
}

export function buildCoachPrompt(context: CoachGenerationContext) {
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ") || "None";
  const validatedKnowledge = context.knowledge.length
    ? context.knowledge.map((item) => [
      `Technique validée : ${item.technique}`,
      `Principes : ${item.principles.join(" | ")}`,
      `Erreurs fréquentes : ${item.commonMistakes.join(" | ")}`,
      `Points de concentration : ${item.focusPoints.join(" | ")}`,
      `Variantes : ${item.variations.join(" | ")}`,
      `Sécurité : ${item.safetyNote}`,
    ].join("\n")).join("\n")
    : "Aucune fiche technique validée disponible.";
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
    "<|im_start|>system",
    "You are Thai Stricker's concise technique coach.",
    "Give only practical advice about the exercise and training structure.",
    "Do not give medical, injury, nutrition, or supplement advice.",
    "If the user mentions pain or a health problem, advise them to consult a qualified professional.",
    "Use only the supplied context. Never invent techniques or workout facts.",
    "Answer in French, in 2 or 3 short sentences, directly addressing the requested action.",
    "<|im_end|>",
    "<|im_start|>user",
    `Action demandée : ${actionLabel}`,
    `Exercice : ${context.exercise.title}`,
    `Description : ${context.exercise.description || "Aucune description"}`,
    `Conseil complémentaire (Tip) : ${context.exercise.help || "Aucun conseil"}`,
    `Techniques : ${techniqueNames}`,
    validatedKnowledge,
    `Workout courant : ${workoutContext}`,
    "<|im_end|>",
    "<|im_start|>assistant",
  ].join("\n");
}

export function getFallbackCoachResponse(context: CoachGenerationContext) {
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ");
  if (context.action === "explanation") return context.exercise.description || `Travaillez ${context.exercise.title} avec contrôle.`;
  if (context.action === "technicalTips") return context.exercise.help || `Restez précis et contrôlé sur ${techniqueNames || context.exercise.title}.`;
  if (context.action === "commonMistakes") return "Évitez de vous précipiter, de perdre votre garde ou de sacrifier la précision pour la vitesse.";
  return `Restez concentré sur la posture, la respiration et le retour en garde pendant ${context.exercise.title}.`;
}

function extractGeneratedText(output: GeneratedText | GeneratedText[]) {
  const item = Array.isArray(output) ? output[0] : output;
  if (!item) return "";
  if (typeof item.generated_text === "string") return item.generated_text;
  return item.generated_text.at(-1)?.content || "";
}

function cleanGeneratedText(value: string, prompt: string) {
  const withoutPrompt = value.startsWith(prompt) ? value.slice(prompt.length) : value;
  return withoutPrompt
    .replace(/<\|im_end\|>[\s\S]*$/i, "")
    .replace(/^(assistant\s*[:：-]?\s*)/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateCoachResponse(context: CoachGenerationContext, timeoutMs = 25_000) {
  if (!context.knowledge.length) throw new Error("No validated coach knowledge is available for this technique");
  if (!generatorPromise) generatorPromise = createGenerator();
  const generator = await Promise.race([
    generatorPromise,
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Coach model loading timed out")), timeoutMs)),
  ]);
  const prompt = buildCoachPrompt(context);
  const output = await Promise.race([
    generator(prompt, { max_new_tokens: 80, do_sample: false, temperature: 0.1, return_full_text: true }),
    new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Coach generation timed out")), timeoutMs)),
  ]);
  const text = cleanGeneratedText(extractGeneratedText(output as GeneratedText | GeneratedText[]), prompt);
  if (!text || text.length > 500) throw new Error("Coach generated an unusable response");
  return text;
}

export function resetCoachEngineForTests() {
  generatorPromise = null;
}
