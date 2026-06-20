export type MockWorkoutLogStatus = "completed";

export type MockWorkoutLogEntry = {
  id: string;
  workoutId: string;
  workoutTitle: string;
  completedAt: string;
  completedDate: string;
  exerciseCount: number;
  completedExerciseCount: number;
  skippedExerciseCount: number;
  totalDurationMinutes: number;
  source: "mock" | "sqlite";
};

export const mockWorkoutLogs: MockWorkoutLogEntry[] = [];
