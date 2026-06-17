# Planned Workout / Schedule Screen

Status: Approved

Version: 1.0

## Purpose

The Planned Workout / Schedule screen lets the user plan workouts for a selected week using mocked app-level state only.

Its purpose is to:

- Let the user move between weeks
- Show the current week number and date range
- Use the Settings training-days value as the weekly requirement
- Let the user assign one workout to each selected training day
- Save a mocked weekly plan for the selected week in app state

## User Goals

A user should be able to:

- Open the Schedule tab from the bottom navbar
- Review the selected week number and date range
- Move to the previous or next week
- See all 7 days from Monday through Sunday
- Select exactly the configured number of training days
- Assign one existing mocked workout to each selected day
- Reuse the same workout across multiple days in the same week
- Save the weekly plan and return to it later in the same app session

## Layout Structure

### Header

Displays:

- Screen title
- Short explanatory subtitle

### Week Selector Card

Displays:

- Week number
- Week date range
- Previous week action
- Next week action
- Planned-progress summary

### Planning Summary Card

Displays:

- Current planning rule reminder
- Remaining workout count before save

### Day Cards

Displays:

- One card for each day Monday through Sunday
- Day label
- Day date
- Current assignment state
- Select or clear day action
- Inline workout choices for selected days

### Save Action

Displays:

- Save weekly plan button

## Week Selection Behavior

Current behavior:

- Selected week defaults to the current week
- Week starts on Monday
- Week number is displayed
- Week date range is displayed
- User can move to the previous week
- User can move to the next week

## Planning Behavior

Current behavior:

- The screen shows 7 days for the selected week
- The required planned-workout count comes from Settings training days per week
- User must plan exactly the configured number of workouts per week
- User cannot select more days than the configured limit
- User may clear a selected day to free a slot
- Existing mocked plan for the selected week is loaded into the editable draft
- Saving replaces the current mocked plan for that week

## Workout Assignment Behavior

Current behavior:

- One workout per selected day
- User chooses from existing mocked workouts
- Same workout may be reused across days
- Saving is blocked until every selected day has a workout assigned

## Settings Dependency

Current dependency:

- Uses Settings `training days per week`
- The value is shared through mocked app-level state
- This is not persisted

## Current Data Source

Current implementation:

- Mocked local app-level state only
- Weekly plans are stored in memory for the running app session
- Existing workout choices come from mocked workout data

No:

- SQLite
- Drizzle
- AsyncStorage
- API
- Cloud sync

## Future Data Source

Planned later:

- Persisted weekly planning storage
- Database-backed planning
- Potential Home integration for planned workouts

These are not implemented in this screen now.

## Out Of Scope

The Planned Workout / Schedule screen must not implement:

- Persistence
- Database integration
- Notifications
- Calendar integration
- Home calendar updates for planned workouts
- Real recurring plans
- Editing workout definitions
- Creating workouts
- AI coaching
- Medical advice
- Nutrition advice

## Codex Rules

- Uses mocked local app-level state only
- Uses Settings `training days per week`
- User must plan exactly the configured number of workouts per week
- One workout per selected day
- Same workout may be reused across days
- Does not persist plans
- Does not update Home calendar yet
- Does not implement notifications
- Read only `docs/project-scope.md`, `docs/screens/planned-workout-screen.md`, and relevant architecture documents when modifying this screen
- Do not implement functionality not explicitly described in this document
