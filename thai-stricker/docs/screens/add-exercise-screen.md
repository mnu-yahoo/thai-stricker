# Add Exercise Screen

Status: Approved

Version: 1.0

## Purpose

The Add Exercise screen lets the user create a mocked available exercise from the Add Workout flow.

## User Goals

A user should be able to:

- Open Add Exercise from Add Workout
- Enter exercise title
- Enter exercise description
- Enter exercise help
- Save the new mocked exercise
- Return to Add Workout without losing in-progress workout state

## Entry Point

Current entry point:

- Opened from the top-level `Add` action in the Add Workout Available Exercises list

## Editable Fields

Current editable fields:

- Title
- Description
- Help

## Default Target Behavior

Current behavior:

- New exercises are assigned a mocked default target of `10 reps`
- Target selection is not editable in this screen

## Validation Rules

Current validation:

- Exercise title is required
- Exercise description is required
- Exercise help is required

## Save Behavior

Current behavior:

- Saving creates a new mocked available exercise
- The new exercise is added to the end of the Available Exercises list
- User returns to Add Workout after saving

## Cancel Behavior

Current behavior:

- `Back to Add Workout` returns to Add Workout without saving

## Pagination Behavior

Current behavior:

- Available Exercises pagination recalculates after a new exercise is added
- The Add Workout flow moves to the final Available Exercises page so the new exercise is visible

## State Preservation Behavior

Current behavior:

- Workout title is preserved
- Workout description is preserved
- Selected difficulty is preserved
- Selected category is preserved
- Already-added workout exercises are preserved
- Calculated total duration is preserved
- Current Add Workout state remains intact while switching screens

## Current Data Source

Current implementation:

- Mocked available exercise state stored in app-level session state
- No persistence

No:

- SQLite
- Drizzle
- AsyncStorage
- API
- Cloud sync

## Future Data Source

Planned later:

- Persistent exercise creation
- Database-backed exercise storage

These are not implemented now.

## Out Of Scope

The Add Exercise screen must not implement:

- Exercise target selection
- Exercise deletion
- Persistence
- Database integration

## Codex Rules

- Add Exercise is opened from Add Workout Available Exercises top-level Add button
- Only title, description, and help are editable
- Target is assigned a mocked default
- New exercise is added to the end of the Available Exercises list
- Available Exercises pagination recalculates after save
- Current Add Workout form state must be preserved
- Changes are mocked and session-only
- No persistence
- No database
