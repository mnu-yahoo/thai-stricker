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
  combinations: {
    name: string;
    sequence: string[];
    role: string;
    transition: string;
    keyCues: string[];
    commonMistakes: string[];
  }[];
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
  combinations: [{
    name: "JAB–CROSS",
    sequence: ["JAB", "CROSS"],
    role: "Use the jab to measure distance, disrupt timing, and create the reaction or opening for the rear-hand cross.",
    transition: "As the jab returns, stay balanced and drive from the rear foot into the cross without dropping the rear hand or exposing the chin.",
    keyCues: ["Keep the rear hand close to the cheek during the jab.", "Keep the lead hand protecting the chin as the cross starts.", "Return to guard after the cross."],
    commonMistakes: ["Pausing too long between the jab and cross.", "Dropping the lead hand during the cross.", "Forgetting to return to guard after the combination."],
  }, {
    name: "JAB–CROSS–HOOK",
    sequence: ["JAB", "CROSS", "HOOK"],
    role: "Use the jab and cross to create a reaction before continuing with the hook.",
    transition: "Complete the cross with balance and recover the guard before rotating into the hook.",
    keyCues: ["Keep the combination continuous but controlled.", "Maintain balance through each weight transfer.", "Do not sacrifice guard position for speed."],
    commonMistakes: ["Rushing the hook before the cross is controlled.", "Overcommitting and losing balance.", "Leaving the hands low after the final punch."],
  }],
  safetyNote: "Start slowly and prioritize balance, alignment, and returning to guard.",
}, {
  technique: "CROSS",
  discipline: "Muay Thai",
  stance: "Orthodox stance, right hand rear",
  source: {
    title: "Muay Thai: The Art of Fighting",
    pages: [44, 45],
    status: "validated-against-source",
  },
  additionalSources: [{
    title: "Muay Thai Training Exercises",
    pages: [136, 137],
    status: "validated-against-source",
  }],
  webSources: [
    "https://evolve-mma.com/blog/the-4-muay-thai-punches-you-need-to-know/",
    "https://evolve-mma.com/blog/the-complete-muay-thai-beginners-guide/",
    "https://evolve-mma.com/blog/16-basic-muay-thai-combinations-you-should-master-first/",
  ],
  scope: "Use the rear-hand straight punch as a powerful direct punch, commonly thrown after the jab. Do not apply front-hand jab-specific cues to the cross.",
  criticalGuardCue: "Keep the lead hand close to the chin while the rear hand is extended to protect against counters. Keep the rear elbow down and aligned with the punch, then return the rear hand quickly to guard after impact.",
  principles: [
    "Use the cross as the rear-hand straight punch, commonly thrown as the second punch after the jab.",
    "Start from a stable Muay Thai guard with the elbows down and both hands up.",
    "Drive from the rear foot and rotate the rear hip, waist, and shoulder together.",
    "Transfer the weight forward without falling or overcommitting.",
    "Punch directly toward the target on a straight path.",
    "Rotate the rear fist shortly before impact with the palm facing down and the wrist aligned.",
    "Keep the lead hand protecting the chin while the rear hand is extended.",
    "Do not pull the rear hand backward before punching or telegraph the strike.",
    "Return the rear hand quickly to the guard after impact.",
    "Use the cross as a power shot, follow-up punch, or setup for kicks and combinations.",
  ],
  commonMistakes: [
    "Do not drop the lead hand while punching.",
    "Do not pull the rear hand backward and telegraph the punch.",
    "Do not over-rotate or lose balance when transferring weight.",
    "Do not push the punch; drive it from the rear foot and hip.",
    "Do not punch across the target instead of using a direct path.",
    "Do not forget to return the rear hand to guard after impact.",
  ],
  focusPoints: [
    "Stay stable and balanced.",
    "Pivot the rear foot.",
    "Coordinate the rear foot, hip, shoulder, and fist.",
    "Keep the lead hand close to the chin.",
    "Keep the rear elbow down and aligned with the punch.",
    "Punch on a direct path.",
    "Rotate the rear fist shortly before impact.",
    "Return quickly to guard.",
  ],
  explanation: "Keep a stable defensive stance with the lead hand protecting the chin. Drive the rear-hand straight punch from the rear foot through the hip, waist, and shoulder, rotate the fist shortly before contact, and return quickly to guard. The cross is a powerful follow-up to the jab and can set up kicks or other combinations.",
  variations: [
    "From a stationary stance.",
    "After a jab in a one-two combination.",
    "After a feint.",
    "To the body.",
    "Followed by a hook.",
    "Followed by a rear kick or switch kick.",
  ],
  combinations: [{
    name: "JAB–CROSS",
    sequence: ["JAB", "CROSS"],
    role: "Use the cross as the power punch after the jab has measured distance or drawn a reaction.",
    transition: "As the jab returns, drive from the rear foot and rotate the rear hip, waist, and shoulder into the cross while keeping the lead hand near the chin.",
    keyCues: ["Keep the lead hand protecting the chin.", "Transfer weight without falling forward.", "Return the rear hand quickly to guard."],
    commonMistakes: ["Throwing the cross without using the jab to create a reaction.", "Dropping the lead hand during the cross.", "Over-rotating and losing balance."],
  }, {
    name: "JAB–CROSS–HOOK",
    sequence: ["JAB", "CROSS", "HOOK"],
    role: "Use the cross to continue the opening created by the jab before adding the hook.",
    transition: "Finish the cross balanced, recover the guard, and rotate into the hook without rushing the transition.",
    keyCues: ["Keep the lead hand active through the cross.", "Coordinate each weight transfer.", "Return to guard after the final punch."],
    commonMistakes: ["Pausing between the jab and cross.", "Rushing the hook while off balance.", "Leaving the guard open after the combination."],
  }],
  safetyNote: "Start slowly and prioritize balance, alignment, controlled rotation, and returning to guard. Avoid overextending the shoulder or falling forward.",
}];

export function getCoachKnowledgeForTechniqueNames(names: string[]) {
  const normalizedNames = names.map((name) => name.trim().toLocaleUpperCase());
  return coachKnowledge.filter((entry) => normalizedNames.includes(entry.technique));
}
