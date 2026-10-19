import type { Exercise } from "../entities/exercise";

export const normalizeExerciseName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");

export function assertExerciseCollectionIntegrity(exercises: Exercise[], techniqueIds: Set<string>) {
  const exerciseIds = new Set<string>();
  const names = new Set<string>();

  for (const exercise of exercises) {
    const name = normalizeExerciseName(exercise.title);
    if (exerciseIds.has(exercise.id)) throw new Error(`Duplicate exercise ID: ${exercise.id}`);
    if (names.has(name)) throw new Error(`An exercise named “${exercise.title.trim()}” already exists.`);
    if (new Set(exercise.techniqueIds).size !== exercise.techniqueIds.length) throw new Error(`The techniques for “${exercise.title}” are duplicated.`);
    for (const id of exercise.techniqueIds) if (!techniqueIds.has(id)) throw new Error(`Unknown technique: ${id}`);
    exerciseIds.add(exercise.id);
    names.add(name);
  }
}
