# Start Workout Screen

Status: Approved

Version: 1.0

## Purpose

The Start Workout screen runs a selected workout from the first exercise to the last using mocked data only.

## User Goals

A user should be able to:

- Start a selected workout from the Workouts screen
- Progress through each exercise in sequence
- See rest after non-final exercises
- Finish rep-based exercises manually
- Watch countdowns for time-based exercises
- Skip the current exercise if needed

## Flow States

The mocked flow includes:

- Exercise step
- Rest step
- Finished recap

## Exercise Behavior

Each exercise step shows:

- Workout title
- Exercise position
- Exercise title
- Exercise description
- Exercise help
- Exercise target
- Skip exercise action

## Rest Behavior

Rest appears after each exercise except the final one.

The rest state shows:

- Rest title
- Remaining rest time
- Next exercise title
- Skip rest action

Rest time comes from mocked Settings state.

## Skip Behavior

Skip exercise moves forward in the mocked workout flow.

If another exercise exists, the flow moves to rest.

If the skipped exercise is the final exercise, the flow moves to the finished recap.

## Timer Behavior

Time-based exercises use a countdown timer.

Rep-based exercises require manual finish.

Timers use React hooks and are cleaned up on step change and unmount.

## Data Source

Mocked data only.

No persistence.

No database.

## Out Of Scope

- SQLite
- Drizzle
- AsyncStorage
- Real workout execution persistence
- Workout history storage
- Calendar update
- Analytics

## Codex Rules

- Time-based exercises use countdown timer
- Rep-based exercises require manual finish
- Rest appears after each exercise except the final one
- Rest time comes from mocked Settings state
- No persistence
- No database
