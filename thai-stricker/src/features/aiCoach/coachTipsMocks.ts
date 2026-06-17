export type MockCoachTip = {
  exerciseId: string;
  exerciseTitle: string;
  shortTip: string;
  technicalTips: string[];
  commonMistakes: string[];
  focusPoints: string[];
  explanation: string;
};

export const mockCoachTips: MockCoachTip[] = [
  {
    exerciseId: "coach-stance-and-guard-hold",
    exerciseTitle: "Stance and Guard Hold",
    shortTip: "Keep your weight centered so your guard stays calm and ready.",
    technicalTips: [
      "Set your feet before raising the hands into guard.",
      "Keep the chin tucked without hunching the shoulders.",
      "Stay light enough to move without letting the heels drift too wide.",
    ],
    commonMistakes: [
      "Leaning too far onto the lead leg.",
      "Letting the elbows flare away from the ribs.",
      "Holding the stance so stiffly that breathing becomes shallow.",
    ],
    focusPoints: ["Balance", "Guard position", "Relaxed posture"],
    explanation:
      "A stable stance gives every strike and defense a cleaner base. Focus on staying stacked, balanced, and ready to move in any direction.",
  },
  {
    exerciseId: "coach-jab-cross-flow",
    exerciseTitle: "Jab-Cross Flow",
    shortTip: "Snap both punches back to guard before the next rep starts.",
    technicalTips: [
      "Turn the shoulder into each straight punch without lifting it to the ear.",
      "Let the rear hip rotate through the cross instead of reaching with the arm.",
      "Recover to stance before restarting the combination.",
    ],
    commonMistakes: [
      "Leaving the cross extended too long.",
      "Squaring the stance after the rear hand.",
      "Dropping the non-punching hand during the combination.",
    ],
    focusPoints: ["Straight lines", "Hip rotation", "Fast recoil"],
    explanation:
      "The jab-cross should feel smooth and repeatable. Good rhythm comes from clean extension, full recoil, and staying balanced after each punch.",
  },
  {
    exerciseId: "coach-rear-teep-control",
    exerciseTitle: "Rear Teep Control",
    shortTip: "Lift the knee first and return the foot quickly after extension.",
    technicalTips: [
      "Chamber the rear knee before pushing the hips forward.",
      "Keep both hands high as the leg extends.",
      "Place the kicking foot back under control instead of letting it fall.",
    ],
    commonMistakes: [
      "Swinging the leg up without a chamber.",
      "Leaning too far backward during the kick.",
      "Leaving the kicking leg hanging after contact.",
    ],
    focusPoints: ["Chamber", "Posture", "Fast recovery"],
    explanation:
      "The rear teep is strongest when it travels straight and returns cleanly. Balance and recovery matter as much as the push itself.",
  },
  {
    exerciseId: "coach-slip-and-return",
    exerciseTitle: "Slip and Return",
    shortTip: "Keep the slip small so you can answer immediately with balance.",
    technicalTips: [
      "Move the head just off the center line instead of making a big bend.",
      "Keep the eyes forward while the shoulders rotate lightly.",
      "Return to stance before firing the counter jab.",
    ],
    commonMistakes: [
      "Dipping too low and losing posture.",
      "Crossing the feet while trying to move the head.",
      "Throwing the return punch before the base is settled.",
    ],
    focusPoints: ["Compact movement", "Vision", "Counter timing"],
    explanation:
      "A good slip removes the target without taking you out of position. The smaller and cleaner the motion, the easier the return attack becomes.",
  },
  {
    exerciseId: "coach-one-two-pivot",
    exerciseTitle: "One-Two Pivot",
    shortTip: "Finish the punches first, then turn out on a stable lead foot.",
    technicalTips: [
      "Land the one-two with your base still underneath you.",
      "Use the lead foot as the turning point for the pivot.",
      "Bring the rear foot around so the stance stays ready after the turn.",
    ],
    commonMistakes: [
      "Pivoting before the cross has fully finished.",
      "Standing too tall during the turn.",
      "Dragging the rear foot and ending up square.",
    ],
    focusPoints: ["Angle change", "Foot placement", "Stance recovery"],
    explanation:
      "The one-two pivot creates a safer angle after straight punches. The move works best when the feet turn together and the stance stays organized.",
  },
  {
    exerciseId: "coach-lead-hook-mechanics",
    exerciseTitle: "Lead Hook Mechanics",
    shortTip: "Turn the hip and shoulder together so the hook stays compact.",
    technicalTips: [
      "Keep the elbow roughly level with the fist on impact.",
      "Rotate through the lead foot to connect the hook to the floor.",
      "Bring the hand right back to the cheek after the punch.",
    ],
    commonMistakes: [
      "Casting the hook in a wide arc.",
      "Dropping the rear hand while punching.",
      "Over-rotating and losing the stance after the shot.",
    ],
    focusPoints: ["Compact arc", "Lead-side rotation", "Guard return"],
    explanation:
      "The lead hook should be short and sharp rather than wide and swinging. Clean rotation and quick recoil make the punch more reliable.",
  },
  {
    exerciseId: "coach-step-in-cross",
    exerciseTitle: "Step-In Cross",
    shortTip: "Let the step carry you into range before the rear hand drives through.",
    technicalTips: [
      "Step with control so the base is set before the cross lands.",
      "Rotate the rear hip through the line of the punch.",
      "Keep the lead hand home while the rear hand fires.",
    ],
    commonMistakes: [
      "Reaching with the upper body before the feet arrive.",
      "Crossing the feet on the entry.",
      "Letting momentum pull you past your stance.",
    ],
    focusPoints: ["Range entry", "Rear-side drive", "Base under pressure"],
    explanation:
      "The step-in cross works when footwork and punching arrive together. Good timing keeps the strike long without making the body overcommit.",
  },
  {
    exerciseId: "coach-cross-to-low-kick",
    exerciseTitle: "Cross to Low Kick",
    shortTip: "Use the cross rotation to flow directly into the low kick.",
    technicalTips: [
      "Finish the rear cross with your hips already beginning to turn.",
      "Reset the guard as the kicking leg comes through.",
      "Bring the leg back quickly so you can defend after the kick.",
    ],
    commonMistakes: [
      "Pausing between the punch and the kick.",
      "Throwing the kick only with the leg and not the hip turn.",
      "Dropping both hands during the transition.",
    ],
    focusPoints: ["Combination flow", "Hip carryover", "Recovery"],
    explanation:
      "This combination feels smoother when the cross naturally winds the hips into the kick. Think about one connected motion rather than two separate attacks.",
  },
  {
    exerciseId: "coach-kick-recovery-check",
    exerciseTitle: "Kick Recovery Check",
    shortTip: "Bring the leg back fast and rebuild your stance before anything else.",
    technicalTips: [
      "Return the kicking leg on the same line instead of letting it swing wide.",
      "Reconnect the guard before preparing the next action.",
      "Land balanced so a defensive check is available immediately.",
    ],
    commonMistakes: [
      "Admiring the kick and delaying recovery.",
      "Landing too narrow and losing balance.",
      "Dropping the hands as the leg returns.",
    ],
    focusPoints: ["Fast recovery", "Stance rebuild", "Defensive readiness"],
    explanation:
      "Good kick recovery is what makes combinations safe and repeatable. The goal is not just to kick well, but to be ready right after the kick ends.",
  },
  {
    exerciseId: "coach-high-shell-reset",
    exerciseTitle: "High Shell Reset",
    shortTip: "Keep the shell tight, then reopen your stance without rushing.",
    technicalTips: [
      "Pin the elbows close to the ribs while the hands stay high.",
      "Absorb in structure instead of reaching out for punches.",
      "Return to a balanced stance before looking to counter.",
    ],
    commonMistakes: [
      "Opening the shell too early.",
      "Lifting the chin while covering.",
      "Trying to counter before posture is restored.",
    ],
    focusPoints: ["Tight structure", "Calm reset", "Safe posture"],
    explanation:
      "The high shell is a safe defensive frame. Its value comes from staying compact under pressure and reopening from a stable base.",
  },
  {
    exerciseId: "coach-lead-leg-check",
    exerciseTitle: "Lead Leg Check",
    shortTip: "Turn the knee outward and stay tall on the supporting leg.",
    technicalTips: [
      "Lift the checking leg with the knee slightly opened out.",
      "Keep the supporting foot rooted so the body stays upright.",
      "Put the checking leg down into stance, not into a stumble.",
    ],
    commonMistakes: [
      "Leaning away too much during the check.",
      "Letting the supporting foot spin out.",
      "Dropping the hands while lifting the leg.",
    ],
    focusPoints: ["Shin angle", "Supporting-leg balance", "Guard discipline"],
    explanation:
      "A clean check is built on posture and timing. The supporting leg and upper-body guard are what make the defense stable.",
  },
  {
    exerciseId: "coach-check-to-cross-counter",
    exerciseTitle: "Check to Cross Counter",
    shortTip: "Counter only after the checked leg lands and the base feels solid.",
    technicalTips: [
      "Complete the check before starting the return punch.",
      "Let the landing reconnect your hips to the floor for the cross.",
      "Keep the lead hand in guard as the rear hand fires back.",
    ],
    commonMistakes: [
      "Punching while still off one leg.",
      "Rushing the counter and falling forward.",
      "Letting the guard open after the check.",
    ],
    focusPoints: ["Landing control", "Counter timing", "Guard stability"],
    explanation:
      "The counter works because the defense put you back in position. Land first, stabilize, then send the cross with clean structure.",
  },
];
