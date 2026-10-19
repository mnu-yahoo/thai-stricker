export type PlannedWorkoutDay = { dayDate: string; dayLabel: string; workoutId: string; workoutTitle: string };
export type WeeklyWorkoutPlan = { id: string; weekStartDate: string; weekNumber: number; year: number; requiredTrainingDays: number; plannedDays: PlannedWorkoutDay[]; source: "web" | "mock" };
