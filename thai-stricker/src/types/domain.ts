export type ExerciseTarget =
  | { type: "duration"; seconds: number }
  | { type: "reps"; reps: number };

export type Exercise = {
  id: string;
  title: string;
  description: string;
  help: string;
  category: string;
  imageUri?: string;
  target: ExerciseTarget;
  techniqueIds: string[];
};

export type WorkoutDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type WorkoutCategory =
  | "Fundamentals"
  | "Striking"
  | "Defense"
  | "Conditioning"
  | "Footwork"
  | "Strength";

export type WorkoutExercise = Omit<Exercise, "techniqueIds"> & { techniqueIds?: string[] };

export type Workout = {
  id: string;
  title: string;
  description: string;
  difficulty: WorkoutDifficulty;
  category: WorkoutCategory;
  totalDurationMinutes: number;
  restSecondsBetweenExercises: number;
  exercises: WorkoutExercise[];
  lastDoneDate?: string;
};

export type TechniqueCategory =
  | "Muay Thai techniques"
  | "Stretching Techniques"
  | "Strength Techniques";

export type Technique = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: TechniqueCategory;
  subCategory: string;
};

export type PlannedWorkoutDay = {
  dayDate: string;
  dayLabel: string;
  workoutId: string;
  workoutTitle: string;
};

export type WeeklyWorkoutPlan = {
  id: string;
  weekStartDate: string;
  weekNumber: number;
  year: number;
  requiredTrainingDays: number;
  plannedDays: PlannedWorkoutDay[];
  source: "web" | "sqlite" | "mock";
};

export type WorkoutLogEntry = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  completedAt: string;
  completedDate: string;
  exerciseCount: number;
  completedExerciseCount: number;
  skippedExerciseCount: number;
  totalDurationMinutes: number;
  source: "web" | "sqlite" | "mock";
};

export type CoachTip = {
  exerciseId: string;
  exerciseTitle: string;
  shortTip: string;
  technicalTips: string[];
  commonMistakes: string[];
  focusPoints: string[];
  explanation: string;
};

export type CalendarWorkoutDay = {
  date: string;
  status: "completed" | "planned" | "missed";
  workoutName: string;
};

export type MonthlySummary = {
  completedWorkouts: number;
  plannedWorkouts: number;
  missedWorkouts: number;
};

export type PersistedSettings = {
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  trainingDaysPerWeek: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  maxExercisesPerWorkout: 5 | 10 | 15 | 20;
  numberOfExercisesPerPage: 3 | 6 | 9 | 12;
  defaultRepsExerciseDurationMinutes: 1 | 2 | 3 | 4 | 5;
  themePreference: "Light" | "Dark";
};

export type AppDataSnapshot = {
  settings: PersistedSettings;
  techniques: Technique[];
  availableExercises: Exercise[];
  workouts: Workout[];
  weeklyWorkoutPlans: WeeklyWorkoutPlan[];
  workoutLogs: WorkoutLogEntry[];
  coachTips: CoachTip[];
  calendarWorkoutDays: CalendarWorkoutDay[];
  monthlySummary: MonthlySummary;
};

export type ThaiStrickerDataFileV1 = AppDataSnapshot & {
  schemaVersion: 1;
  exportedAt: string;
};

export type WorkoutImportPayload = Omit<Workout, "id" | "totalDurationMinutes" | "lastDoneDate">;

export const WORKOUT_DIFFICULTIES: WorkoutDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  "Fundamentals",
  "Striking",
  "Defense",
  "Conditioning",
  "Footwork",
  "Strength",
];
