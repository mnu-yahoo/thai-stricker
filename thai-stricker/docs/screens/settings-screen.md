# Settings Screen

Status: Approved

Version: 1.0

## Purpose

The Settings Screen gives the user a place to adjust training preferences visually.

Its purpose is to:

- Let the user set rest time between exercises locally
- Let the user set desired training days per week locally
- Let the user set a maximum exercises per workout value locally
- Let the user set a number of exercises per page value locally
- Let the user set a default duration in minutes for reps exercises locally
- Let the user choose a light or dark theme preference locally
- Show clearly that these settings are placeholders for now

## User Goals

A user should be able to:

- Open the Settings tab from the bottom navbar
- Adjust rest time between workout exercises locally
- Adjust training days per week locally
- Adjust the maximum exercises per workout locally
- Adjust the number of exercises per page locally
- Adjust the default duration in minutes for reps exercises locally
- Choose a light or dark theme preference locally
- See the app theme change immediately

## Layout Structure

### Header

Displays:

- Screen title
- Short explanatory subtitle

### Training Preferences Card

Displays:

- Rest time between workout exercises
- Training days per week
- Maximum exercises per workout
- Number of Exercises per page
- Default duration in minutes for reps exercises

### Appearance Card

Displays:

- Theme preference

### Scope Note Card

Displays:

- Explanation that settings are local placeholders only

## Settings Data Model Overview

The screen uses local UI state only for:

- restSeconds
- trainingDaysPerWeek
- maxExercisesPerWorkout
- numberOfExercisesPerPage
- defaultRepsExerciseDurationMinutes
- themePreference

Allowed values:

- restSeconds: 15, 30, 45, 60, 90, 120
- trainingDaysPerWeek: 1 to 7
- maxExercisesPerWorkout: 6, 8, 10, 12, 14, 16, 18, 20
- numberOfExercisesPerPage: 4, 6, 8, 10
- defaultRepsExerciseDurationMinutes: 1, 2, 3, 4, 5
- themePreference: light or dark

## Current Data Source

Current implementation:

- Rest time is currently shared through mocked app-level state
- Training days per week is currently shared through mocked app-level state
- Maximum exercises per workout is currently shared through mocked app-level state
- Number of exercises per page is currently shared through mocked app-level state
- Default duration in minutes for reps exercises is currently shared through mocked app-level state
- Theme preference is currently shared through mocked app-level state
- Changing the rest time updates the value displayed by the Workouts screen
- Changing training days per week updates the value displayed by the Schedule screen
- Changing maximum exercises per workout only updates mocked Settings state for now
- Changing number of exercises per page only updates mocked Settings state for now
- Changing default reps exercise duration only updates mocked Settings state for now
- Changing theme preference updates the visible app theme immediately
- This is not persisted yet

No:

- SQLite
- Drizzle
- AsyncStorage
- API
- Cloud sync

## Future Data Source

Planned later:

- Persisted settings storage
- Optional database-backed preferences

These are not implemented in this screen now.

## Actions

### Adjust Rest Time

Current behavior:

- Updates local UI state only

### Adjust Training Days Per Week

Current behavior:

- Updates mocked shared app-level state only

### Choose Theme Preference

Current behavior:

- Updates mocked shared app-level state only
- Immediately changes the actual app theme for the current session

## Maximum Exercises Per Workout

Purpose:

- Define the maximum number of exercises allowed when creating a workout.

Allowed values:

- 6
- 8
- 10
- 12
- 14
- 16
- 18
- 20

Default:

- 10

Current behavior:

- User can select a maximum exercise count.
- Value is stored in mocked local app state only.
- Value is not persisted.

Future behavior:

- Add Workout screen will use this value when creating workouts.

Not implemented:

- Add Workout screen
- Existing workout validation
- Existing workout updates
- Database persistence

## Number Of Exercises Per Page

Purpose:

- Define how many available exercises should be shown per page.

Allowed values:

- 4
- 6
- 8
- 10

Default:

- 6

Current behavior:

- User can select the value in Settings.
- Value is stored in mocked local app state only.
- Value is not persisted.
- Value is not applied anywhere yet.

Future behavior:

- Add Workout available exercise pagination may use this value later.

Not implemented:

- Applying value to Add Workout pagination
- Database persistence

## Default Duration For Reps Exercises

Purpose:

- Define a default duration estimate for reps-based exercises.

Allowed values:

- 1
- 2
- 3
- 4
- 5

Default:

- 3 minutes

Current behavior:

- User can select the value in Settings.
- Value is stored in mocked local app state only.
- Value is not persisted.
- Value is not applied anywhere yet.

Future behavior:

- Add Workout or workout duration calculations may use this value later.

Not implemented:

- Applying value to Add Workout
- Applying value to workout execution
- Updating existing workouts
- Database persistence

## Theme Preference

Current behavior:
- User can select Light or Dark.
- Light loads the app Light Theme.
- Dark loads the app Dark Theme.
- Theme changes apply immediately in mocked local state.
- Theme selection is not persisted yet.

Future behavior:
- Theme tokens should be replaced with final Google Stitch output.

## Out Of Scope

The Settings Screen must not implement:

- Settings persistence
- Database access
- Updating workout rest times
- Updating existing workouts to match maximum exercises
- Validating existing workouts against maximum exercises
- Applying number of exercises per page to Add Workout pagination
- Applying default reps exercise duration to Add Workout
- Applying default reps exercise duration to workout execution
- Updating existing workouts with default reps duration
- Theme providers
- Scheduling behavior
- Schedule generation

## Codex Rules

- Settings Screen may display and adjust local UI state
- Settings Screen must not persist settings yet
- Settings Screen must not update workout rest times yet
- Settings Screen must not validate or change existing workouts when maximum exercises changes
- Settings Screen must not apply number of exercises per page anywhere yet
- Settings Screen must not apply default reps exercise duration anywhere yet
- Settings Screen must not implement scheduling behavior
- Settings Screen must not implement database access
- Read only `docs/project-scope.md`, `docs/screens/settings-screen.md`, and relevant architecture documents when modifying this screen
- Do not implement functionality not explicitly described in this document
