import type { MockExercise } from "../workouts/workoutMocks";

export function normalizeExerciseName(title: string) {
  return title.trim().replace(/\s+/g, " ").toLowerCase();
}

export function shareExerciseDetails(
  occurrences: MockExercise[],
  library: MockExercise[],
): MockExercise[] {
  const byId = new Map(library.map((exercise) => [exercise.id, exercise]));
  return occurrences.map((occurrence) => {
    const shared = byId.get(occurrence.id);
    return shared ? { ...shared, detail: occurrence.detail } : occurrence;
  });
}
