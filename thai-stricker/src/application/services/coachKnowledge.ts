export type CoachKnowledge = {
  technique: string;
  discipline: "Muay Thai";
  stance: string;
  source: { title: string; pages: number[]; status: "validated-against-source" };
  principles: string[];
  commonMistakes: string[];
  focusPoints: string[];
  explanation: string;
  variations: string[];
  safetyNote: string;
};

export const coachKnowledge: CoachKnowledge[] = [{
  technique: "JAB",
  discipline: "Muay Thai",
  stance: "Orthodox stance, left hand forward",
  source: {
    title: "Mastering Muay Thai Kick-Boxing - MMA-Proven Techniques",
    pages: [35, 36],
    status: "validated-against-source",
  },
  principles: [
    "Advance while striking when the distance allows it.",
    "Punch straight toward eye level with the lead hand.",
    "Launch the punch directly from the guard position.",
    "Bring the lead shoulder slightly forward to protect the cheek and chin.",
    "Keep the rear hand close to the cheek.",
    "Strike with the first two knuckles aligned with the wrist and shoulder.",
    "Return to the Muay Thai guard after the strike.",
  ],
  commonMistakes: [
    "Dropping the rear hand while throwing the jab.",
    "Leaving the chin or lead cheek exposed.",
    "Pushing the punch instead of using a quick snapping motion.",
    "Losing balance while advancing.",
    "Forgetting to return to guard after extension.",
  ],
  focusPoints: [
    "Keep the feet stable and the posture balanced.",
    "Keep the lead shoulder slightly raised.",
    "Keep the rear hand close to the cheek.",
    "Prioritize accuracy before power.",
    "Bring the fist quickly back to guard.",
  ],
  explanation: "The jab is a quick, direct strike used to make contact, measure distance, and set up follow-up actions.",
  variations: ["From a stationary stance.", "While advancing.", "From different movement directions depending on distance and positioning."],
  safetyNote: "Start slowly and prioritize balance, alignment, and returning to guard.",
}];

export function getCoachKnowledgeForTechniqueNames(names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toLocaleUpperCase());
  return coachKnowledge.filter((entry) => normalizedNames.includes(entry.technique));
}
