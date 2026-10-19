export type { Exercise, ExerciseDetail } from "../domain/entities/exercise";
export type { Technique, TechniqueCategory } from "../domain/entities/technique";
export type { Workout, WorkoutCategory, WorkoutDifficulty, WorkoutExercise, ResolvedWorkoutExercise } from "../domain/entities/workout";
export type { PlannedWorkoutDay, WeeklyWorkoutPlan } from "../domain/entities/weeklyWorkoutPlan";
export type { WorkoutLogEntry } from "../domain/entities/workoutLog";
export type { CoachTip } from "../domain/entities/coachTip";
export type { CalendarWorkoutDay, MonthlySummary } from "../domain/entities/calendar";
export type { PersistedSettings } from "../domain/entities/settings";

import type { Exercise } from "../domain/entities/exercise";
import type { Technique } from "../domain/entities/technique";
import type { Workout } from "../domain/entities/workout";
import type { WeeklyWorkoutPlan } from "../domain/entities/weeklyWorkoutPlan";
import type { WorkoutLogEntry } from "../domain/entities/workoutLog";
import type { CoachTip } from "../domain/entities/coachTip";
import type { CalendarWorkoutDay, MonthlySummary } from "../domain/entities/calendar";
import type { PersistedSettings } from "../domain/entities/settings";

export type AppDataSnapshot = {
  settings: PersistedSettings;
  techniques: Technique[];
  exercises: Exercise[];
  workouts: Workout[];
  weeklyWorkoutPlans: WeeklyWorkoutPlan[];
  workoutLogs: WorkoutLogEntry[];
  coachTips: CoachTip[];
  calendarWorkoutDays: CalendarWorkoutDay[];
  monthlySummary: MonthlySummary;
};

export type ThaiStrickerDataFileV1 = AppDataSnapshot & { schemaVersion: 1; exportedAt: string };
export type DataSectionName = "settings" | "workouts" | "weeklyWorkoutPlans" | "workoutLogs" | "coachTips" | "calendar";
type SectionFileMetadata<T extends DataSectionName> = { schemaVersion: 1; fileType: T; exportedAt: string };
export type SettingsDataFileV1 = SectionFileMetadata<"settings"> & Pick<AppDataSnapshot, "settings">;
export type WorkoutsDataFileV1 = SectionFileMetadata<"workouts"> & Pick<AppDataSnapshot, "techniques" | "exercises" | "workouts">;
export type WeeklyWorkoutPlansDataFileV1 = SectionFileMetadata<"weeklyWorkoutPlans"> & Pick<AppDataSnapshot, "weeklyWorkoutPlans">;
export type WorkoutLogsDataFileV1 = SectionFileMetadata<"workoutLogs"> & Pick<AppDataSnapshot, "workoutLogs">;
export type CoachTipsDataFileV1 = SectionFileMetadata<"coachTips"> & Pick<AppDataSnapshot, "coachTips">;
export type CalendarDataFileV1 = SectionFileMetadata<"calendar"> & Pick<AppDataSnapshot, "calendarWorkoutDays" | "monthlySummary">;
export type ThaiStrickerSectionFileV1 = SettingsDataFileV1 | WorkoutsDataFileV1 | WeeklyWorkoutPlansDataFileV1 | WorkoutLogsDataFileV1 | CoachTipsDataFileV1 | CalendarDataFileV1;
export type NamedSectionImport = { filename: string; content: unknown };
export type WorkoutImportPayload = Omit<Workout, "id" | "totalDurationMinutes" | "lastDoneDate">;

export const WORKOUT_DIFFICULTIES: Workout["difficulty"][] = ["Beginner", "Intermediate", "Advanced"];
export const WORKOUT_CATEGORIES: Workout["category"][] = ["Fundamentals", "Striking", "Defense", "Conditioning", "Footwork", "Strength"];
