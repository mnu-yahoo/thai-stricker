import {
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";

import type { MockCoachTip } from "../features/aiCoach/coachTipsMocks";
import type { MockAvailableExercise } from "../features/exercises/exerciseMocks";
import type {
  MockCalendarWorkoutDay,
  MockMonthlySummary,
} from "../features/home/homeMocks";
import type { MockWeeklyWorkoutPlan } from "../features/plannedWorkouts/plannedWorkoutMocks";
import type {
  DefaultRepsExerciseDurationOption,
  MaxExercisesPerWorkoutOption,
  NumberOfExercisesPerPageOption,
  ThemePreferenceOption,
  TrainingDayOption,
} from "../features/settings/SettingsScreen";
import type { MockWorkoutLogEntry } from "../features/workoutLogging/workoutLogMocks";
import type {
  MockExercise,
  MockExerciseTarget,
  MockWorkout,
  MockWorkoutCategory,
  MockWorkoutDifficulty,
} from "../features/workouts/workoutMocks";
import { seedAvailableExercises, seedData } from "./seedData";

const CURRENT_SEED_VERSION = 8;

type ExerciseRow = {
  id: string;
  title: string;
  description: string;
  help: string;
  target_type: "duration" | "reps";
  target_value: number;
};

type WorkoutRow = {
  id: string;
  title: string;
  description: string;
  difficulty: MockWorkout["difficulty"];
  category: MockWorkout["category"];
  total_duration_minutes: number;
  rest_seconds_between_exercises: number;
  last_done_date: string | null;
};

type WorkoutExerciseRow = {
  workout_id: string;
  exercise_id: string;
  sort_order: number;
  title: string;
  description: string;
  help: string;
  target_type: "duration" | "reps";
  target_value: number;
};

type PlannedWorkoutRow = {
  id: string;
  week_start_date: string;
  week_number: number;
  year: number;
  required_training_days: number;
  source: "mock" | "sqlite";
};

type PlannedWorkoutDayRow = {
  planned_workout_id: string;
  day_date: string;
  day_label: string;
  workout_id: string;
  workout_title: string;
};

type WorkoutLogRow = {
  id: string;
  workout_id: string;
  workout_title: string;
  completed_at: string;
  completed_date: string;
  exercise_count: number;
  completed_exercise_count: number;
  skipped_exercise_count: number;
  total_duration_minutes: number;
  source: "mock" | "sqlite";
};

type CoachTipRow = {
  exercise_id: string;
  exercise_title: string;
  short_tip: string;
  technical_tips_json: string;
  common_mistakes_json: string;
  focus_points_json: string;
  explanation: string;
};

type CalendarWorkoutDayRow = {
  date: string;
  status: "completed" | "planned" | "missed";
  workout_name: string;
};

type MonthlySummaryRow = {
  id: number;
  completed_workouts: number;
  planned_workouts: number;
  missed_workouts: number;
};

type SettingsValueMap = {
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  trainingDaysPerWeek: TrainingDayOption;
  maxExercisesPerWorkout: MaxExercisesPerWorkoutOption;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  defaultRepsExerciseDurationMinutes: DefaultRepsExerciseDurationOption;
  themePreference: ThemePreferenceOption;
};

export type PersistedSettings = SettingsValueMap;

export type AppDataSnapshot = {
  availableExercises: MockAvailableExercise[];
  workouts: MockWorkout[];
  weeklyWorkoutPlans: MockWeeklyWorkoutPlan[];
  workoutLogs: MockWorkoutLogEntry[];
  coachTips: MockCoachTip[];
  calendarWorkoutDays: MockCalendarWorkoutDay[];
  monthlySummary: MockMonthlySummary;
  settings: PersistedSettings;
};

export type WorkoutImportPayload = {
  title: string;
  description: string;
  difficulty: MockWorkoutDifficulty;
  category: MockWorkoutCategory;
  restSecondsBetweenExercises: number;
  exercises: Array<{
    title: string;
    description: string;
    help: string;
    target: MockExerciseTarget;
  }>;
};

let databasePromise: Promise<SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabaseAsync("thai-stricker.db");
  }

  return databasePromise;
}

function toTarget(targetType: "duration" | "reps", targetValue: number): MockExerciseTarget {
  return targetType === "duration"
    ? { type: "duration", seconds: targetValue }
    : { type: "reps", reps: targetValue };
}

function serializeJson(value: unknown) {
  return JSON.stringify(value);
}

function parseJsonArray(value: string) {
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : [];
}

function calculateWorkoutTotalDurationMinutes(
  exercises: MockExercise[],
  restSecondsBetweenExercises: number,
  defaultRepsExerciseDurationMinutes: number,
) {
  const exerciseDurationTotalSeconds = exercises.reduce((totalSeconds, exercise) => {
    if (exercise.target.type === "duration") {
      return totalSeconds + exercise.target.seconds;
    }

    return totalSeconds + defaultRepsExerciseDurationMinutes * 60;
  }, 0);

  const restTotalSeconds = Math.max(exercises.length - 1, 0) * restSecondsBetweenExercises;

  return Math.ceil((exerciseDurationTotalSeconds + restTotalSeconds) / 60);
}

function getExerciseDeduplicationKey(
  exercise: Pick<MockExercise, "title" | "description" | "help" | "target">,
) {
  const targetKey =
    exercise.target.type === "duration"
      ? `duration:${exercise.target.seconds}`
      : `reps:${exercise.target.reps}`;

  return [
    exercise.title.trim().toLowerCase(),
    exercise.description.trim().toLowerCase(),
    exercise.help.trim().toLowerCase(),
    targetKey,
  ].join("|");
}

function buildAvailableExercisesFromWorkouts(workouts: MockWorkout[]) {
  const deduplicatedExercises = new Map<string, MockAvailableExercise>();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const key = getExerciseDeduplicationKey(exercise);

      if (deduplicatedExercises.has(key)) {
        return;
      }

      deduplicatedExercises.set(key, {
        id: `available-${deduplicatedExercises.size + 1}`,
        title: exercise.title,
        description: exercise.description,
        help: exercise.help,
        target: exercise.target,
      });
    });
  });

  return Array.from(deduplicatedExercises.values());
}

function getHighestNumericSuffix(values: string[], prefix: string) {
  return values.reduce((highestValue, value) => {
    if (!value.startsWith(prefix)) {
      return highestValue;
    }

    const numericPart = Number(value.slice(prefix.length));
    return Number.isFinite(numericPart) ? Math.max(highestValue, numericPart) : highestValue;
  }, 0);
}

async function createTables(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      help TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      category TEXT NOT NULL,
      total_duration_minutes INTEGER NOT NULL,
      rest_seconds_between_exercises INTEGER NOT NULL,
      last_done_date TEXT
    );

    CREATE TABLE IF NOT EXISTS workout_exercises (
      workout_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      help TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      PRIMARY KEY (workout_id, sort_order)
    );

    CREATE TABLE IF NOT EXISTS planned_workouts (
      id TEXT PRIMARY KEY NOT NULL,
      week_start_date TEXT NOT NULL UNIQUE,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      required_training_days INTEGER NOT NULL,
      source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS planned_workout_days (
      planned_workout_id TEXT NOT NULL,
      day_date TEXT NOT NULL,
      day_label TEXT NOT NULL,
      workout_id TEXT NOT NULL,
      workout_title TEXT NOT NULL,
      PRIMARY KEY (planned_workout_id, day_date)
    );

    CREATE TABLE IF NOT EXISTS workout_logs (
      id TEXT PRIMARY KEY NOT NULL,
      workout_id TEXT NOT NULL,
      workout_title TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      completed_date TEXT NOT NULL,
      exercise_count INTEGER NOT NULL,
      completed_exercise_count INTEGER NOT NULL,
      skipped_exercise_count INTEGER NOT NULL,
      total_duration_minutes INTEGER NOT NULL,
      source TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_coach_tips (
      exercise_id TEXT PRIMARY KEY NOT NULL,
      exercise_title TEXT NOT NULL,
      short_tip TEXT NOT NULL,
      technical_tips_json TEXT NOT NULL,
      common_mistakes_json TEXT NOT NULL,
      focus_points_json TEXT NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_coach_messages (
      id TEXT PRIMARY KEY NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS calendar_day_statuses (
      date TEXT PRIMARY KEY NOT NULL,
      status TEXT NOT NULL,
      workout_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_summaries (
      id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
      completed_workouts INTEGER NOT NULL,
      planned_workouts INTEGER NOT NULL,
      missed_workouts INTEGER NOT NULL
    );
  `);
}

async function getSeedVersion(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = ?",
    "seed_version",
  );

  return row?.value ? Number(row.value) : 0;
}

async function setSeedVersion(db: SQLiteDatabase, version: number) {
  await db.runAsync(
    `
      INSERT INTO app_meta (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    "seed_version",
    String(version),
  );
}

async function insertSeedExercise(
  txn: SQLiteDatabase,
  exercise: MockAvailableExercise,
) {
  const targetValue =
    exercise.target.type === "duration" ? exercise.target.seconds : exercise.target.reps;

  await txn.runAsync(
    `
      INSERT OR IGNORE INTO exercises (id, title, description, help, target_type, target_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    exercise.id,
    exercise.title,
    exercise.description,
    exercise.help,
    exercise.target.type,
    targetValue,
  );
}

async function insertSeedWorkout(
  txn: SQLiteDatabase,
  workout: MockWorkout,
) {
  await txn.runAsync(
    `
      INSERT OR IGNORE INTO workouts (
        id,
        title,
        description,
        difficulty,
        category,
        total_duration_minutes,
        rest_seconds_between_exercises,
        last_done_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    workout.id,
    workout.title,
    workout.description,
    workout.difficulty,
    workout.category,
    workout.totalDurationMinutes,
    workout.restSecondsBetweenExercises,
    workout.lastDoneDate ?? null,
  );

  for (const [index, exercise] of workout.exercises.entries()) {
    const targetValue =
      exercise.target.type === "duration" ? exercise.target.seconds : exercise.target.reps;

    await txn.runAsync(
      `
        INSERT OR IGNORE INTO workout_exercises (
          workout_id,
          exercise_id,
          sort_order,
          title,
          description,
          help,
          target_type,
          target_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      workout.id,
      exercise.id,
      index,
      exercise.title,
      exercise.description,
      exercise.help,
      exercise.target.type,
      targetValue,
    );
  }
}

async function seedDatabase(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const [key, value] of Object.entries(seedData.settings)) {
      await txn.runAsync(
        "INSERT INTO settings (key, value) VALUES (?, ?)",
        key,
        String(value),
      );
    }

    for (const exercise of seedData.availableExercises) {
      await insertSeedExercise(txn, exercise);
    }

    for (const workout of seedData.workouts) {
      await insertSeedWorkout(txn, workout);
    }

    for (const plan of seedData.weeklyWorkoutPlans) {
      await txn.runAsync(
        `
          INSERT INTO planned_workouts (
            id,
            week_start_date,
            week_number,
            year,
            required_training_days,
            source
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        plan.id,
        plan.weekStartDate,
        plan.weekNumber,
        plan.year,
        plan.requiredTrainingDays,
        "sqlite",
      );

      for (const day of plan.plannedDays) {
        await txn.runAsync(
          `
            INSERT INTO planned_workout_days (
              planned_workout_id,
              day_date,
              day_label,
              workout_id,
              workout_title
            ) VALUES (?, ?, ?, ?, ?)
          `,
          plan.id,
          day.dayDate,
          day.dayLabel,
          day.workoutId,
          day.workoutTitle,
        );
      }
    }

    for (const log of seedData.workoutLogs) {
      await txn.runAsync(
        `
          INSERT INTO workout_logs (
            id,
            workout_id,
            workout_title,
            completed_at,
            completed_date,
            exercise_count,
            completed_exercise_count,
            skipped_exercise_count,
            total_duration_minutes,
            source
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        log.id,
        log.workoutId,
        log.workoutTitle,
        log.completedAt,
        log.completedDate,
        log.exerciseCount,
        log.completedExerciseCount,
        log.skippedExerciseCount,
        log.totalDurationMinutes,
        "sqlite",
      );
    }

    for (const tip of seedData.coachTips) {
      await txn.runAsync(
        `
          INSERT INTO ai_coach_tips (
            exercise_id,
            exercise_title,
            short_tip,
            technical_tips_json,
            common_mistakes_json,
            focus_points_json,
            explanation
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        tip.exerciseId,
        tip.exerciseTitle,
        tip.shortTip,
        serializeJson(tip.technicalTips),
        serializeJson(tip.commonMistakes),
        serializeJson(tip.focusPoints),
        tip.explanation,
      );
    }

    for (const day of seedData.calendarWorkoutDays) {
      await txn.runAsync(
        `
          INSERT INTO calendar_day_statuses (date, status, workout_name)
          VALUES (?, ?, ?)
        `,
        day.date,
        day.status,
        day.workoutName,
      );
    }

    await txn.runAsync(
      `
        INSERT INTO monthly_summaries (id, completed_workouts, planned_workouts, missed_workouts)
        VALUES (1, ?, ?, ?)
      `,
      seedData.monthlySummary.completedWorkouts,
      seedData.monthlySummary.plannedWorkouts,
      seedData.monthlySummary.missedWorkouts,
    );

    await setSeedVersion(txn, CURRENT_SEED_VERSION);
  });
}

async function migrateToSeedVersion2(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const exercise of seedData.availableExercises) {
      await insertSeedExercise(txn, exercise);
    }

    for (const workout of seedData.workouts) {
      await insertSeedWorkout(txn, workout);
    }
  });
}

async function upsertSeedWorkouts(txn: SQLiteDatabase) {
  await txn.runAsync("DELETE FROM exercises WHERE id LIKE 'available-%'");
  await txn.runAsync("DELETE FROM workout_exercises");
  await txn.runAsync("DELETE FROM workouts");

  for (const exercise of seedAvailableExercises) {
    await insertSeedExercise(txn, exercise);
  }

  for (const workout of seedData.workouts) {
    await insertSeedWorkout(txn, workout);
  }
}

async function migrateToSeedVersion3(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await upsertSeedWorkouts(txn);
  });
}

async function migrateToSeedVersion4(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM planned_workout_days");
    await txn.runAsync("DELETE FROM planned_workouts");
    await txn.runAsync("DELETE FROM workout_logs");
    await txn.runAsync("DELETE FROM workout_exercises");
    await txn.runAsync("DELETE FROM workouts");
    await txn.runAsync("DELETE FROM calendar_day_statuses");
    await txn.runAsync("DELETE FROM monthly_summaries");
    await txn.runAsync(
      `
        INSERT INTO monthly_summaries (id, completed_workouts, planned_workouts, missed_workouts)
        VALUES (1, 0, 0, 0)
      `,
    );
  });
}

async function migrateToSeedVersion5(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await upsertSeedWorkouts(txn);
  });
}

async function migrateToSeedVersion6(db: SQLiteDatabase) {
  await db.runAsync(
    `
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    "themePreference",
    "Light",
  );
}

async function migrateToSeedVersion7(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM exercises WHERE id LIKE 'available-%'");
    await txn.runAsync("DELETE FROM planned_workout_days");
    await txn.runAsync("DELETE FROM planned_workouts");
    await txn.runAsync("DELETE FROM workout_logs");
    await txn.runAsync("DELETE FROM workout_exercises");
    await txn.runAsync("DELETE FROM workouts");
    await txn.runAsync("DELETE FROM calendar_day_statuses");
    await txn.runAsync("DELETE FROM monthly_summaries");

    for (const exercise of seedAvailableExercises) {
      await insertSeedExercise(txn, exercise);
    }

    await txn.runAsync(
      `
        INSERT INTO monthly_summaries (id, completed_workouts, planned_workouts, missed_workouts)
        VALUES (1, 0, 0, 0)
      `,
    );
  });
}

async function migrateToSeedVersion8(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM exercises");
  });
}

export async function initializeDatabase() {
  const db = await getDatabase();
  await createTables(db);
  const currentSeedVersion = await getSeedVersion(db);

  if (currentSeedVersion === 0) {
    await seedDatabase(db);
  } else if (currentSeedVersion < CURRENT_SEED_VERSION) {
    if (currentSeedVersion < 2) {
      await migrateToSeedVersion2(db);
    }

    if (currentSeedVersion < 3) {
      await migrateToSeedVersion3(db);
    }

    if (currentSeedVersion < 4) {
      await migrateToSeedVersion4(db);
    }

    if (currentSeedVersion < 5) {
      await migrateToSeedVersion5(db);
    }

    if (currentSeedVersion < 6) {
      await migrateToSeedVersion6(db);
    }

    if (currentSeedVersion < 7) {
      await migrateToSeedVersion7(db);
    }

    if (currentSeedVersion < 8) {
      await migrateToSeedVersion8(db);
    }

    await setSeedVersion(db, CURRENT_SEED_VERSION);
  }

  return db;
}

async function loadSettings(db: SQLiteDatabase): Promise<PersistedSettings> {
  const rows = await db.getAllAsync<{ key: keyof SettingsValueMap; value: string }>(
    "SELECT key, value FROM settings",
  );
  const settingsMap = new Map(rows.map((row) => [row.key, row.value]));

  return {
    restSecondsBetweenExercises: Number(
      settingsMap.get("restSecondsBetweenExercises") ?? seedData.settings.restSecondsBetweenExercises,
    ) as PersistedSettings["restSecondsBetweenExercises"],
    trainingDaysPerWeek: Number(
      settingsMap.get("trainingDaysPerWeek") ?? seedData.settings.trainingDaysPerWeek,
    ) as TrainingDayOption,
    maxExercisesPerWorkout: Number(
      settingsMap.get("maxExercisesPerWorkout") ?? seedData.settings.maxExercisesPerWorkout,
    ) as MaxExercisesPerWorkoutOption,
    numberOfExercisesPerPage: Number(
      settingsMap.get("numberOfExercisesPerPage") ?? seedData.settings.numberOfExercisesPerPage,
    ) as NumberOfExercisesPerPageOption,
    defaultRepsExerciseDurationMinutes: Number(
      settingsMap.get("defaultRepsExerciseDurationMinutes") ??
        seedData.settings.defaultRepsExerciseDurationMinutes,
    ) as DefaultRepsExerciseDurationOption,
    themePreference: (settingsMap.get("themePreference") ??
      seedData.settings.themePreference) as ThemePreferenceOption,
  };
}

async function loadAvailableExercises(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<ExerciseRow>(
    `
      SELECT id, title, description, help, target_type, target_value
      FROM exercises
      ORDER BY title COLLATE NOCASE ASC
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    help: row.help,
    target: toTarget(row.target_type, row.target_value),
  }));
}

async function loadWorkouts(db: SQLiteDatabase) {
  const workoutRows = await db.getAllAsync<WorkoutRow>(
    `
      SELECT
        id,
        title,
        description,
        difficulty,
        category,
        total_duration_minutes,
        rest_seconds_between_exercises,
        last_done_date
      FROM workouts
      ORDER BY title COLLATE NOCASE ASC
    `,
  );

  const workoutExerciseRows = await db.getAllAsync<WorkoutExerciseRow>(
    `
      SELECT
        workout_id,
        exercise_id,
        sort_order,
        title,
        description,
        help,
        target_type,
        target_value
      FROM workout_exercises
      ORDER BY workout_id ASC, sort_order ASC
    `,
  );

  return workoutRows.map((row) => {
    const exercises = workoutExerciseRows
      .filter((exerciseRow) => exerciseRow.workout_id === row.id)
      .map(
        (exerciseRow): MockExercise => ({
          id: exerciseRow.exercise_id,
          title: exerciseRow.title,
          description: exerciseRow.description,
          help: exerciseRow.help,
          target: toTarget(exerciseRow.target_type, exerciseRow.target_value),
        }),
      );

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      category: row.category,
      totalDurationMinutes: row.total_duration_minutes,
      restSecondsBetweenExercises: row.rest_seconds_between_exercises,
      exercises,
      lastDoneDate: row.last_done_date ?? undefined,
    } satisfies MockWorkout;
  });
}

async function loadWeeklyWorkoutPlans(db: SQLiteDatabase) {
  const planRows = await db.getAllAsync<PlannedWorkoutRow>(
    `
      SELECT
        id,
        week_start_date,
        week_number,
        year,
        required_training_days,
        source
      FROM planned_workouts
      ORDER BY week_start_date ASC
    `,
  );
  const dayRows = await db.getAllAsync<PlannedWorkoutDayRow>(
    `
      SELECT
        planned_workout_id,
        day_date,
        day_label,
        workout_id,
        workout_title
      FROM planned_workout_days
      ORDER BY day_date ASC
    `,
  );

  return planRows.map((row) => ({
    id: row.id,
    weekStartDate: row.week_start_date,
    weekNumber: row.week_number,
    year: row.year,
    requiredTrainingDays: row.required_training_days,
    plannedDays: dayRows
      .filter((dayRow) => dayRow.planned_workout_id === row.id)
      .map((dayRow) => ({
        dayDate: dayRow.day_date,
        dayLabel: dayRow.day_label,
        workoutId: dayRow.workout_id,
        workoutTitle: dayRow.workout_title,
      })),
    source: "sqlite",
  })) satisfies MockWeeklyWorkoutPlan[];
}

async function loadWorkoutLogs(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<WorkoutLogRow>(
    `
      SELECT
        id,
        workout_id,
        workout_title,
        completed_at,
        completed_date,
        exercise_count,
        completed_exercise_count,
        skipped_exercise_count,
        total_duration_minutes,
        source
      FROM workout_logs
      ORDER BY completed_at DESC
    `,
  );

  return rows.map((row) => ({
    id: row.id,
    workoutId: row.workout_id,
    workoutTitle: row.workout_title,
    completedAt: row.completed_at,
    completedDate: row.completed_date,
    exerciseCount: row.exercise_count,
    completedExerciseCount: row.completed_exercise_count,
    skippedExerciseCount: row.skipped_exercise_count,
    totalDurationMinutes: row.total_duration_minutes,
    source: "sqlite",
  })) satisfies MockWorkoutLogEntry[];
}

async function loadCoachTips(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<CoachTipRow>(
    `
      SELECT
        exercise_id,
        exercise_title,
        short_tip,
        technical_tips_json,
        common_mistakes_json,
        focus_points_json,
        explanation
      FROM ai_coach_tips
      ORDER BY exercise_title COLLATE NOCASE ASC
    `,
  );

  return rows.map((row) => ({
    exerciseId: row.exercise_id,
    exerciseTitle: row.exercise_title,
    shortTip: row.short_tip,
    technicalTips: parseJsonArray(row.technical_tips_json) as string[],
    commonMistakes: parseJsonArray(row.common_mistakes_json) as string[],
    focusPoints: parseJsonArray(row.focus_points_json) as string[],
    explanation: row.explanation,
  })) satisfies MockCoachTip[];
}

async function loadCalendarWorkoutDays(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<CalendarWorkoutDayRow>(
    `
      SELECT date, status, workout_name
      FROM calendar_day_statuses
      ORDER BY date ASC
    `,
  );

  return rows.map((row) => ({
    date: row.date,
    status: row.status,
    workoutName: row.workout_name,
  })) satisfies MockCalendarWorkoutDay[];
}

async function loadMonthlySummary(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<MonthlySummaryRow>(
    `
      SELECT id, completed_workouts, planned_workouts, missed_workouts
      FROM monthly_summaries
      WHERE id = 1
    `,
  );

  return {
    completedWorkouts: row?.completed_workouts ?? 0,
    plannedWorkouts: row?.planned_workouts ?? 0,
    missedWorkouts: row?.missed_workouts ?? 0,
  } satisfies MockMonthlySummary;
}

export async function loadAppData(): Promise<AppDataSnapshot> {
  const db = await initializeDatabase();

  const [
    availableExercises,
    workouts,
    weeklyWorkoutPlans,
    workoutLogs,
    coachTips,
    calendarWorkoutDays,
    monthlySummary,
    settings,
  ] = await Promise.all([
    loadAvailableExercises(db),
    loadWorkouts(db),
    loadWeeklyWorkoutPlans(db),
    loadWorkoutLogs(db),
    loadCoachTips(db),
    loadCalendarWorkoutDays(db),
    loadMonthlySummary(db),
    loadSettings(db),
  ]);

  return {
    availableExercises,
    workouts,
    weeklyWorkoutPlans,
    workoutLogs,
    coachTips,
    calendarWorkoutDays,
    monthlySummary,
    settings,
  };
}

export async function saveSetting<K extends keyof SettingsValueMap>(
  key: K,
  value: SettingsValueMap[K],
) {
  const db = await initializeDatabase();
  await db.runAsync(
    `
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `,
    key,
    String(value),
  );
}

export async function resetWorkoutsAndExercises() {
  const db = await initializeDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM planned_workout_days");
    await txn.runAsync("DELETE FROM planned_workouts");
    await txn.runAsync("DELETE FROM workout_logs");
    await txn.runAsync("DELETE FROM workout_exercises");
    await txn.runAsync("DELETE FROM workouts");
    await txn.runAsync("DELETE FROM exercises");
    await txn.runAsync("DELETE FROM calendar_day_statuses");
    await txn.runAsync("DELETE FROM monthly_summaries");
    await txn.runAsync(
      `
        INSERT INTO monthly_summaries (id, completed_workouts, planned_workouts, missed_workouts)
        VALUES (1, 0, 0, 0)
      `,
    );
  });
}

export async function addAvailableExercise(exercise: MockAvailableExercise) {
  const db = await initializeDatabase();
  const targetValue =
    exercise.target.type === "duration" ? exercise.target.seconds : exercise.target.reps;

  await db.runAsync(
    `
      INSERT INTO exercises (id, title, description, help, target_type, target_value)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    exercise.id,
    exercise.title,
    exercise.description,
    exercise.help,
    exercise.target.type,
    targetValue,
  );
}

export async function updateAvailableExercise(exercise: MockAvailableExercise) {
  const db = await initializeDatabase();
  const targetValue =
    exercise.target.type === "duration" ? exercise.target.seconds : exercise.target.reps;

  await db.runAsync(
    `
      UPDATE exercises
      SET title = ?, description = ?, help = ?, target_type = ?, target_value = ?
      WHERE id = ?
    `,
    exercise.title,
    exercise.description,
    exercise.help,
    exercise.target.type,
    targetValue,
    exercise.id,
  );
}

export async function importWorkouts(
  importedWorkouts: WorkoutImportPayload[],
  defaultRepsExerciseDurationMinutes: number,
) {
  const db = await initializeDatabase();
  const existingWorkoutIds = await db.getAllAsync<{ id: string }>("SELECT id FROM workouts");
  const existingExerciseIds = await db.getAllAsync<{ id: string }>("SELECT id FROM exercises");

  let nextWorkoutNumber =
    getHighestNumericSuffix(
      existingWorkoutIds.map((row) => row.id),
      "workout-",
    ) + 1;
  let nextExerciseNumber =
    getHighestNumericSuffix(
      existingExerciseIds.map((row) => row.id),
      "exercise-",
    ) + 1;

  const workoutsToInsert = importedWorkouts.map((workout) => {
    const exercises = workout.exercises.map(
      (exercise): MockExercise => ({
        id: `exercise-${String(nextExerciseNumber++).padStart(3, "0")}`,
        title: exercise.title.trim(),
        description: exercise.description.trim(),
        help: exercise.help.trim(),
        target: exercise.target,
      }),
    );

    return {
      id: `workout-${String(nextWorkoutNumber++).padStart(3, "0")}`,
      title: workout.title.trim(),
      description: workout.description.trim(),
      difficulty: workout.difficulty,
      category: workout.category,
      totalDurationMinutes: calculateWorkoutTotalDurationMinutes(
        exercises,
        workout.restSecondsBetweenExercises,
        defaultRepsExerciseDurationMinutes,
      ),
      restSecondsBetweenExercises: workout.restSecondsBetweenExercises,
      exercises,
    } satisfies MockWorkout;
  });

  const availableExercisesToInsert = buildAvailableExercisesFromWorkouts(workoutsToInsert);

  await db.withExclusiveTransactionAsync(async (txn) => {
    for (const exercise of availableExercisesToInsert) {
      await txn.runAsync(
        `
          INSERT INTO exercises (id, title, description, help, target_type, target_value)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        exercise.id,
        exercise.title,
        exercise.description,
        exercise.help,
        exercise.target.type,
        exercise.target.type === "duration" ? exercise.target.seconds : exercise.target.reps,
      );
    }

    for (const workout of workoutsToInsert) {
      await txn.runAsync(
        `
          INSERT INTO workouts (
            id,
            title,
            description,
            difficulty,
            category,
            total_duration_minutes,
            rest_seconds_between_exercises,
            last_done_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        workout.id,
        workout.title,
        workout.description,
        workout.difficulty,
        workout.category,
        workout.totalDurationMinutes,
        workout.restSecondsBetweenExercises,
        null,
      );

      await replaceWorkoutExercises(txn, workout);
    }
  });
}

async function replaceWorkoutExercises(txn: SQLiteDatabase, workout: MockWorkout) {
  await txn.runAsync("DELETE FROM workout_exercises WHERE workout_id = ?", workout.id);

  for (const [index, exercise] of workout.exercises.entries()) {
    const targetValue =
      exercise.target.type === "duration" ? exercise.target.seconds : exercise.target.reps;

    await txn.runAsync(
      `
        INSERT INTO workout_exercises (
          workout_id,
          exercise_id,
          sort_order,
          title,
          description,
          help,
          target_type,
          target_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      workout.id,
      exercise.id,
      index,
      exercise.title,
      exercise.description,
      exercise.help,
      exercise.target.type,
      targetValue,
    );
  }
}

export async function addWorkout(workout: MockWorkout) {
  const db = await initializeDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `
        INSERT INTO workouts (
          id,
          title,
          description,
          difficulty,
          category,
          total_duration_minutes,
          rest_seconds_between_exercises,
          last_done_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      workout.id,
      workout.title,
      workout.description,
      workout.difficulty,
      workout.category,
      workout.totalDurationMinutes,
      workout.restSecondsBetweenExercises,
      workout.lastDoneDate ?? null,
    );

    await replaceWorkoutExercises(txn, workout);
  });
}

export async function updateWorkout(workout: MockWorkout) {
  const db = await initializeDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `
        UPDATE workouts
        SET
          title = ?,
          description = ?,
          difficulty = ?,
          category = ?,
          total_duration_minutes = ?,
          rest_seconds_between_exercises = ?,
          last_done_date = ?
        WHERE id = ?
      `,
      workout.title,
      workout.description,
      workout.difficulty,
      workout.category,
      workout.totalDurationMinutes,
      workout.restSecondsBetweenExercises,
      workout.lastDoneDate ?? null,
      workout.id,
    );

    await replaceWorkoutExercises(txn, workout);
  });
}

export async function deleteWorkout(workoutId: string) {
  const db = await initializeDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync("DELETE FROM workout_exercises WHERE workout_id = ?", workoutId);
    await txn.runAsync("DELETE FROM planned_workout_days WHERE workout_id = ?", workoutId);
    await txn.runAsync("DELETE FROM workouts WHERE id = ?", workoutId);
  });
}

export async function saveWeeklyPlan(plan: MockWeeklyWorkoutPlan) {
  const db = await initializeDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `
        INSERT INTO planned_workouts (
          id,
          week_start_date,
          week_number,
          year,
          required_training_days,
          source
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(week_start_date) DO UPDATE SET
          id = excluded.id,
          week_number = excluded.week_number,
          year = excluded.year,
          required_training_days = excluded.required_training_days,
          source = excluded.source
      `,
      plan.id,
      plan.weekStartDate,
      plan.weekNumber,
      plan.year,
      plan.requiredTrainingDays,
      "sqlite",
    );

    await txn.runAsync(
      "DELETE FROM planned_workout_days WHERE planned_workout_id = ?",
      plan.id,
    );

    for (const day of plan.plannedDays) {
      await txn.runAsync(
        `
          INSERT INTO planned_workout_days (
            planned_workout_id,
            day_date,
            day_label,
            workout_id,
            workout_title
          ) VALUES (?, ?, ?, ?, ?)
        `,
        plan.id,
        day.dayDate,
        day.dayLabel,
        day.workoutId,
        day.workoutTitle,
      );
    }
  });
}

export async function addWorkoutLog(log: MockWorkoutLogEntry) {
  const db = await initializeDatabase();
  await db.runAsync(
    `
      INSERT INTO workout_logs (
        id,
        workout_id,
        workout_title,
        completed_at,
        completed_date,
        exercise_count,
        completed_exercise_count,
        skipped_exercise_count,
        total_duration_minutes,
        source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    log.id,
    log.workoutId,
    log.workoutTitle,
    log.completedAt,
    log.completedDate,
    log.exerciseCount,
    log.completedExerciseCount,
    log.skippedExerciseCount,
    log.totalDurationMinutes,
    "sqlite",
  );
}

export async function updateWorkoutLastDoneDate(workoutId: string, completionDate: string) {
  const db = await initializeDatabase();
  await db.runAsync(
    "UPDATE workouts SET last_done_date = ? WHERE id = ?",
    completionDate,
    workoutId,
  );
}
