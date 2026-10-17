# Data schema

The active application stores its data in versioned local web storage sections.
The repository validates every snapshot before saving it and starts from fresh
seed data when an older storage manifest is found.

## Techniques

- `techniques` contains atomic strikes or movements.
- Each technique has an ID, display name, short name, description, category and subcategory.

## Exercises

- `exercises` is the canonical exercise library.
- Each exercise owns its descriptive fields, default detail and ordered `techniqueIds`.
- An exercise must reference at least one existing technique and may reference at most five distinct techniques.
- Exercise names are unique after trimming, collapsing whitespace and lowercasing.

## Workouts

- `workouts` contains the workout definition and an ordered `exercises` array.
- Each workout occurrence stores only `{ exerciseId, detail }`.
- The same exercise may appear more than once with different targets.
- Descriptive exercise data is resolved from the exercise library in memory and is not duplicated in persisted workout data.
- Workout duration is calculated from occurrence details and rest time.

## Local storage

- The current manifest uses storage version 3.
- Data is split into settings, workouts, schedules, logs, coach tips and calendar sections.
- A reset removes the current manifest and section revisions.
- Older manifests are intentionally ignored after the schema refonte; no legacy conversion is performed.
