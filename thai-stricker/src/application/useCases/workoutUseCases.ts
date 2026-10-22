import type { Exercise } from "../../domain/entities/exercise";
import type { Workout, WorkoutExercise } from "../../domain/entities/workout";
import { calculateWorkoutDuration } from "../../domain/rules/workoutRules";

export type WorkoutDraft = Pick<Workout, "title" | "description" | "difficulty" | "category" | "restSecondsBetweenExercises" | "exercises">;

function makeWorkoutId() {
  return `workout-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

export function createWorkout(draft: WorkoutDraft, defaultRepsMinutes: number, existing?: Pick<Workout, "id" | "lastDoneDate">): Workout {
  if (!draft.title.trim()) throw new Error("A workout name is required.");
  if (!draft.exercises.length) throw new Error("A workout must contain at least one exercise.");

  return {
    ...draft,
    id: existing?.id ?? makeWorkoutId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    totalDurationMinutes: calculateWorkoutDuration(draft.exercises, draft.restSecondsBetweenExercises, defaultRepsMinutes),
    lastDoneDate: existing?.lastDoneDate,
  };
}

export function addExerciseToWorkout(exercises: WorkoutExercise[], exercise: Exercise) {
  return [...exercises, {
    exerciseId: exercise.id,
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    help: exercise.help,
    category: exercise.category,
    imageUri: exercise.imageUri,
    techniqueIds: [...exercise.techniqueIds],
    detail: { ...exercise.detail },
  }];
}

export function removeExerciseFromWorkout(exercises: WorkoutExercise[], index: number) {
  return exercises.filter((_, itemIndex) => itemIndex !== index);
}

export function moveExerciseInWorkout(exercises: WorkoutExercise[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= exercises.length) return exercises;
  const next = [...exercises];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
