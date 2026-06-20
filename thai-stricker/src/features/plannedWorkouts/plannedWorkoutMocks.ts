export type MockPlannedWorkoutDay = {
  dayDate: string;
  dayLabel: string;
  workoutId: string;
  workoutTitle: string;
};

export type MockWeeklyWorkoutPlan = {
  id: string;
  weekStartDate: string;
  weekNumber: number;
  year: number;
  requiredTrainingDays: number;
  plannedDays: MockPlannedWorkoutDay[];
  source: "mock" | "sqlite";
};
