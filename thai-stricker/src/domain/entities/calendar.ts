export type CalendarWorkoutDay = { date: string; status: "completed" | "planned" | "missed"; workoutName: string };
export type MonthlySummary = { completedWorkouts: number; plannedWorkouts: number; missedWorkouts: number };
