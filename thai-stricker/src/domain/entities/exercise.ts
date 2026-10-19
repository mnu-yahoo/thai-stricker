export type ExerciseDetail =
  | { type: "duration"; seconds: number }
  | { type: "reps"; reps: number };

export type Exercise = {
  id: string;
  title: string;
  description: string;
  help: string;
  category: string;
  imageUri?: string;
  detail: ExerciseDetail;
  techniqueIds: string[];
};
