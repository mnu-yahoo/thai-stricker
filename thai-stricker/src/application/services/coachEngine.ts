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
  const primaryTechnique = context.knowledge.find((item) => item.technique === focusTechnique) || context.knowledge[0];
  const isCombination = context.knowledge.length > 1;
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
      `Validated combinations: ${item.combinations.map((combination) => `${combination.name}; role: ${combination.role}; transition: ${combination.transition}; cues: ${combination.keyCues.join(" | ")}; mistakes: ${combination.commonMistakes.join(" | ")}`).join(" || ")}`,
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
    technicalTips: "Select only 2 or 3 validated execution cues across the combination, including the most useful transition cue. Do not list the whole sheets.",
    commonMistakes: "Select only 2 or 3 validated mistakes across the combination. State each mistake with its correction, using only corrections supported by the validated principles.",
    focusPoints: `Output exactly 3 short labeled points for the combination: "Focus point: Stay stable and balanced."; "Validated technique: ${context.knowledge.at(-1)?.technique || "the final technique"}: [use its validated critical guard cue]."; "Transition: [use the documented transition into ${context.knowledge.at(-1)?.technique || "the final technique"}]." Use only the validated values. Do not repeat prompt metadata or list every focus point.`,
    explanation: "Select only 2 or 3 validated points explaining the role of the techniques, their tactical objective, and one relevant variation or follow-up. Do not list the whole sheets.",
  }[context.action] : focusTechnique === "JAB" ? {
    technicalTips: "Select only 2 or 3 concrete execution cues from the validated jab principles, including the critical guard cue when relevant. Explain that rear-hand protection is for a counter, not to disrupt timing. Do not list the whole sheet.",
    commonMistakes: "Select only 2 or 3 of the validated jab mistakes. State each mistake with its correction, using only corrections supported by the validated principles; do not add elbow, stance, balance, or other details.",
    focusPoints: "Select only 2 or 3 short focus points from the validated jab sheet. Choose the points most useful for the requested action; do not list all eight.",
    explanation: "Select only 2 or 3 validated points covering the jab's role, tactical objectives, and one relevant variation or follow-up. Do not list the whole sheet.",
  }[context.action] : {
    technicalTips: "Select only 2 or 3 concrete execution cues from the validated cross principles. Prioritize rear-foot drive, rotation, a direct path, lead-hand protection, or return to guard as relevant. Do not list the whole sheet.",
    commonMistakes: "Select only 2 or 3 validated cross mistakes. State each mistake with its correction, using only corrections supported by the validated principles; do not substitute jab-specific mistakes.",
    focusPoints: "Select only 2 or 3 short focus points from the validated cross sheet. Do not list all eight.",
    explanation: "Select only 2 or 3 validated points covering the cross's role, tactical objectives, and one relevant variation or follow-up. Do not list the whole sheet.",
  }[context.action];
  const finalActionConstraint = context.action === "commonMistakes"
    ? isCombination
      ? "Final constraint: cover the validated mistakes for every technique in the combination and include the key transition mistake."
      : focusTechnique === "JAB"
      ? "Final constraint: output only 2 or 3 validated jab mistakes, each paired with its correction. Do not mention the elbow cue unless it is part of the selected mistake correction."
      : "Final constraint: output only 2 or 3 validated cross mistakes, each paired with its correction. Do not add jab-specific mistakes or unrelated details."
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
        "Answer in English with 2 or 3 short, distinct points or sentences, directly addressing the requested action.",
        "Select only 2 or 3 relevant elements from the validated sheet; do not reproduce the whole sheet.",
        "Do not repeat the same generic advice across different actions. Each action must have a different purpose and wording.",
        "Avoid vague advice such as 'stay focused' or 'maintain balance' unless you explain exactly how.",
        isCombination
          ? `This is combination coaching for ${context.knowledge.map((item) => item.technique).join(" then ")}. Coach the sequence in order, keep each technique's guard cue distinct, and include the transition between techniques. Validated cues: ${context.knowledge.map((item) => `${item.technique}: ${item.criticalGuardCue}`).join(" | ")}`
          : focusTechnique === "JAB"
          ? "For the jab, always apply the critical guard cue exactly: keep the rear elbow down to protect the upper torso; keep the rear hand close to the cheek to protect against a simultaneous or early counter from the opposite side while the jab is extended; keep the front elbow down for as long as possible, rotate it only just before the strike, then return it down as the arm returns to guard. Do not say that the rear hand protects timing, and do not replace this with 'quick elbow movement' or the vague phrase 'elbow pointed down during the strike'."
          : `For the ${focusTechnique}, apply this validated critical guard cue: ${primaryTechnique?.criticalGuardCue || "keep the guard active and return quickly to stance."}`,
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
        `Validated technique: ${finalTechnique?.technique || "Final technique"}: ${finalTechnique?.criticalGuardCue || "Keep the guard active and return quickly to stance."}`,
        `Transition: ${combination?.transition || "Link the techniques smoothly and return to guard after the combination."}`,
      ];
    }
    return context.knowledge.flatMap((item) => [`${item.technique}: ${item.explanation}`]).slice(0, 3);
  }
  if (knowledge) {
    if (context.action === "technicalTips") return knowledge.principles.slice(0, 3);
    if (context.action === "commonMistakes") return knowledge.commonMistakes.slice(0, 3);
    if (context.action === "focusPoints") return knowledge.focusPoints.slice(0, 3);
    return [knowledge.explanation, ...knowledge.variations.slice(0, 2)];
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
