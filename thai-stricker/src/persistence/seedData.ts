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
  techniques: [{
    id: "technique-seed-jab",
    name: "Jab",
    shortName: "Jab",
    description: "Straight lead-hand strike.",
    category: "Muay Thai techniques",
    subCategory: "Punches",
  }],
  exercises: [],
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
