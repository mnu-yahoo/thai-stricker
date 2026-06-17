export type MockExerciseTarget =
  | { type: "duration"; seconds: number }
  | { type: "reps"; reps: number };

export type MockExercise = {
  id: string;
  title: string;
  description: string;
  help: string;
  target: MockExerciseTarget;
};

export type MockWorkoutDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type MockWorkoutCategory =
  | "Fundamentals"
  | "Striking"
  | "Defense"
  | "Conditioning"
  | "Footwork";

export type MockWorkout = {
  id: string;
  title: string;
  description: string;
  difficulty: MockWorkoutDifficulty;
  category: MockWorkoutCategory;
  totalDurationMinutes: number;
  restSecondsBetweenExercises: number;
  exercises: MockExercise[];
  lastDoneDate?: string;
};

export const mockWorkouts: MockWorkout[] = [
  {
    id: "workout-001",
    title: "Muay Thai Fundamentals",
    description: "Build a clean base with stance, jab-cross rhythm, teep timing, and low kick mechanics.",
    difficulty: "Beginner",
    category: "Fundamentals",
    totalDurationMinutes: 35,
    restSecondsBetweenExercises: 30,
    exercises: [
      {
        id: "exercise-001",
        title: "Stance and Guard Hold",
        description: "Set your stance, keep elbows tight, and stay balanced.",
        help: "Keep your chin tucked and weight centered over both feet.",
        target: { type: "duration", seconds: 60 },
      },
      {
        id: "exercise-002",
        title: "Jab-Cross Flow",
        description: "Throw relaxed jab-cross combinations with full recoil.",
        help: "Reset your guard after every cross before the next rep.",
        target: { type: "reps", reps: 24 },
      },
      {
        id: "exercise-003",
        title: "Rear Teep Control",
        description: "Practice balance, chamber, and straight-line extension.",
        help: "Drive the hips forward and return the foot under control.",
        target: { type: "reps", reps: 16 },
      },
    ],
  },
  {
    id: "workout-002",
    title: "Boxing Basics",
    description: "Sharpen hand combinations, guard recovery, and simple angle exits.",
    difficulty: "Beginner",
    category: "Striking",
    totalDurationMinutes: 28,
    restSecondsBetweenExercises: 25,
    exercises: [
      {
        id: "exercise-004",
        title: "Slip and Return",
        description: "Move your head off the center line and answer with a jab.",
        help: "Keep the slip small so you stay ready to punch back.",
        target: { type: "duration", seconds: 45 },
      },
      {
        id: "exercise-005",
        title: "One-Two Pivot",
        description: "Punch then pivot off to create a better angle.",
        help: "Turn on the lead foot and keep your base underneath you.",
        target: { type: "reps", reps: 20 },
      },
      {
        id: "exercise-006",
        title: "Lead Hook Mechanics",
        description: "Work on elbow alignment and hip rotation for the hook.",
        help: "Do not let the elbow drop below the line of the fist.",
        target: { type: "reps", reps: 18 },
      },
    ],
  },
  {
    id: "workout-003",
    title: "Low Kick Flow",
    description: "Link punch entries into low kicks with balance and clean recovery.",
    difficulty: "Intermediate",
    category: "Footwork",
    totalDurationMinutes: 32,
    restSecondsBetweenExercises: 35,
    exercises: [
      {
        id: "exercise-007",
        title: "Step-In Cross",
        description: "Enter range with a committed cross while staying balanced.",
        help: "Land the lead foot first so the rear side can drive through.",
        target: { type: "reps", reps: 16 },
      },
      {
        id: "exercise-008",
        title: "Cross to Low Kick",
        description: "Throw a rear cross and follow immediately with a low kick.",
        help: "Let the punch rotate your hips into the kick rather than forcing it.",
        target: { type: "reps", reps: 14 },
      },
      {
        id: "exercise-009",
        title: "Kick Recovery Check",
        description: "Reset stance quickly after the kick and be ready to defend.",
        help: "Bring the kicking leg back sharply and re-establish your guard.",
        target: { type: "duration", seconds: 50 },
      },
    ],
  },
  {
    id: "workout-004",
    title: "Defense Basics",
    description: "Train shell defense, checking kicks, and simple counters from safe positions.",
    difficulty: "Intermediate",
    category: "Defense",
    totalDurationMinutes: 30,
    restSecondsBetweenExercises: 30,
    exercises: [
      {
        id: "exercise-010",
        title: "High Shell Reset",
        description: "Cover safely against straight punches and return to stance.",
        help: "Keep the elbows connected to the ribs while you absorb impact.",
        target: { type: "duration", seconds: 45 },
      },
      {
        id: "exercise-011",
        title: "Lead Leg Check",
        description: "Raise the shin to check and land back in stance cleanly.",
        help: "Turn the knee outward and keep the supporting foot planted.",
        target: { type: "reps", reps: 18 },
      },
      {
        id: "exercise-012",
        title: "Check to Cross Counter",
        description: "Defend the kick and answer back with a straight punch.",
        help: "Counter only after your base is stable again.",
        target: { type: "reps", reps: 14 },
      },
    ],
  },
];
