import { mockCoachTips } from "../features/aiCoach/coachTipsMocks";
import {
  type MockCalendarWorkoutDay,
  type MockMonthlySummary,
} from "../features/home/homeMocks";
import { type MockWeeklyWorkoutPlan } from "../features/plannedWorkouts/plannedWorkoutMocks";
import { type MockWorkoutLogEntry } from "../features/workoutLogging/workoutLogMocks";
import {
  mockWorkouts,
  type MockExercise,
  type MockExerciseTarget,
  type MockWorkout,
  type MockWorkoutCategory,
  type MockWorkoutDifficulty,
} from "../features/workouts/workoutMocks";
import type {
  DefaultRepsExerciseDurationOption,
  MaxExercisesPerWorkoutOption,
  NumberOfExercisesPerPageOption,
  ThemePreferenceOption,
  TrainingDayOption,
} from "../features/settings/SettingsScreen";
import type { MockAvailableExercise } from "../features/exercises/exerciseMocks";

export type SeedSettings = {
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  trainingDaysPerWeek: TrainingDayOption;
  maxExercisesPerWorkout: MaxExercisesPerWorkoutOption;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  defaultRepsExerciseDurationMinutes: DefaultRepsExerciseDurationOption;
  themePreference: ThemePreferenceOption;
};

export const seedSettings: SeedSettings = {
  restSecondsBetweenExercises: 30,
  trainingDaysPerWeek: 3,
  maxExercisesPerWorkout: 10,
  numberOfExercisesPerPage: 6,
  defaultRepsExerciseDurationMinutes: 3,
  themePreference: "Light",
};

type ImportedWorkoutSeed = {
  title: string;
  description: string;
  difficulty: MockWorkoutDifficulty;
  category: MockWorkoutCategory;
  restSecondsBetweenExercises: number;
  exercises: Array<{
    title: string;
    description: string;
    help: string;
    target: MockExerciseTarget;
  }>;
};

const rawImportedWorkouts = require("./thai_striker_new_workouts.json") as ImportedWorkoutSeed[];

function calculateWorkoutTotalDurationMinutes(
  exercises: MockExercise[],
  restSecondsBetweenExercises: number,
  defaultRepsExerciseDurationMinutes: number,
) {
  const exerciseDurationTotalSeconds = exercises.reduce((totalSeconds, exercise) => {
    if (exercise.target.type === "duration") {
      return totalSeconds + exercise.target.seconds;
    }

    return totalSeconds + defaultRepsExerciseDurationMinutes * 60;
  }, 0);

  const restTotalSeconds = Math.max(exercises.length - 1, 0) * restSecondsBetweenExercises;

  return Math.ceil((exerciseDurationTotalSeconds + restTotalSeconds) / 60);
}

function getHighestNumericSuffix(values: string[], prefix: string) {
  return values.reduce((highestValue, value) => {
    if (!value.startsWith(prefix)) {
      return highestValue;
    }

    const numericPart = Number(value.slice(prefix.length));
    return Number.isFinite(numericPart) ? Math.max(highestValue, numericPart) : highestValue;
  }, 0);
}

function buildImportedWorkouts() {
  let nextWorkoutNumber =
    getHighestNumericSuffix(
      mockWorkouts.map((workout) => workout.id),
      "workout-",
    ) + 1;
  let nextExerciseNumber =
    getHighestNumericSuffix(
      mockWorkouts.flatMap((workout) => workout.exercises.map((exercise) => exercise.id)),
      "exercise-",
    ) + 1;

  return rawImportedWorkouts.map((workout) => {
    const exercises = workout.exercises.map(
      (exercise): MockExercise => ({
        id: `exercise-${String(nextExerciseNumber++).padStart(3, "0")}`,
        title: exercise.title,
        description: exercise.description,
        help: exercise.help,
        target: exercise.target,
      }),
    );

    return {
      id: `workout-${String(nextWorkoutNumber++).padStart(3, "0")}`,
      title: workout.title,
      description: workout.description,
      difficulty: workout.difficulty,
      category: workout.category,
      totalDurationMinutes: calculateWorkoutTotalDurationMinutes(
        exercises,
        workout.restSecondsBetweenExercises,
        seedSettings.defaultRepsExerciseDurationMinutes,
      ),
      restSecondsBetweenExercises: workout.restSecondsBetweenExercises,
      exercises,
    } satisfies MockWorkout;
  });
}

function getExerciseDeduplicationKey(
  exercise: Pick<MockExercise, "title" | "description" | "help" | "target">,
) {
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

function buildAvailableExercises(workouts: MockWorkout[]) {
  const deduplicatedExercises = new Map<string, MockAvailableExercise>();

  workouts.forEach((workout) => {
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

export const importedWorkouts = buildImportedWorkouts();
export const seedWorkouts: MockWorkout[] = [];
export const seedAvailableExercises: MockAvailableExercise[] = [];
const emptyMonthlySummary: MockMonthlySummary = {
  completedWorkouts: 0,
  plannedWorkouts: 0,
  missedWorkouts: 0,
};

export const seedData = {
  availableExercises: seedAvailableExercises,
  workouts: seedWorkouts,
  weeklyWorkoutPlans: [] as MockWeeklyWorkoutPlan[],
  workoutLogs: [] as MockWorkoutLogEntry[],
  coachTips: mockCoachTips,
  calendarWorkoutDays: [] as MockCalendarWorkoutDay[],
  monthlySummary: emptyMonthlySummary as MockMonthlySummary,
  settings: seedSettings,
};
