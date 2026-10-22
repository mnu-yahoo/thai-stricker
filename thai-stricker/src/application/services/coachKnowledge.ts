export type CoachKnowledge = {
  technique: string;
  discipline: "Muay Thai";
  stance: string;
  source: { title: string; pages: number[]; status: "validated-against-source" };
  additionalSources?: { title: string; pages: number[]; status: "validated-against-source" }[];
  webSources?: string[];
  scope: string;
  criticalGuardCue: string;
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
  }, {
    title: "Muay Thai: The Art of Fighting",
    pages: [44],
    status: "validated-against-source",
  }],
  webSources: [
    "https://evolve-mma.com/blog/the-4-muay-thai-punches-you-need-to-know/",
    "https://evolve-mma.com/blog/how-to-throw-a-stronger-and-more-powerful-jab/",
    "https://evolve-mma.com/blog/the-complete-muay-thai-beginners-guide/",
    "https://evolve-mma.com/blog/16-basic-muay-thai-combinations-you-should-master-first/",
  ],
  scope: "Use the front-hand straight punch guidance for the jab. Do not apply rear-hand straight punch targets to the jab.",
  criticalGuardCue: "Keep the rear elbow close to the jaw. Keep the front elbow down for as long as possible, rotate it only just before the strike, then return it down as the arm returns to guard.",
  principles: [
    "Use the jab to disrupt timing, measure distance, and prepare follow-up techniques.",
    "Use the jab to create space, occupy the opponent's line of sight, and draw a defensive reaction.",
    "Treat the jab as a fast, low-commitment entry that can set up punches, kicks, or a change of level.",
    "Advance while striking when the distance allows it.",
    "From the fight stance, step forward with the front foot when needed and punch in a straight line.",
    "Punch straight toward the target with the lead hand, aiming at the nose, chin, or eyes.",
    "Launch the punch directly from the guard position.",
    "Keep the elbow pointed down for as long as possible during the extension, then return to the guard and stance.",
    "Bring the lead shoulder slightly forward to protect the cheek and chin.",
    "Keep the rear hand close to the cheek.",
    "Turn the hips and shoulder and shift the weight slightly forward without losing balance.",
    "Rotate the fist down shortly before impact while keeping the wrist aligned.",
    "Keep the stance balanced and slightly bladed, with the lead shoulder higher and the weight ready to move.",
    "Pull the rear shoulder back as the lead arm extends instead of pushing the punch forward.",
    "Strike with the first two knuckles aligned with the wrist and shoulder.",
    "Return to the Muay Thai guard after the strike.",
  ],
  commonMistakes: [
    "Dropping the rear hand while throwing the jab.",
    "Letting the rear elbow move away from the jaw or lifting the front elbow too early. Keep the rear elbow close to the jaw, keep the front elbow down until just before the strike, and return it down with the arm to guard.",
    "Leaving the chin or lead cheek exposed.",
    "Pushing the punch instead of using a quick snapping motion.",
    "Letting the elbow flare out or losing wrist alignment.",
    "Losing balance while advancing.",
    "Forgetting to return to guard after extension.",
  ],
  focusPoints: [
    "Keep the feet stable and the posture balanced.",
    "Keep the lead shoulder slightly raised.",
    "Keep the elbow down for as long as possible before returning to the guard and stance.",
    "Keep the rear hand close to the cheek.",
    "Coordinate the front foot, hip, shoulder, and fist as one controlled action.",
    "Rotate the fist shortly before impact, not at the start of the punch.",
    "Prioritize accuracy before power.",
    "Bring the fist quickly back to guard.",
  ],
  explanation: "The jab is a quick front-hand straight punch used to disrupt timing, measure distance, make contact, and prepare follow-up actions. It should be explosive but controlled, with the hand returning quickly to guard.",
  variations: ["From a stationary stance.", "While stepping forward.", "Double or triple jab to create space.", "Body jab to change levels.", "Switch jab using a stance switch.", "As a range-finding or timing-disrupting jab.", "Before a follow-up punch, kick, teep, or combination."],
  safetyNote: "Start slowly and prioritize balance, alignment, and returning to guard.",
}];

export function getCoachKnowledgeForTechniqueNames(names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toLocaleUpperCase());
  return coachKnowledge.filter((entry) => normalizedNames.includes(entry.technique));
}
