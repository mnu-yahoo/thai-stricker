import type { Exercise, ExerciseDetail } from "./exercise";

export type WorkoutDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type WorkoutCategory = "Fundamentals" | "Striking" | "Defense" | "Conditioning" | "Footwork" | "Strength";

export type WorkoutExercise = {
  exerciseId: string;
  detail: ExerciseDetail;
  id?: string;
  title?: string;
  description?: string;
  help?: string;
  category?: string;
  imageUri?: string;
  techniqueIds?: string[];
};

export type ResolvedWorkoutExercise = WorkoutExercise & Exercise;

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
