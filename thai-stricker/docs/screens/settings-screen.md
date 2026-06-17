# Settings Screen

Status: Approved

Version: 1.0

## Purpose

The Settings Screen gives the user a place to adjust training preferences visually.

Its purpose is to:

- Let the user set rest time between exercises locally
- Let the user set desired training days per week locally
- Let the user choose a light or dark theme preference locally
- Show clearly that these settings are placeholders for now

## User Goals

A user should be able to:

- Open the Settings tab from the bottom navbar
- Adjust rest time between workout exercises locally
- Adjust training days per week locally
- Choose a light or dark theme preference locally
- Understand that these settings are not applied yet

## Layout Structure

### Header

Displays:

- Screen title
- Short explanatory subtitle

### Training Preferences Card

Displays:

- Rest time between workout exercises
- Training days per week

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
- themePreference

Allowed values:

- restSeconds: 15, 30, 45, 60, 90, 120
- trainingDaysPerWeek: 1 to 7
- themePreference: light or dark

## Current Data Source

Current implementation:

- Local component state only
- Rest time is currently shared through mocked app-level state
- Changing the rest time updates the value displayed by the Workouts screen
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

- Updates local UI state only

### Choose Theme Preference

Current behavior:

- Updates local UI state only
- Does not change the actual app theme

## Out Of Scope

The Settings Screen must not implement:

- Settings persistence
- Database access
- Updating workout rest times
- Changing the actual app theme
- Theme providers
- Scheduling behavior
- Schedule generation

## Codex Rules

- Settings Screen may display and adjust local UI state
- Settings Screen must not persist settings yet
- Settings Screen must not update workout rest times yet
- Settings Screen must not change actual app theme yet
- Settings Screen must not implement scheduling behavior
- Settings Screen must not implement database access
- Read only `docs/project-scope.md`, `docs/screens/settings-screen.md`, and relevant architecture documents when modifying this screen
- Do not implement functionality not explicitly described in this document
