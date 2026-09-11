import type { SQLiteDatabase } from "expo-sqlite";
import { normalizeExerciseName } from "../features/exercises/exerciseIdentity";

type StoredExercise = {
  id: string; title: string; description: string; help: string; category: string;
  image_uri: string | null; target_type: string; target_value: number;
};

// Called inside the initialization transaction. Archive first, including orphan
// workout references produced by older manual workout editors.
export async function migrateExercisesToVersion14(txn: SQLiteDatabase) {
  const version = await txn.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_meta WHERE key = 'seed_version'",
  );
  if (Number(version?.value) >= 14) return;

  await txn.execAsync(`
    CREATE TABLE exercise_migration_archive (
      source_table TEXT NOT NULL,
      source_rowid INTEGER NOT NULL,
      payload_json TEXT NOT NULL,
      PRIMARY KEY (source_table, source_rowid)
    );
  `);
  for (const table of ["exercises", "workout_exercises", "exercise_techniques", "ai_coach_tips"]) {
    const rows = await txn.getAllAsync<{ archive_rowid: number }>(
      `SELECT rowid AS archive_rowid, * FROM ${table} ORDER BY rowid`,
    );
    for (const { archive_rowid, ...payload } of rows) {
      await txn.runAsync(
        "INSERT INTO exercise_migration_archive VALUES (?, ?, ?)",
        table, archive_rowid, JSON.stringify(payload),
      );
    }
  }
  await txn.execAsync("ALTER TABLE exercises ADD COLUMN normalized_name TEXT NOT NULL DEFAULT ''");
  const exercises = await txn.getAllAsync<StoredExercise>("SELECT * FROM exercises ORDER BY rowid");
  const canonical = new Map<string, StoredExercise>();
  for (const exercise of exercises) {
    const name = normalizeExerciseName(exercise.title);
    const first = canonical.get(name);
    if (!first) {
      canonical.set(name, exercise);
      await txn.runAsync("UPDATE exercises SET normalized_name = ? WHERE id = ?", name, exercise.id);
      continue;
    }
    for (const field of ["description", "help", "category", "image_uri"] as const) {
      if (!first[field]?.trim() && exercise[field]?.trim()) first[field] = exercise[field]!;
    }
    await txn.runAsync(
      "UPDATE exercises SET description = ?, help = ?, category = ?, image_uri = ? WHERE id = ?",
      first.description, first.help, first.category, first.image_uri, first.id,
    );
    await txn.runAsync("UPDATE workout_exercises SET exercise_id = ? WHERE exercise_id = ?", first.id, exercise.id);
    const techniques = await txn.getAllAsync<{ technique_id: string }>(
      "SELECT technique_id FROM exercise_techniques WHERE exercise_id IN (?, ?) ORDER BY CASE WHEN exercise_id = ? THEN 0 ELSE 1 END, sort_order",
      first.id, exercise.id, first.id,
    );
    await txn.runAsync("DELETE FROM exercise_techniques WHERE exercise_id IN (?, ?)", first.id, exercise.id);
    const uniqueTechniques = [...new Set(techniques.map((row) => row.technique_id))].slice(0, 5);
    for (const [index, technique] of uniqueTechniques.entries()) {
      await txn.runAsync("INSERT INTO exercise_techniques VALUES (?, ?, ?)", first.id, technique, index);
    }
    await txn.runAsync(
      "UPDATE OR IGNORE ai_coach_tips SET exercise_id = ?, exercise_title = ? WHERE exercise_id = ?",
      first.id, first.title, exercise.id,
    );
    await txn.runAsync("DELETE FROM ai_coach_tips WHERE exercise_id = ?", exercise.id);
    await txn.runAsync("DELETE FROM exercises WHERE id = ?", exercise.id);
  }

  const orphans = await txn.getAllAsync<StoredExercise & { workout_id: string; sort_order: number; exercise_id: string }>(`
    SELECT workout_exercises.* FROM workout_exercises
    LEFT JOIN exercises ON exercises.id = workout_exercises.exercise_id
    WHERE exercises.id IS NULL ORDER BY workout_exercises.rowid
  `);
  for (const occurrence of orphans) {
    const name = normalizeExerciseName(occurrence.title);
    let shared = canonical.get(name);
    if (!shared) {
      // A deterministic, reserved ID also handles one old ID used for different names.
      const id = `migrated-14-${occurrence.workout_id}-${occurrence.sort_order}`;
      shared = { ...occurrence, id, category: "", image_uri: null };
      await txn.runAsync(
        "INSERT INTO exercises (id, title, description, help, target_type, target_value, normalized_name) VALUES (?, ?, ?, ?, ?, ?, ?)",
        id, shared.title, shared.description, shared.help, shared.target_type, shared.target_value, name,
      );
      canonical.set(name, shared);
    }
    await txn.runAsync(
      "UPDATE workout_exercises SET exercise_id = ? WHERE workout_id = ? AND sort_order = ?",
      shared.id, occurrence.workout_id, occurrence.sort_order,
    );
  }
  await txn.execAsync(`
    CREATE UNIQUE INDEX exercises_normalized_name_unique ON exercises(normalized_name);
    UPDATE workout_exercises SET
      title = (SELECT title FROM exercises WHERE id = exercise_id),
      description = (SELECT description FROM exercises WHERE id = exercise_id),
      help = (SELECT help FROM exercises WHERE id = exercise_id);
    INSERT INTO app_meta (key, value) VALUES ('seed_version', '14')
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
  `);
}
