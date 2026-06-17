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
- Other tabs are placeholders
- Placeholder tabs do not navigate yet

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

### Header

Displays:

- App name: Thai Stricker
- Tagline: Train sharp. Stay consistent.

### Planned Workout Card

Displays:

- Workout name
- Focus
- Duration
- Exercise count
- Difficulty

Actions:

- Start Workout

### Monthly Activity Summary

Displays:

- Completed workouts count
- Planned workouts count
- Missed workouts count

### Monthly Calendar Preview

Displays:

- Current month
- Days containing workouts

Workout statuses:

- Completed
- Planned
- Missed

Purpose:

- Quick visualization of training consistency

### AI Coach Teaser

Displays:

- AI Coach title
- Short description

Actions:

- Open coach later

## Current Data Source

Current implementation:

- Mocked data only

No:

- SQLite
- Drizzle
- API
- Cloud
- AI integration

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

### Start Workout

Current behavior:

- Mocked action only

Future behavior:

- Open workout execution flow

Status:

- Not implemented

### Open AI Coach

Current behavior:

- Placeholder only

Future behavior:

- Open AI Coach Chat Screen

Status:

- Not implemented

## Visual Guidelines

The screen should:

- Feel modern and professional
- Be optimized for Android phones
- Be readable on Android Emulator
- Use card-based sections
- Avoid visual clutter
- Prioritize training information

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
- AI Coach Chat Screen

These screens are separate concerns and must not be implemented from Home Screen requirements.

## Codex Rules

When modifying the Home Screen:

Read only:

- docs/project-scope.md
- docs/screens/home-screen.md
- relevant architecture documents

Do not read documentation for unrelated screens.

Do not implement functionality not explicitly described in this document.
