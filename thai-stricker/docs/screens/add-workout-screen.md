# Add Workout Screen

Status: Approved

Version: 1.0

## Purpose

The Add Workout screen lets the user create a mocked workout with form inputs and select exercises from a mocked available-exercise library.

## User Goals

A user should be able to:

- Open the Add Workout flow from the Workouts screen
- Enter workout title, description, and other workout properties
- Add exercises from the available list
- Review the exercise list before saving
- Remove an exercise before saving if needed
- Save the workout
- See clear validation errors on screen
- Return to Home after a valid save

## Layout Structure

### Header

Displays:

- Screen title
- Short explanatory subtitle

### Workout Details Card

Displays:

- Workout title input
- Description input
- Difficulty selector
- Category selector
- Calculated total duration display

### Available Exercises Card

Displays:

- Available exercise cards
- Exercise title
- Exercise description
- `Add` action

### Exercise List Card

Displays:

- Current exercises in order
- Exercise target summary
- Remove action for each exercise

### Save Actions

Displays:

- `Back to workouts`
- `Save workout`

## Accepted Values

Difficulty:

- Beginner
- Intermediate
- Advanced

Category:

- Fundamentals
- Striking
- Defense
- Conditioning
- Footwork

## Workout Property Inputs

Current behavior:

- The user fills out workout details with form inputs only
- The previous JSON-input workflow has been removed
- Difficulty and category use the existing mocked value sets
- Workout total duration cannot be entered manually

## Exercise Input Behavior

Current behavior:

- Exercises are selected from a mocked available-exercise list
- The available list displays exercise title and description only
- Available exercise data includes help text and target data used after selection
- The same available exercise may be added multiple times
- The screen blocks adding more than the Settings maximum exercises per workout

## Available Exercises Pagination

The Available Exercises list is paginated.

Current behavior:

- Shows available exercises based on the Settings page-size value
- Shows current page number
- Shows total pages
- User can navigate with Previous and Next controls
- Available exercise rows still display only title and description

Not implemented:

- Search
- Filtering
- Sorting

## Exercise Library Placeholder Actions

The Available Exercises list includes placeholder actions for future exercise management.

Current behavior:

- Top-level Add button opens the mocked Add Exercise screen
- Exercise card Edit button opens the mocked Edit Exercise screen
- Existing exercise Add button still adds the exercise to the new workout

Not implemented:

- Creating exercises
- Editing exercises
- Deleting exercises

## Add Exercise Action

The Available Exercises list provides a top-level Add action.

Current behavior:

- Opens the mocked Add Exercise screen
- User can enter exercise title, description, and help
- Exercise target is assigned a mocked default
- Saving adds the exercise to the end of the Available Exercises list
- Pagination recalculates after saving
- User returns to Add Workout after saving
- Current Add Workout form state is preserved

Not implemented:

- Editing exercise target during creation
- Persisting exercise changes
- Saving exercises to a database

## Edit Exercise Action

The Available Exercises list provides an Edit action.

Current behavior:

- Opens the mocked Edit Exercise screen
- User can edit exercise title, description, and help
- User cannot edit exercise target
- Saving updates the mocked Available Exercises list
- User returns to Add Workout after saving
- Current Add Workout form state is preserved

Not implemented:

- Editing exercise target
- Persisting exercise changes
- Editing exercises in a database

## Exercise List Behavior

Current behavior:

- Exercises appear in the order they were added
- Each exercise shows its target
- The user can remove an exercise before saving

## Validation Rules

Current validation:

- Workout title is required
- Workout description is required
- At least one exercise is required before saving
- Exercise count must be less than or equal to the Settings maximum exercises per workout
- Existing workouts are not validated against the setting

## Error Handling

Current behavior:

- Errors are shown directly on screen
- Invalid or incomplete workout fields do not save
- Invalid exercise selection state does not add more exercises once the Settings maximum is reached

## Settings Dependency

Current dependency:

- Add Workout enforces Settings maximum exercises per workout
- The limit comes from mocked app-level Settings state
- Rest time between exercises comes from mocked app-level Settings state
- Reps exercises use the mocked Settings default duration in minutes for reps exercises
- The available exercise list comes from mocked app data seeded from existing workout exercises

## Total Duration Calculation

The Add Workout screen does not allow the user to enter workout total duration manually.

Total duration is calculated from:

- Duration-based exercise seconds
- Reps-based exercises using Settings default duration in minutes for reps exercises
- Rest time between exercises from Settings

Formula:

- Add all exercise durations
- Add rest time between exercises only
- Round up total seconds to minutes

Current behavior:

- Calculated total duration is displayed as read-only
- Calculated total duration is saved in the mocked workout object

Not implemented:

- Recalculating existing workouts
- Persisting calculated duration

## Save Behavior

Current behavior:

- Saving creates a mocked workout object
- Selected exercises are copied into the new workout in the selected order
- Saved workout exercises receive fresh mocked ids
- New workouts are stored in local mocked app state only
- After saving, the user is redirected to Home
- Saved workouts use the calculated total duration

## Current Data Source

Current implementation:

- Mocked workout objects
- Mocked available exercise objects derived from mocked workout exercises
- Mocked app-level workouts state only
- Added workouts exist only for the current app session

No:

- SQLite
- Drizzle
- AsyncStorage
- API
- Cloud sync

## Future Data Source

Planned later:

- Persistent workout creation
- Database-backed workout storage

These are not implemented now.

## Out Of Scope

The Add Workout screen must not implement:

- Persistence
- Database integration
- AI workout generation
- File import
- Edit Workout
- Delete Workout
- Existing workout validation
- Existing workout updates

## Codex Rules

- The previous JSON-input workflow has been removed
- Add Workout now uses form inputs
- Add Workout selects exercises from a mocked available-exercise list
- Available Exercises includes placeholder Add action for future exercise creation
- Available Exercises top-level Add action opens a mocked Add Exercise screen
- Available Exercises Edit action opens a mocked Edit Exercise screen
- Add Workout creates mocked workout objects only
- New workouts are stored in local mocked app state only
- After saving, user is redirected to Home
- Total duration is calculated automatically and is read-only
- Add Workout enforces Settings maximum exercises per workout
- Add Workout does not persist data
- Add Workout does not validate existing workouts
- Add Workout does not implement Edit Workout
