# Edit Workout Screen

Status: Approved

Version: 1.0

## Purpose

The Edit Workout Screen lets the user update an existing mocked workout from the Workouts screen.

## User Goals

A user should be able to:

- Open Edit Workout from the Workouts screen
- Change workout title
- Change workout description
- Change workout difficulty
- Change workout category
- Add exercises from available exercises
- Remove exercises from the workout
- Save the updated mocked workout
- Return to Workouts without saving if needed

## Entry Point

Current entry point:

- Opened from the `Edit workout` action on a workout card in the Workouts screen

## Editable Fields

Current editable fields:

- Title
- Description
- Difficulty
- Category

## Exercise List Behavior

Current behavior:

- Existing workout exercises are prefilled in order
- User can add exercises from the available exercises list
- User can remove exercises from the workout
- Available exercises remain available after being added
- Exercise order is preserved
- Add Exercise and Edit Exercise controls inside this screen remain placeholder-only

## Total Duration Calculation

Current behavior:

- Total duration is calculated automatically
- Duration exercises use their seconds value
- Reps exercises use Settings default duration in minutes for reps exercises
- Rest time between exercises uses Settings rest time
- Total duration is rounded up to minutes

## Settings Dependencies

Current dependencies:

- Maximum exercises per workout is enforced
- Rest time between exercises is used for duration calculation
- Default reps exercise duration is used for duration calculation
- Available exercises pagination uses Settings page-size value

## Validation Rules

Current validation:

- Workout title is required
- Workout description is required
- At least one exercise is required
- Exercise count must be less than or equal to the Settings maximum

## Save Behavior

Current behavior:

- Saving updates the selected mocked workout in app-level session state
- Workout id is preserved
- `lastDoneDate` is preserved
- Exercise order is preserved
- User returns to the Workouts screen after saving

## Cancel Behavior

Current behavior:

- `Back to workouts` returns to the Workouts screen without saving changes

## Current Data Source

Current implementation:

- Mocked workouts in app-level session state
- Mocked available exercises in app-level session state

No:

- SQLite
- Drizzle
- AsyncStorage
- API
- Cloud sync

## Future Data Source

Planned later:

- Persistent workout editing
- Database-backed workout storage

These are not implemented now.

## Out Of Scope

The Edit Workout Screen must not implement:

- Persistence
- Database integration
- Workout deletion
- AI workout editing
- Add Exercise screen flow inside Edit Workout
- Edit Exercise screen flow inside Edit Workout

## Codex Rules

- Edit Workout is opened from the Workouts screen
- Based on Add Workout behavior
- Total duration is calculated, not user-entered
- Settings maximum exercises is enforced
- Settings rest time is used
- Settings default reps duration is used
- Changes are mocked and session-only
- No persistence
- No database
- No workout deletion
