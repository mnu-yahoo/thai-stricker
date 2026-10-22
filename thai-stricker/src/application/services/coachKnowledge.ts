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
  criticalGuardCue: "Keep the rear elbow down to help protect the upper torso. Keep the rear hand close to the cheek to protect against a counter from the opposite side while the jab is extended, including a simultaneous or early counter. Keep the front elbow down for as long as possible, rotate it only just before the strike, then return it down as the arm returns to guard.",
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
    "Keep the rear elbow down to protect the upper torso and the rear hand close to the cheek to protect against a counter from the opposite side while the jab is extended.",
    "Turn the hips and shoulder and shift the weight slightly forward without losing balance.",
    "Rotate the fist down shortly before impact while keeping the wrist aligned.",
    "Keep the stance balanced and slightly bladed, with the lead shoulder higher and the weight ready to move.",
    "Pull the rear shoulder back as the lead arm extends instead of pushing the punch forward.",
    "Strike with the first two knuckles aligned with the wrist and shoulder.",
    "Return to the Muay Thai guard after the strike.",
  ],
  commonMistakes: [
    "Do not drop the rear hand.",
    "Do not expose the chin or lead cheek.",
    "Snap the punch instead of pushing it.",
    "Do not forget to return to guard after the strike.",
  ],
  focusPoints: [
    "Stay stable and balanced.",
    "Keep the lead shoulder slightly raised.",
    "Keep the rear elbow down to protect the upper torso and the rear hand close to the cheek to protect against a simultaneous or early counter.",
    "Keep the elbow down and punch on a straight path.",
    "Use coordination between the foot, hip, shoulder, and fist.",
    "Rotate the front fist shortly before impact.",
    "Prefer accuracy before power.",
    "Do not forget to quickly return to guard.",
  ],
  explanation: "Focus on maintaining a stable posture to avoid falling. Keep the rear hand close to the cheek to avoid counter attacks and stay protected. Use the jab to disrupt the opponent's timing, measure distance, make contact, and prepare follow-up actions. The jab should be explosive but controlled, with the hand returning quickly to guard. The jab is a quick front-hand straight punch; keep it direct to the target.",
  variations: ["From a stationary stance.", "While stepping forward.", "Double or triple jab to create space.", "Body jab to change levels.", "Switch jab using a stance switch.", "As a range-finding or timing-disrupting jab.", "Before a follow-up punch, kick, teep, or combination."],
  safetyNote: "Start slowly and prioritize balance, alignment, and returning to guard.",
}];

export function getCoachKnowledgeForTechniqueNames(names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toLocaleUpperCase());
  return coachKnowledge.filter((entry) => normalizedNames.includes(entry.technique));
}
