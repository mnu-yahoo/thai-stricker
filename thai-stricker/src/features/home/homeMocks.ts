export type MockWorkoutStatus = "completed" | "planned" | "missed";

export type MockCalendarWorkoutDay = {
  date: string;
  status: MockWorkoutStatus;
  workoutName: string;
};

export type MockPlannedWorkout = {
  id: string;
  name: string;
  focus: string;
  durationMinutes: number;
  exercisesCount: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
};

export type MockMonthlySummary = {
  completedWorkouts: number;
  plannedWorkouts: number;
  missedWorkouts: number;
};

export const mockPlannedWorkout: MockPlannedWorkout = {
  id: "planned-001",
  name: "Muay Thai Fundamentals",
  focus: "Footwork, jab-cross, teep, low kick",
  durationMinutes: 35,
  exercisesCount: 6,
  difficulty: "Beginner",
};

export const mockMonthlySummary: MockMonthlySummary = {
  completedWorkouts: 7,
  plannedWorkouts: 3,
  missedWorkouts: 1,
};

export const mockCalendarWorkoutDays: MockCalendarWorkoutDay[] = [
  { date: "2026-06-02", status: "completed", workoutName: "Guard & Footwork" },
  { date: "2026-06-05", status: "completed", workoutName: "Boxing Basics" },
  { date: "2026-06-08", status: "missed", workoutName: "Knees & Clinch" },
  { date: "2026-06-11", status: "completed", workoutName: "Low Kick Flow" },
  { date: "2026-06-15", status: "completed", workoutName: "Muay Thai Fundamentals" },
  { date: "2026-06-18", status: "planned", workoutName: "Defense Basics" },
  { date: "2026-06-22", status: "planned", workoutName: "Kick Conditioning" },
];
