export type CoachKnowledge = {
  technique: string;
  discipline: "Muay Thai";
  stance: string;
  source: { title: string; pages: number[]; status: "validated-against-source" };
  additionalSources?: { title: string; pages: number[]; status: "validated-against-source" }[];
  scope: string;
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
  additionalSources: [{
    title: "Muay Thai Training Exercises",
    pages: [136, 137],
    status: "validated-against-source",
  }],
  scope: "Use the front-hand straight punch guidance for the jab. Do not apply rear-hand straight punch targets to the jab.",
  principles: [
    "Use the jab to disrupt timing, measure distance, and prepare follow-up techniques.",
    "Advance while striking when the distance allows it.",
    "From the fight stance, step forward with the front foot when needed and punch in a straight line.",
    "Punch straight toward the target with the lead hand, aiming at the nose, chin, or eyes.",
    "Launch the punch directly from the guard position.",
    "Keep the elbow pointed down during the extension.",
    "Bring the lead shoulder slightly forward to protect the cheek and chin.",
    "Keep the rear hand close to the cheek.",
    "Turn the hips and shoulder and shift the weight slightly forward without losing balance.",
    "Rotate the fist down shortly before impact while keeping the wrist aligned.",
    "Strike with the first two knuckles aligned with the wrist and shoulder.",
    "Return to the Muay Thai guard after the strike.",
  ],
  commonMistakes: [
    "Dropping the rear hand while throwing the jab.",
    "Leaving the chin or lead cheek exposed.",
    "Pushing the punch instead of using a quick snapping motion.",
    "Letting the elbow flare out or losing wrist alignment.",
    "Losing balance while advancing.",
    "Forgetting to return to guard after extension.",
  ],
  focusPoints: [
    "Keep the feet stable and the posture balanced.",
    "Keep the lead shoulder slightly raised.",
    "Keep the elbow down and the punch on a straight path.",
    "Keep the rear hand close to the cheek.",
    "Coordinate the front foot, hip, shoulder, and fist as one controlled action.",
    "Rotate the fist shortly before impact, not at the start of the punch.",
    "Prioritize accuracy before power.",
    "Bring the fist quickly back to guard.",
  ],
  explanation: "The jab is a quick front-hand straight punch used to disrupt timing, measure distance, make contact, and prepare follow-up actions. It should be explosive but controlled, with the hand returning quickly to guard.",
  variations: ["From a stationary stance.", "While stepping forward.", "As a range-finding or timing-disrupting jab.", "Before a follow-up punch or combination."],
  safetyNote: "Start slowly and prioritize balance, alignment, and returning to guard.",
}];

export function getCoachKnowledgeForTechniqueNames(names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toLocaleUpperCase());
  return coachKnowledge.filter((entry) => normalizedNames.includes(entry.technique));
}
