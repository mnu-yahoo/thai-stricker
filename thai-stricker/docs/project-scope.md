# Project Scope

## Approved Scope

- Private Android Muay Thai Boxing coaching app
- AI coaching chat planned
- Local training data
- Local coach chat history
- Android Emulator development workflow
- Professional mobile UI later guided by Stitch
- Home Screen
- Workout Screen
- Workout Scheduler Screen
- Workout Detail Screen
- Edit Workout Screen
- In Course Exercise Screen
- Settings Screen
- AI Coach Chat Screen

## Approved App Shell

Status: Approved

The app includes a bottom navigation bar.

Navbar items:

- Home
- Workouts
- Schedule
- AI Coach
- Settings

Current behavior:

- Home is active
- Other tabs are placeholders only
- Other tabs must not open real screens until those screens are explicitly implemented

Not implemented:

- Real routing
- Screen transitions
- Schedule Screen
- AI Coach Chat Screen
- Settings Screen

# Approved Screens

## Home Screen

Purpose:

- Entry point of the application

Features:

- Display current month workout activity
- Display planned workout
- Allow user to start planned workout
- Display workout statistics for current month
- Display AI Coach teaser card

Current Status:

- Implemented using mocked data only

Not Implemented:

- Real database integration
- Real workout execution
- AI chat integration
- Navigation

## Workouts Screen

Status:

- Approved
- Implemented using mocked data only

Current behavior:

- Lists available workouts
- Shows workout content inline
- Allows mocked Start Workout action
- Allows mocked Edit action
- Allows mocked Add action

Not implemented:

- Real database integration
- Real workout execution
- In Course Exercise screen
- Workout timer
- Exercise timer
- Workout session persistence

Settings and Workouts currently share mocked rest time state.

This is not persisted and does not use SQLite or Drizzle.

## Workout Scheduler Screen

Status:

- Planned
- Not implemented

## Workout Detail Screen

Status:

- Planned
- Not implemented

## Edit Workout Screen

Status:

- Planned
- Not implemented

## In Course Exercise Screen

Status:

- Approved
- Implemented with mocked data only

Current behavior:

- Runs selected workout from first exercise to last exercise
- Time-based exercises use a countdown timer
- Rep-based exercises require manual finish
- Rest step appears after each exercise except the final one
- User can skip current exercise
- Finished recap is displayed when workout is complete
- User can return to Home from recap
- Selected workout last done date is updated in local mocked state

Not implemented:

- Database persistence
- Workout history persistence
- Real analytics

## Workout Logging

Status:

- Approved
- Mocked only

Purpose:

- Create a workout log entry when a mocked workout is completed
- Feed the Home calendar preview
- Feed the Home monthly completed workout count

Not implemented:

- Workout Logging screen
- Persistent workout history
- Database integration
- Editing logs
- Deleting logs
- Analytics

## Settings Screen

Status:

- Approved
- Implemented using local mocked state only

Current behavior:

- User can set rest time between workout exercises locally
- User can set desired training days per week locally
- User can choose light or dark theme preference locally

Not implemented:

- Settings persistence
- Database integration
- Applying theme to the app
- Schedule generation

Settings and Workouts currently share mocked rest time state.

This is not persisted and does not use SQLite or Drizzle.

## AI Coach Chat Screen

Status:

- Planned
- Not implemented

## Explicitly Out Of Scope

- iOS support
- Web support
- Cloud sync
- Authentication
- Public store release
- Wearables
- Medical advice
- Nutrition advice
- Social features
- Payments
- Public user accounts

## Rule

Do not implement features unless they are explicitly approved in this file.

### Screen Documentation Rule

Each screen must have its own documentation file:

```txt
docs/screens/<screen-name>.md
```

Future implementations must only use:

- docs/project-scope.md
- the screen currently being implemented
- relevant architecture files

Do not implement functionality for screens that are not explicitly approved.
