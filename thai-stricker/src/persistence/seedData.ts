import { mockCoachTips } from "../features/aiCoach/coachTipsMocks";
import {
  type MockCalendarWorkoutDay,
  type MockMonthlySummary,
} from "../features/home/homeMocks";
import { type MockWeeklyWorkoutPlan } from "../features/plannedWorkouts/plannedWorkoutMocks";
import { type MockWorkoutLogEntry } from "../features/workoutLogging/workoutLogMocks";
import {
  type MockWorkout,
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
