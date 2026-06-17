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
  target: MockExerciseTarget;
};

function getExerciseDeduplicationKey(exercise: Pick<MockExercise, "title" | "description" | "help" | "target">) {
  const targetKey =
    exercise.target.type === "duration"
      ? `duration:${exercise.target.seconds}`
      : `reps:${exercise.target.reps}`;

  return [
    exercise.title.trim().toLowerCase(),
    exercise.description.trim().toLowerCase(),
    exercise.help.trim().toLowerCase(),
    targetKey,
  ].join("|");
}

function buildMockAvailableExercises() {
  const deduplicatedExercises = new Map<string, MockAvailableExercise>();

  mockWorkouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const key = getExerciseDeduplicationKey(exercise);

      if (deduplicatedExercises.has(key)) {
        return;
      }

      deduplicatedExercises.set(key, {
        id: `available-${deduplicatedExercises.size + 1}`,
        title: exercise.title,
        description: exercise.description,
        help: exercise.help,
        target: exercise.target,
      });
    });
  });

  return Array.from(deduplicatedExercises.values());
}

export const mockAvailableExercises = buildMockAvailableExercises();
