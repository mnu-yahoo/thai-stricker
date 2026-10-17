import { z } from "zod";

const positiveInteger = z.number().int().positive();
const targetSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("duration"), seconds: positiveInteger }),
  z.object({ type: z.literal("reps"), reps: positiveInteger }),
]);

export const exerciseSchema = z.object({
  id: z.string().min(1), title: z.string().min(1), description: z.string(), help: z.string(),
  category: z.string(), imageUri: z.string().optional(), target: targetSchema,
  techniqueIds: z.array(z.string()).min(1).max(5),
});

export const workoutExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  target: targetSchema,
});
export const settingsSchema = z.object({
  restSecondsBetweenExercises: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60), z.literal(90), z.literal(120)]),
  trainingDaysPerWeek: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6), z.literal(7)]),
  maxExercisesPerWorkout: z.union([z.literal(5), z.literal(10), z.literal(15), z.literal(20)]),
  numberOfExercisesPerPage: z.union([z.literal(3), z.literal(6), z.literal(9), z.literal(12)]),
  defaultRepsExerciseDurationMinutes: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  themePreference: z.union([z.literal("Light"), z.literal("Dark")]),
});

export const appDataSchema = z.object({
  settings: settingsSchema,
  techniques: z.array(z.object({
    id: z.string().min(1), name: z.string().min(1), shortName: z.string(), description: z.string(),
    category: z.union([z.literal("Muay Thai techniques"), z.literal("Stretching Techniques"), z.literal("Strength Techniques")]),
    subCategory: z.string(),
  })),
  exercises: z.array(exerciseSchema),
  workouts: z.array(z.object({
    id: z.string().min(1), title: z.string().min(1), description: z.string(),
    difficulty: z.union([z.literal("Beginner"), z.literal("Intermediate"), z.literal("Advanced")]),
    category: z.union([z.literal("Fundamentals"), z.literal("Striking"), z.literal("Defense"), z.literal("Conditioning"), z.literal("Footwork"), z.literal("Strength")]),
    totalDurationMinutes: z.number().int().nonnegative(), restSecondsBetweenExercises: z.number().int().nonnegative(),
    exercises: z.array(workoutExerciseSchema), lastDoneDate: z.string().optional(),
  })),
  weeklyWorkoutPlans: z.array(z.object({
    id: z.string().min(1), weekStartDate: z.string().min(1), weekNumber: z.number().int().min(1).max(53), year: z.number().int(),
    requiredTrainingDays: z.number().int().min(1).max(7),
    plannedDays: z.array(z.object({ dayDate: z.string().min(1), dayLabel: z.string().min(1), workoutId: z.string().min(1), workoutTitle: z.string().min(1) })),
    source: z.union([z.literal("web"), z.literal("mock")]),
  })),
  workoutLogs: z.array(z.object({
    id: z.string().min(1), workoutId: z.string().min(1), workoutTitle: z.string().min(1), completedAt: z.string().min(1), completedDate: z.string().min(1),
    exerciseCount: z.number().int().nonnegative(), completedExerciseCount: z.number().int().nonnegative(), skippedExerciseCount: z.number().int().nonnegative(),
    totalDurationMinutes: z.number().int().nonnegative(), source: z.union([z.literal("web"), z.literal("mock")]),
  })),
  coachTips: z.array(z.object({
    exerciseId: z.string().min(1), exerciseTitle: z.string().min(1), shortTip: z.string(), technicalTips: z.array(z.string()),
    commonMistakes: z.array(z.string()), focusPoints: z.array(z.string()), explanation: z.string(),
  })),
  calendarWorkoutDays: z.array(z.object({ date: z.string().min(1), status: z.union([z.literal("completed"), z.literal("planned"), z.literal("missed")]), workoutName: z.string() })),
  monthlySummary: z.object({ completedWorkouts: z.number().int().nonnegative(), plannedWorkouts: z.number().int().nonnegative(), missedWorkouts: z.number().int().nonnegative() }),
});

export const dataFileSchemaV1 = appDataSchema.extend({ schemaVersion: z.literal(1), exportedAt: z.string().min(1) });

const sectionMetadata = <T extends string>(fileType: T) => z.object({
  schemaVersion: z.literal(1),
  fileType: z.literal(fileType),
  exportedAt: z.string().datetime(),
});

export const settingsDataFileSchemaV1 = sectionMetadata("settings").extend({
  settings: appDataSchema.shape.settings,
});

export const workoutsDataFileSchemaV1 = sectionMetadata("workouts").extend({
  techniques: appDataSchema.shape.techniques,
  exercises: appDataSchema.shape.exercises,
  workouts: appDataSchema.shape.workouts,
});

export const weeklyWorkoutPlansDataFileSchemaV1 = sectionMetadata("weeklyWorkoutPlans").extend({
  weeklyWorkoutPlans: appDataSchema.shape.weeklyWorkoutPlans,
});

export const workoutLogsDataFileSchemaV1 = sectionMetadata("workoutLogs").extend({
  workoutLogs: appDataSchema.shape.workoutLogs,
});

export const coachTipsDataFileSchemaV1 = sectionMetadata("coachTips").extend({
  coachTips: appDataSchema.shape.coachTips,
});

export const calendarDataFileSchemaV1 = sectionMetadata("calendar").extend({
  calendarWorkoutDays: appDataSchema.shape.calendarWorkoutDays,
  monthlySummary: appDataSchema.shape.monthlySummary,
});

export const sectionDataFileSchemasV1 = {
  settings: settingsDataFileSchemaV1,
  workouts: workoutsDataFileSchemaV1,
  weeklyWorkoutPlans: weeklyWorkoutPlansDataFileSchemaV1,
  workoutLogs: workoutLogsDataFileSchemaV1,
  coachTips: coachTipsDataFileSchemaV1,
  calendar: calendarDataFileSchemaV1,
} as const;
