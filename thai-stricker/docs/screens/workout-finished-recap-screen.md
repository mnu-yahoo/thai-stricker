# Workout Finished Recap Screen

Status: Approved

Version: 1.0

## Purpose

The Workout Finished Recap screen summarizes a completed mocked workout flow.

## Displayed Recap Fields

- Workout complete title
- Workout name
- Number of exercises completed or skipped
- Total exercises
- Mocked completion date

## Back To Home Behavior

The Back to Home action returns the user to the Home screen and restores the normal app shell.

## Mocked Last Done Date Update

The selected workout receives a mocked `lastDoneDate` using today's ISO date.

Last done date is local mocked state only.

It does not update the database.

It does not update real workout history.

It does not update the Home calendar yet.

## Workout Log Entry

When a mocked workout is completed:

- A mocked workout log entry is created
- The log entry is stored in local app-level state
- The Home screen uses these log entries for the calendar preview

This does not use SQLite, Drizzle, AsyncStorage, or any persistent storage.

## Out Of Scope

- Database persistence
- Workout history persistence
- Home calendar update
- Real analytics

## Codex Rules

- Last done date is local mocked state only
- Does not update database
- Does not update real workout history
- Does not update Home calendar yet
