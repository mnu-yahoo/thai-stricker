# Migrations

Migration versions are stored in `app_meta.seed_version`. Initialization is
shared between callers, and failed initialization can be retried.

## Version 14: shared exercise identity

Applied automatically before the first data load after updating the app. The
entire migration, including its version marker, uses one exclusive transaction.

1. Archive every original row of `exercises`, `workout_exercises`,
   `exercise_techniques` and `ai_coach_tips` as JSON, including the source rowid.
2. Group exercises by normalized title. Keep the smallest rowid and fill its
   blank description/help/category/image from subsequent records in rowid order.
3. Repoint workout occurrences. Merge techniques in canonical-first order,
   dropping duplicate techniques and retaining at most five. Prefer the canonical
   coach tip; otherwise transfer the first available tip. Variants remain archived.
4. Repair missing exercise references left by older manual editors: reuse the
   library record by name or recover one from the occurrence's stored text and
   target. Multiple occurrences and their positions/targets remain intact.
5. Create the unique normalized-name index, harmonize legacy workout text
   columns and record version 14. Duplicate library rows are removed only after
   references are reassigned.

Workouts, durations, planning and logs are not reset by version 14. Older
migrations retain their existing behavior. Fresh installs seed the legacy
schema and then apply version 14. Subsequent launches skip the migration.
Failures roll back the archive, schema and data changes together.

## Recovering pre-migration data

Inspect the archive in a copy of the device database, for example:

```sql
SELECT source_rowid, payload_json
FROM exercise_migration_archive
WHERE source_table = 'workout_exercises'
ORDER BY source_rowid;
```

Each JSON payload retains the old column values, including original IDs and
texts. Use the corresponding `exercises`, `exercise_techniques` and
`ai_coach_tips` archive entries to inspect merged variants. Restoring old rows
directly into the active library would conflict with its new uniqueness rule;
recovery should extract or selectively reapply the desired content.

## Verification

- `npm test` (Node 24+) executes the production repository against real SQLite
  through an adapter for Expo's native transport.
- `npm run typecheck` checks TypeScript.
- `npx expo export --platform android` checks Android bundle generation.
- On an Android device with version-13 data, launch the updated app, check that
  the library contains one entry per name and that pagination reflects the new
  count. Open a workout with repeated occurrences, delete just one, save and
  restart. Edit the shared exercise and verify every workout shows the new
  details while its duration/repetitions remain unchanged.
