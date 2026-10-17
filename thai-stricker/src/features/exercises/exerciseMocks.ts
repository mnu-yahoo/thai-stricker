import { normalizeExerciseName } from "./exerciseIdentity";
import {
  mockWorkouts,
  type MockExercise,
  type MockExerciseDetail,
} from "../workouts/workoutMocks";

export type MockAvailableExercise = {
  id: string;
  title: string;
  description: string;
  help: string;
  category?: string;
  imageUri?: string;
  detail: MockExerciseDetail;
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
        detail: exercise.detail,
      });
    });
  });

  return Array.from(deduplicatedExercises.values());
}

export const mockAvailableExercises = buildMockAvailableExercises();
