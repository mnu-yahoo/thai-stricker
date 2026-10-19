import type { Workout } from "../../domain/entities/workout";
import type { WorkoutLogEntry } from "../../domain/entities/workoutLog";

export interface WorkoutSessionRepository {
  addWorkoutLog(value: WorkoutLogEntry): Promise<void>;
}

export type WorkoutSessionRecap = Omit<WorkoutLogEntry, "id" | "completedAt" | "source">;

export function createWorkoutSessionRecap(
  workout: Workout,
  completedExerciseCount: number,
  skippedExerciseCount: number,
  startedAt: number,
  completedAt = new Date(),
): WorkoutSessionRecap {
  return {
    workoutId: workout.id,
    workoutTitle: workout.title,
    exerciseCount: workout.exercises.length,
    completedExerciseCount,
    skippedExerciseCount,
    totalDurationMinutes: Math.max(1, Math.ceil((completedAt.getTime() - startedAt) / 60000)),
    completedDate: completedAt.toISOString().slice(0, 10),
  };
}

export async function recordWorkoutSession(
  repository: WorkoutSessionRepository,
  recap: WorkoutSessionRecap,
  completedAt = new Date(),
) {
  const log: WorkoutLogEntry = {
    ...recap,
    id: `log-${crypto.randomUUID()}`,
    completedAt: completedAt.toISOString(),
    source: "web",
  };
  await repository.addWorkoutLog(log);
}
