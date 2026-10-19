import type { WorkoutExercise } from "../entities/workout";

export function calculateWorkoutDuration(exercises: WorkoutExercise[], restSeconds: number, defaultRepsMinutes: number) {
  const workSeconds = exercises.reduce((sum, exercise) => sum + (exercise.detail.type === "duration" ? exercise.detail.seconds : defaultRepsMinutes * 60), 0);
  return Math.ceil((workSeconds + Math.max(0, exercises.length - 1) * restSeconds) / 60);
}
