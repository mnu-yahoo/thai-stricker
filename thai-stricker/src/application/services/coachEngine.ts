import type { TextGenerationPipeline } from "@huggingface/transformers";
import type { Exercise, Technique, Workout } from "../../types/domain";
import type { CoachKnowledge } from "./coachKnowledge";

export const COACH_MODEL_ID = "onnx-community/SmolLM2-135M-Instruct-ONNX";
// Use the smallest instruction-tuned graph that remains suitable for the
// constrained, fiche-based coach. q4f16 is substantially lighter than the
// previous LFM model and avoids loading the large desktop-only graph.
// Transformers.js appends the selected dtype suffix to this base name.
export const COACH_MODEL_FILE_NAME = "model";
export const COACH_MODEL_DTYPE = "q4f16" as const;
export const COACH_MODEL_ENABLED_ON_MOBILE = true;
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

function isMobileBrowser() {
  return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

async function createGenerator(forceWasm = false) {
  const { pipeline } = await import("@huggingface/transformers");
  const options = { dtype: COACH_MODEL_DTYPE, model_file_name: COACH_MODEL_FILE_NAME };
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

function formatCombinationMistake(technique: CoachKnowledge, point: string) {
  return `For the ${technique.technique}, ${point.charAt(0).toLocaleLowerCase()}${point.slice(1)}`;
}

/**
 * These are the only responses the model is allowed to select. The model
 * returns an index; the UI always displays the corresponding source entry.
 */
export function getCoachCandidateResponses(context: CoachGenerationContext) {
  if (context.knowledge.length > 1) {
    if (context.action === "technicalTips") return context.knowledge.flatMap((item) => item.principles);
    if (context.action === "commonMistakes") return context.knowledge.flatMap((item) => item.commonMistakes.map((point) => formatCombinationMistake(item, point)));
    if (context.action === "focusPoints") return context.knowledge.flatMap((item) => item.focusPoints);
    return context.knowledge.flatMap((item) => [item.explanation, ...item.combinations.flatMap((combination) => [combination.role, combination.transition])]);
  }

  const knowledge = context.knowledge[0];
  if (knowledge) {
    if (context.action === "technicalTips") return knowledge.principles;
    if (context.action === "commonMistakes") return knowledge.commonMistakes;
    if (context.action === "focusPoints") return knowledge.focusPoints;
    return [knowledge.explanation, ...knowledge.combinations.flatMap((combination) => [combination.role, combination.transition])];
  }

  if (context.action === "explanation") return [context.exercise.description || `Work on ${context.exercise.title} with control.`];
  if (context.action === "technicalTips") return [context.exercise.help || `Stay precise and controlled on ${context.exercise.title}.`];
  if (context.action === "commonMistakes") return ["Avoid rushing, dropping your guard, or sacrificing precision for speed."];
  return [`Stay focused on posture, breathing, and returning to guard during ${context.exercise.title}.`];
}

export function buildCoachMessages(context: CoachGenerationContext): CoachMessage[] {
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ") || "None";
  const focusTechnique = context.focusTechnique.trim().toLocaleUpperCase();
  const isCombination = context.knowledge.length > 1;
  const candidateResponses = getCoachCandidateResponses(context);
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
    technicalTips: "Copy exactly 1 existing principle from the combination techniques. Do not prefix it with JAB: or CROSS:; keep entries such as 'Use the jab...' or 'Use the cross...' as written. Do not rephrase, merge, or add text.",
    commonMistakes: "Copy exactly 1 existing combination mistake. Prefix it with 'For the JAB,' or 'For the CROSS,' according to its source technique. Never use the format 'JAB:' or 'CROSS:'. Do not rephrase or add text.",
    focusPoints: "Copy exactly 1 existing focus point from the techniques in the combination. Return only one plain focus point sentence, without 'Focus points:', 'Focus:', technique labels, combination labels, or metadata.",
    explanation: "Copy exactly 1 existing role or transition statement from the documented combinations. Do not rephrase, merge, or add text.",
  }[context.action] : focusTechnique === "JAB" ? {
    technicalTips: "Copy exactly 1 existing principle from the validated jab sheet. Do not rephrase, merge, or add text.",
    commonMistakes: "Copy exactly 1 existing mistake from the validated jab sheet. Do not rephrase, merge, correct, or add text.",
    focusPoints: "Copy exactly 1 existing focus point from the validated jab sheet. Do not rephrase, merge, or add text.",
    explanation: "Copy exactly 1 existing sentence or documented combination entry from the validated jab sheet. Do not rephrase, merge, or add text.",
  }[context.action] : {
    technicalTips: "Copy exactly 1 existing principle from the validated cross sheet. Do not rephrase, merge, or add text.",
    commonMistakes: "Copy exactly 1 existing mistake from the validated cross sheet. Do not rephrase, merge, correct, or add text.",
    focusPoints: "Copy exactly 1 existing focus point from the validated cross sheet. Do not rephrase, merge, or add text.",
    explanation: "Copy exactly 1 existing sentence or documented combination entry from the validated cross sheet. Do not rephrase, merge, or add text.",
  }[context.action];
  const finalActionConstraint = context.action === "commonMistakes"
    ? isCombination
      ? "Final constraint: output exactly 1 existing mistake from the validated combination sheets and nothing else."
      : focusTechnique === "JAB"
      ? "Final constraint: output exactly 1 existing mistake from the validated jab sheet and nothing else."
      : "Final constraint: output exactly 1 existing mistake from the validated cross sheet and nothing else."
    : isCombination && context.action === "focusPoints"
      ? "Final constraint: output exactly 1 plain focus point and nothing else. Do not add labels, combination names, metadata, or the full knowledge sheet."
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
        "Return only the integer index of exactly 1 allowed response, and nothing else.",
        "Never write the response itself. Never paraphrase, merge, interpret, correct, or invent information.",
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
          ? "This is combination coaching. Use the documented technique entries in sequence, but never output combination names, technique metadata, or labels such as 'Validated combination:'."
          : "Answer only about the focus technique. Do not explain another technique in the exercise unless explicitly requested.",
        validatedKnowledge,
        finalActionConstraint,
        `Current workout: ${workoutContext}`,
        "Allowed responses (select exactly one index):",
        ...candidateResponses.map((response, index) => `${index}: ${response}`),
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
    if (context.action === "technicalTips") return context.knowledge.flatMap((item) => item.principles.slice(0, 2)).slice(0, 3);
    if (context.action === "commonMistakes") return context.knowledge.flatMap((item) => item.commonMistakes.slice(0, 2).map((point) => `For the ${item.technique}, ${point.charAt(0).toLocaleLowerCase()}${point.slice(1)}`)).slice(0, 3);
    if (context.action === "focusPoints") {
      return context.knowledge.flatMap((item) => item.focusPoints.slice(0, 2)).slice(0, 3);
    }
    return context.knowledge.flatMap((item) => item.combinations.slice(0, 2).map((combination) => combination.role)).slice(0, 3);
  }
  if (knowledge) {
    if (context.action === "technicalTips") return knowledge.principles.slice(0, 3);
    if (context.action === "commonMistakes") return knowledge.commonMistakes.slice(0, 3);
    if (context.action === "focusPoints") return knowledge.focusPoints.slice(0, 3);
    return [knowledge.explanation, ...knowledge.combinations.slice(0, 2).map((combination) => combination.role)].slice(0, 3);
  }
  const techniqueNames = context.techniques.map((technique) => technique.name).join(", ");
  if (context.action === "explanation") return [context.exercise.description || `Work on ${context.exercise.title} with control.`];
  if (context.action === "technicalTips") return [context.exercise.help || `Stay precise and controlled on ${techniqueNames || context.exercise.title}.`];
  if (context.action === "commonMistakes") return ["Avoid rushing, dropping your guard, or sacrificing precision for speed."];
  return [`Stay focused on posture, breathing, and returning to guard during ${context.exercise.title}.`];
}

export function getFallbackCoachResponse(context: CoachGenerationContext) {
  const responses = getFallbackCoachItems(context);
  return responses[Math.floor(Math.random() * responses.length)] || "Stay precise and controlled.";
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
    .replace(/\b(?:focus\s+points?|focus)\s*:\s*/gi, "")
    .replace(/\bvalidated\s+combination\s*:\s*[A-Z][A-Z–-]*(?:\s*\/\s*[A-Z][A-Z–-]*)?/gi, "")
    .replace(/\bvalidated\s+technique\s*:\s*(?:JAB|CROSS)\s*:?\s*/gi, "")
    .replace(/\btransition\s*:\s*/gi, "")
    .replace(/\b(?:JAB|CROSS)\s*:\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function selectGeneratedCandidate(value: string, candidates: string[]) {
  // Small browser models sometimes add a newline or a short assistant label
  // despite the strict prompt. Accept the first valid index they emit.
  const indexes = [...value.matchAll(/\b(\d+)\b/g)].map((match) => Number(match[1]));
  const index = indexes.find((candidate) => Number.isInteger(candidate) && candidate >= 0 && candidate < candidates.length);
  if (index === undefined) throw new Error("Coach returned an invalid response selection");
  return candidates[index];
}

async function generateRemoteCoachResponse(context: CoachGenerationContext, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: buildCoachMessages(context),
        candidates: getCoachCandidateResponses(context),
      }),
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({})) as { response?: string; error?: string };
    if (!response.ok) throw new Error(payload.error || `Coach API request failed (${response.status})`);
    if (!payload.response) throw new Error("Coach API returned an empty response");
    return payload.response;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function generateCoachResponse(context: CoachGenerationContext, timeoutMs = 25_000) {
  if (!context.knowledge.length) throw new Error("No validated coach knowledge is available for this technique");
  // The remote API is the primary generator. The UI catches any API error
  // and displays the validated local response, so no API key is required for
  // the application to remain usable.
  return generateRemoteCoachResponse(context, timeoutMs);
}

export function resetCoachEngineForTests() {
  generatorPromise = null;
  generatorDevice = "wasm";
}
