import type { AppDataSnapshot } from "../types/domain";

export const seedData: AppDataSnapshot = {
  settings: {
    restSecondsBetweenExercises: 30,
    trainingDaysPerWeek: 3,
    maxExercisesPerWorkout: 10,
    numberOfExercisesPerPage: 6,
    defaultRepsExerciseDurationMinutes: 3,
    themePreference: "Light",
  },
  techniques: [],
  availableExercises: [],
  workouts: [],
  weeklyWorkoutPlans: [],
  workoutLogs: [],
  coachTips: [],
  calendarWorkoutDays: [],
  monthlySummary: {
    completedWorkouts: 0,
    plannedWorkouts: 0,
    missedWorkouts: 0,
  },
};
