# Home Screen

Status: Approved

Version: 1.0

## App Shell

The Home Screen is displayed inside the main app shell.

The app shell includes a bottom navbar with:

- Home
- Workouts
- Schedule
- AI Coach
- Settings

Current behavior:

- Home is active
- Workouts opens the mocked Workouts screen
- Schedule opens the mocked Planned Workout / Schedule screen
- AI Coach opens the mocked AI Coach screen
- Settings opens the mocked Settings screen

## Purpose

The Home Screen is the main entry point of Thai Stricker.

Its purpose is to:

- Give the user a quick overview of current training activity
- Display the next planned workout
- Provide a quick action to start training
- Show monthly workout consistency
- Promote access to the AI Coach

## User Goals

A user should be able to:

- Open the app and immediately see training progress
- Know what workout is planned next
- Start a workout quickly
- See training consistency for the current month
- Discover the AI Coach feature

## Layout Structure

Saved dark dashboard reference:

- [docs/design/dashboard-dark-theme.md](/C:/Users/mathieu.nussbaumer/Documents/ThaiStricker/thai-stricker/docs/design/dashboard-dark-theme.md)

### Header

Displays:

- App name: Thai Stricker
- Tagline: Train sharp. Stay consistent.

Dark dashboard implementation also includes:

- user badge icon
- `TRAINING HUB` top bar label
- notification icon

### Planned Workout Card

Displays:

- Today planned workout title when a mocked plan exists for today
- Workout description if available
- Difficulty
- Category
- Total duration
- Exercise count
- Rest/random message when no workout is planned for today

Actions:

- Start workout
- Start random workout

### Monthly Activity Summary

Displays:

- Completed workouts count
- Planned workouts count
- Missed workouts count

### Weekly Calendar Preview

Displays:

- Current selected week only
- Previous / next week controls
- Current month and year
- Days in the selected week containing workouts

Workout statuses:

- Completed
- Planned
- Missed

Purpose:

- Quick visualization of training consistency

### AI Coach Card

Displays:

- AI Coach title
- One random short local coach tip
- Large dark-dashboard quote treatment in dark mode
- Google Material Symbol accents in dark mode

Actions:

- Open coach

## Current Data Source

Current implementation:

- Mocked data only
- Uses mocked weekly workout plans for the current day planned-workout card

No:

- SQLite
- Drizzle
- API
- Cloud
- External AI integration

## Future Data Source

Planned:

- SQLite using expo-sqlite
- Drizzle ORM

The Home Screen should eventually consume:

- Planned Workout
- Workout Calendar Entries
- Monthly Workout Summary

## Workout Logging Source

The Home calendar preview uses mocked workout log entries.

A day is marked completed when at least one workout log entry exists for that date.

The monthly completed workout count is derived from mocked workout logs for the current month.

Workout logging is session-only and not persisted.

## Actions

## Planned Workout Card Behavior

The Planned Workout Card uses mocked weekly workout plans.

If a workout is planned for the current day:

- The card displays that planned workout
- The button label is `Start workout`
- Pressing the button starts the mocked Start Workout flow

If no workout is planned for the current day:

- The card displays `No training planned today. Have a rest. Or start a random Workout`
- The button label is `Start random workout`
- Pressing the button starts a randomly selected mocked workout

This behavior is mocked only and not persisted.

### Start Workout

Current behavior:

- Starts the existing mocked Start Workout flow from Home

Future behavior:

- Keep using a real workout execution flow once persistence exists

Status:

- Mocked flow implemented

### Open AI Coach

Current behavior:

- Opens the mocked AI Coach screen
- Home displays one random local coach tip every time the screen is shown

Future behavior:

- Real AI generation is still not implemented

Status:

- Mocked flow implemented

## AI Coach Card

Current behavior:
- Displays one random local coach tip every time Home is shown
- Tip comes from developer-provided mocked coach tip data
- Card opens the AI Coach screen

Not implemented:
- Real AI generation
- API-backed coaching
- Persisted tip history

## Visual Guidelines

The screen should:

- Feel modern and professional
- Be optimized for Android phones
- Be readable on Android Emulator
- Use card-based sections
- Avoid visual clutter
- Prioritize training information

Current saved dark dashboard style:

- charcoal and cyan palette
- Google Material Symbols for dashboard iconography
- compact athletic typography
- weekly calendar strip instead of a full monthly grid
- AI Coach card with strong quote-led hierarchy

## Out Of Scope

The Home Screen must not contain:

- Workout editing
- Workout scheduling
- Workout creation
- Settings management
- Statistics dashboard
- AI chat interface
- Authentication
- Cloud sync
- Medical advice
- Nutrition advice
- Wearable integrations

## Dependencies

Current:

- React Native
- Expo

Future:

- SQLite
- Drizzle ORM

No additional dependencies should be introduced solely for the Home Screen without approval.

## Related Screens

- Workout Screen
- Workout Scheduler Screen
- Workout Detail Screen
- Edit Workout Screen
- In Course Exercise Screen
- Settings Screen
- AI Coach Screen

These screens are separate concerns and must not be implemented from Home Screen requirements.

## Codex Rules

When modifying the Home Screen:

Read only:

- docs/project-scope.md
- docs/screens/home-screen.md
- relevant architecture documents

Do not read documentation for unrelated screens.

Do not implement functionality not explicitly described in this document.
