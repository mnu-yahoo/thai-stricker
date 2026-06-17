# Workouts Screen

Status: Approved

Version: 1.0

## Purpose

The Workouts Screen gives the user a focused view of available training sessions.

Its purpose is to:

- List available workouts
- Show key workout details at a glance
- Allow the user to inspect workout content inline
- Provide mocked entry points for editing and creating workouts

## User Goals

A user should be able to:

- Open the Workouts tab from the bottom navbar
- Browse available workouts quickly
- Understand workout difficulty, category, duration, exercise count, and rest time
- Start a workout directly from the list
- View the content of a workout without leaving the screen
- Discover that edit and create flows exist but are not implemented yet

## Layout Structure

### Header

Displays:

- Screen title
- Short explanatory subtitle
- Add workout action

### Workout List

Displays for each workout:

- Workout title
- Description
- Difficulty
- Category
- Total duration
- Number of exercises
- Rest time between exercises

Actions:

- View content
- Start Workout
- Edit workout

### Inline Workout Content

Displays:

- Exercise title
- Exercise description
- Exercise help
- Exercise target
- Rest time after each exercise except the last

## Workout Data Model Overview

Each workout includes:

- id
- title
- description
- difficulty
- category
- totalDurationMinutes
- restSecondsBetweenExercises
- exercises

## Exercise Data Model Overview

Each exercise includes:

- id
- title
- description
- help
- target

The target may be:

- duration in seconds
- reps count

## Mocked Data Source

Current implementation:

- Mocked data only
- Rest time displayed in workouts comes from the mocked Settings screen state
- The value is shared in app-level mocked state
- This does not use the database yet

Included mocked workouts:

- Muay Thai Fundamentals
- Boxing Basics
- Low Kick Flow
- Defense Basics

No:

- SQLite
- Drizzle
- API
- Cloud
- Real workout persistence

## Actions

### View Content

Current behavior:

- Expands or collapses workout content inline inside the Workouts Screen

### Start Workout

Current behavior:

- Starts the mocked workout execution flow
- Opens the Start Workout screen/state
- Uses mocked workout data
- Uses mocked Settings rest time

Not implemented:

- Persistence
- Database-backed workout sessions
- Workout history

### Edit Workout

Current behavior:

- Placeholder only
- Shows mocked feedback

Future behavior:

- Open Edit Workout screen

Status:

- Not implemented

### Add Workout

Current behavior:

- Placeholder only
- Shows mocked feedback

Future behavior:

- Open Create Workout screen

Status:

- Not implemented

## Out Of Scope

The Workouts Screen must not implement:

- Edit Workout screen
- Create Workout screen
- Workout Detail screen
- In Course Exercise screen
- Workout timer
- Exercise timer
- Workout session persistence
- Settings screen
- Schedule screen
- AI Coach Chat screen
- Real navigation stack
- Database integration
- AI integration

Rest time is displayed from shared mocked Settings state and is not configurable here.

## Codex Rules

- Workouts Screen may list workouts
- Workouts Screen may show workout content inline
- Workouts Screen must not implement Edit Workout screen
- Workouts Screen must not implement Create Workout screen
- Workouts Screen must not implement Workout Detail screen
- Rest time is displayed only and is not configurable here
- Rest time is displayed from shared mocked Settings state
- Read only `docs/project-scope.md`, `docs/screens/workouts-screen.md`, and relevant architecture documents when modifying this screen
- Do not implement functionality not explicitly described in this document
