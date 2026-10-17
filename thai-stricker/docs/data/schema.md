# Schema

The local SQLite database is `thai-stricker.db`. The repository creates its
tables and applies migrations before exposing application data.

## Canonical exercises and workout occurrences (web schema v3)

- `exercises` is the canonical exercise library. Each row owns its descriptive fields, default target and ordered `techniqueIds`.
- An exercise must reference at least one existing technique and may reference at most five distinct techniques.
- `workouts.exercises` stores only `{ exerciseId, target }` occurrences. The array position is the workout order, repeated exercise IDs are valid, and each occurrence can use a different target.
- Workout display data is resolved from `exercises` in memory and is not duplicated in persisted workout data.
- The v3 local-storage manifest starts from fresh seed data when an older manifest is present; old local data is not migrated.

## Shared exercises (SQLite version 14)

- `exercises.id` identifies a shared library record. `normalized_name` is the
  complete title after trimming, collapsing whitespace and lowercasing in
  `normalizeExerciseName`. A unique SQLite index prevents duplicate keys.
- Title, description, help, category and image belong to the shared record.
  The exercise target is only the default for new workout occurrences.
- `workout_exercises` uses `(workout_id, sort_order)` as its primary key. Its
  `exercise_id` references the shared record; `target_type` and `target_value`
  belong to that occurrence. Repeated occurrences are valid.
- Historical title/description/help columns remain on `workout_exercises` for
  compatibility, but reads join `exercises` for all shared details. Workout
  saves validate that each referenced exercise exists.
- `checksum` is retained for historical migration compatibility and is no
  longer an exercise identity or import lookup key.
- `exercise_techniques` associates up to five ordered, distinct techniques with
  an exercise. `ai_coach_tips` is keyed by exercise ID.
- `exercise_migration_archive` stores the version-14 pre-migration rows as JSON,
  keyed by `(source_table, source_rowid)`. It is recovery data, not the library.

Imports reuse records by normalized name, filling only blank shared fields.
Manual duplicate creation and conflicting renames produce an error. All these
operations run in serialized exclusive transactions. The workout JSON import
format has not changed.
