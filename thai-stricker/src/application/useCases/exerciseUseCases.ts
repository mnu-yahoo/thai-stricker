import type { Exercise } from "../../domain/entities/exercise";

export type CreateExerciseInput = Omit<Exercise, "id">;

function makeExerciseId() {
  return `exercise-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

export function createExercise(input: CreateExerciseInput, existingId?: string): Exercise {
  if (!input.title.trim()) throw new Error("An exercise name is required.");
  if (!input.techniqueIds.length) throw new Error("An exercise must contain at least one technique.");

  return {
    ...input,
    id: existingId ?? makeExerciseId(),
    title: input.title.trim(),
    description: input.description.trim(),
    help: input.help.trim(),
    category: input.category.trim(),
    techniqueIds: [...input.techniqueIds],
  };
}
