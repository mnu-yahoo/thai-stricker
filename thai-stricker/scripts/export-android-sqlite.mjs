import { DatabaseSync } from "node:sqlite";
import { existsSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const source = process.argv[2];
const destination = process.argv[3] ?? "thai-stricker-android-export.json";
if (!source || !existsSync(source)) {
  console.error("Usage: npm run migrate:android -- <thai-stricker.db> [sortie.json]");
  process.exit(1);
}

const db = new DatabaseSync(resolve(source), { readOnly: true });
const rows = (sql, ...params) => db.prepare(sql).all(...params).map((row) => ({ ...row }));
const one = (sql, ...params) => db.prepare(sql).get(...params);
const hasTable = (name) => Boolean(one("SELECT name FROM sqlite_master WHERE type='table' AND name=?", name));
const jsonArray = (value) => { try { const result = JSON.parse(value || "[]"); return Array.isArray(result) ? result : []; } catch { return []; } };
const numberSetting = (settings, key, fallback) => Number(settings[key] ?? fallback);

const settingsRows = hasTable("settings") ? rows("SELECT key, value FROM settings") : [];
const settings = Object.fromEntries(settingsRows.map((row) => [row.key, row.value]));
const techniques = hasTable("techniques") ? rows("SELECT id, name, short_name, description, category, sub_category FROM techniques").map((row) => ({
  id: row.id, name: row.name, shortName: row.short_name, description: row.description,
  category: row.category, subCategory: row.sub_category,
})) : [];
const links = hasTable("exercise_techniques") ? rows("SELECT exercise_id, technique_id FROM exercise_techniques ORDER BY exercise_id, sort_order") : [];
const exerciseRows = hasTable("exercises") ? rows("SELECT id, title, description, help, category, image_uri, target_type, target_value FROM exercises ORDER BY rowid") : [];
const exercises = exerciseRows.map((row) => ({
  id: row.id, title: row.title, description: row.description, help: row.help, category: row.category ?? "",
  ...(row.image_uri ? { imageUri: row.image_uri } : {}),
  target: row.target_type === "duration" ? { type: "duration", seconds: row.target_value } : { type: "reps", reps: row.target_value },
  techniqueIds: links.filter((link) => link.exercise_id === row.id).map((link) => link.technique_id),
}));
const exerciseById = new Map(exercises.map((item) => [item.id, item]));
const workoutRows = hasTable("workouts") ? rows("SELECT * FROM workouts ORDER BY rowid") : [];
const occurrenceRows = hasTable("workout_exercises") ? rows("SELECT * FROM workout_exercises ORDER BY workout_id, sort_order") : [];
const workouts = workoutRows.map((row) => ({
  id: row.id, title: row.title, description: row.description, difficulty: row.difficulty, category: row.category,
  totalDurationMinutes: row.total_duration_minutes, restSecondsBetweenExercises: row.rest_seconds_between_exercises,
  ...(row.last_done_date ? { lastDoneDate: row.last_done_date } : {}),
  exercises: occurrenceRows.filter((item) => item.workout_id === row.id).map((item) => {
    const shared = exerciseById.get(item.exercise_id);
    return { exerciseId: shared?.id ?? item.exercise_id, target: item.target_type === "duration" ? { type: "duration", seconds: item.target_value } : { type: "reps", reps: item.target_value } };
  }),
}));
const planRows = hasTable("planned_workouts") ? rows("SELECT * FROM planned_workouts ORDER BY week_start_date") : [];
const planDays = hasTable("planned_workout_days") ? rows("SELECT * FROM planned_workout_days ORDER BY day_date") : [];
const weeklyWorkoutPlans = planRows.map((row) => ({
  id: row.id, weekStartDate: row.week_start_date, weekNumber: row.week_number, year: row.year,
  requiredTrainingDays: row.required_training_days, source: "sqlite",
  plannedDays: planDays.filter((day) => day.planned_workout_id === row.id).map((day) => ({ dayDate: day.day_date, dayLabel: day.day_label, workoutId: day.workout_id, workoutTitle: day.workout_title })),
}));
const workoutLogs = hasTable("workout_logs") ? rows("SELECT * FROM workout_logs ORDER BY completed_at").map((row) => ({
  id: row.id, workoutId: row.workout_id, workoutTitle: row.workout_title, completedAt: row.completed_at, completedDate: row.completed_date,
  exerciseCount: row.exercise_count, completedExerciseCount: row.completed_exercise_count, skippedExerciseCount: row.skipped_exercise_count,
  totalDurationMinutes: row.total_duration_minutes, source: "sqlite",
})) : [];
const coachTips = hasTable("ai_coach_tips") ? rows("SELECT * FROM ai_coach_tips").map((row) => ({
  exerciseId: row.exercise_id, exerciseTitle: row.exercise_title, shortTip: row.short_tip,
  technicalTips: jsonArray(row.technical_tips_json), commonMistakes: jsonArray(row.common_mistakes_json),
  focusPoints: jsonArray(row.focus_points_json), explanation: row.explanation,
})) : [];
const calendarWorkoutDays = hasTable("calendar_day_statuses") ? rows("SELECT * FROM calendar_day_statuses").map((row) => ({ date: row.date, status: row.status, workoutName: row.workout_name })) : [];
const summary = hasTable("monthly_summaries") ? one("SELECT * FROM monthly_summaries WHERE id=1") : null;

const output = {
  schemaVersion: 1,
  exportedAt: new Date().toISOString(),
  settings: {
    restSecondsBetweenExercises: numberSetting(settings, "restSecondsBetweenExercises", 30),
    trainingDaysPerWeek: numberSetting(settings, "trainingDaysPerWeek", 3),
    maxExercisesPerWorkout: numberSetting(settings, "maxExercisesPerWorkout", 10),
    numberOfExercisesPerPage: numberSetting(settings, "numberOfExercisesPerPage", 6),
    defaultRepsExerciseDurationMinutes: numberSetting(settings, "defaultRepsExerciseDurationMinutes", 3),
    themePreference: settings.themePreference === "Dark" ? "Dark" : "Light",
  },
  techniques, exercises, workouts, weeklyWorkoutPlans, workoutLogs, coachTips, calendarWorkoutDays,
  monthlySummary: summary ? { completedWorkouts: summary.completed_workouts, plannedWorkouts: summary.planned_workouts, missedWorkouts: summary.missed_workouts } : { completedWorkouts: 0, plannedWorkouts: 0, missedWorkouts: 0 },
};

writeFileSync(resolve(destination), `${JSON.stringify(output, null, 2)}\n`, "utf8");
db.close();
console.log(`Export créé : ${resolve(destination)} (${basename(source)})`);
