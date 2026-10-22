# Edit Exercise Screen

Status: Approved

Version: 1.0

## Purpose

The Edit Exercise screen lets the user update an existing mocked available exercise from the Add Workout flow.

## User Goals

A user should be able to:

- Open Edit Exercise from the Add Workout Available Exercises list
- Change exercise title
- Review the generated exercise description
- Change exercise Tip
- Review the exercise detail without editing it
- Save the updated mocked exercise
- Return to Add Workout without losing in-progress workout state

## Entry Point

Current entry point:

- Opened from the `Edit` action on an Available Exercise card in Add Workout

## Editable Fields

Current editable fields:

- Title
- Tip
- Category and selected techniques

## Read-Only Fields

Current read-only fields:

- Exercise detail
- Description (generated from selected technique names)
- Exercise id

## Validation Rules

Current validation:

- Exercise title is required
- At least one technique is required

## Save Behavior

Current behavior:

- Saving updates the mocked available exercise in session-only state
- Exercise id is preserved
- Exercise detail is preserved
- Exercise description is regenerated from the selected technique names
- User returns to Add Workout after saving

## Cancel Behavior

Current behavior:

- `Back to Add Workout` returns to Add Workout without saving changes
- Current Add Workout form state is preserved

## State Preservation Behavior

Current behavior:

- Workout title is preserved
- Workout description is preserved
- Selected difficulty is preserved
- Selected category is preserved
- Already-added workout exercises are preserved
- Calculated total duration is preserved
- Current available exercises page remains preserved during the local screen switch

## Current Data Source

Current implementation:

- Mocked available exercise state stored in app-level session state
- No persistence

No:

- Drizzle
- AsyncStorage
- API
- Cloud sync

## Future Data Source

Planned later:

- Persistent exercise editing
- Database-backed exercise storage

These are not implemented now.

## Out Of Scope

The Edit Exercise screen must not implement:

- Editing exercise detail
- Editing exercise id
- Add Exercise screen
- Exercise deletion
- Persistence
- Database integration

## Codex Rules

- Edit Exercise is opened from Add Workout Available Exercises list
- Title, Tip, category and techniques are editable
- Description is generated from selected technique names and is not editable
- Exercise detail is not editable
- Existing Add Workout form state must be preserved
- Changes are mocked and session-only
- No persistence
- No database
