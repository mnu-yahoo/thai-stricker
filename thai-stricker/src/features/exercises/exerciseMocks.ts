import { normalizeExerciseName } from "./exerciseIdentity";
import {
  mockWorkouts,
  type MockExercise,
  type MockExerciseTarget,
} from "../workouts/workoutMocks";

export type MockAvailableExercise = {
  id: string;
  title: string;
  description: string;
  help: string;
  category?: string;
  imageUri?: string;
  target: MockExerciseTarget;
};

function buildMockAvailableExercises() {
  const deduplicatedExercises = new Map<string, MockAvailableExercise>();

  mockWorkouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const key = normalizeExerciseName(exercise.title);

      if (deduplicatedExercises.has(key)) {
        return;
      }

      deduplicatedExercises.set(key, {
        id: `available-${deduplicatedExercises.size + 1}`,
        title: exercise.title,
        description: exercise.description,
        help: exercise.help,
        category: exercise.category,
        imageUri: exercise.imageUri,
        target: exercise.target,
      });
    });
  });

  return Array.from(deduplicatedExercises.values());
}

export const mockAvailableExercises = buildMockAvailableExercises();
