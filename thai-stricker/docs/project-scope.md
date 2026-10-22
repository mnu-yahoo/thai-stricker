# Project Scope

## Approved Scope

- Private mobile-first Muay Thai coaching PWA
- AI coaching with a browser-local Transformers.js model and local fallback knowledge
- Local training data
- Local coach tips data
- Browser development workflow
- Professional mobile UI later guided by Stitch
- Home Screen
- Workout Screen
- Workout Scheduler Screen
- Workout Detail Screen
- Edit Workout Screen
- In Course Exercise Screen
- Settings Screen
- AI Coach Screen

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
- Workouts opens the mocked Workouts screen
- Schedule opens the mocked Planned Workout / Schedule screen
- Settings opens the mocked Settings screen
- AI Coach opens the local AI Coach screen

Not implemented:

- Real routing
- Screen transitions

# Approved Screens

## Home Screen

Purpose:

- Entry point of the application

Features:

- Display current month workout activity
- Display planned workout for today when available
- Allow user to start planned workout
- Display workout statistics for current month
- Display AI Coach card

Current Status:

- Implemented using mocked data only

Home Planned Workout Card:

Current behavior:
- Displays today's planned workout from mocked weekly workout plans when available
- Starts today's planned workout from Home
- Displays a rest/random workout message when no workout is planned today
- Starts a random mocked workout when no workout is planned today

Not implemented:
- Persistence
- Database-backed planning
- Real recommendation logic

Not Implemented:

- Real database integration
- External AI integration
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
- Allows mocked Add action that opens the Add Workout flow

Not implemented:

- Real database integration
- Real workout execution
- In Course Exercise screen
- Workout timer
- Exercise timer
- Workout session persistence

Settings and Workouts currently share mocked rest time state.

This is not persisted and does not use the local repository or Drizzle.

## Add Workout Screen

Status:

- Approved
- Implemented with mocked data only

Current behavior:

- User can create a workout using form inputs
- User can define basic workout properties
- User can add exercises from a mocked available-exercises list in order
- User can remove exercises before saving
- Available exercises are seeded from mocked app data including existing workout exercises
- Available Exercises list is paginated with the Settings page-size value
- User can move through available exercises using Previous and Next controls
- User can see current page number and total pages
- Available Exercises list includes Add Exercise action
- Available exercise cards include Edit Exercise action
- The same available exercise can be reused multiple times in one workout
- Valid input creates a mocked workout object
- New workout appears in available workouts for the current session
- Workout total duration is calculated automatically
- User cannot manually set workout total duration
- Duration-based exercises use their seconds value
- Reps-based exercises use Settings default duration in minutes for reps exercises
- Rest time between exercises uses Settings rest time
- After saving, user is redirected to Home

Removed:

- JSON-input Add Workout workflow

Not implemented:

- Persistence
- Database integration
- Edit Workout
- File import
- AI workout generation
- Searching available exercises
- Filtering available exercises
- Sorting available exercises
- Creating exercises
- Deleting exercises
- Recalculating existing workouts
- Persisting calculated duration

## Edit Workout Screen

Status:

- Approved
- Implemented with mocked data only

Current behavior:

- Opened from the Workouts screen Edit Workout button
- User can edit workout properties
- User can add exercises from available exercises
- User can remove exercises from the workout
- Total duration is calculated automatically
- Saving updates the mocked workout in local state
- User returns to Workouts after saving or cancelling

Not implemented:

- Persistence
- Database integration
- Workout deletion
- AI workout editing

## Add Exercise Screen

Status:

- Approved
- Implemented with mocked data only

Current behavior:

- Opened from the Add Workout Available Exercises list top-level Add button
- User can create an exercise with title, description, and help
- Exercise detail is assigned a mocked default
- User can save the exercise
- New exercise is added to the end of the Available Exercises list
- Available Exercises pagination recalculates
- User returns to Add Workout after saving
- Current Add Workout state is preserved

Not implemented:

- Exercise detail selection
- Exercise persistence
- Database integration
- Exercise deletion

## Edit Exercise Screen

Status:

- Approved
- Implemented with mocked data only

Current behavior:

- Opened from the Add Workout Available Exercises list
- User can edit exercise title, description, and help
- User can save the exercise
- Updated exercise appears in the Available Exercises list
- User returns to Add Workout after saving
- Current Add Workout state is preserved

Not implemented:

- Editing exercise detail
- Exercise persistence
- Database integration
- Add Exercise screen
- Exercise deletion

## Workout Scheduler Screen

Status:

- Approved
- Implemented with mocked data only

Current behavior:

- User can select a week
- Week number is displayed
- User can move to previous or next week
- User can plan workouts for the selected week
- Required planned workout count comes from Settings training days per week
- User can assign one workout per selected day
- User can reuse the same workout multiple times in a week
- Weekly plan is stored in local mocked app-level state

Not implemented:

- Persistence
- Database integration
- Notifications
- Home calendar integration for planned workouts
- Recurring planning
- Editing workout definitions

## Workout Detail Screen

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
- User can set number of exercises per page locally
- User can set default duration in minutes for reps exercises locally
- User can choose light or dark theme preference locally
- Light preference loads the Light Theme
- Dark preference loads the Dark Theme
- Training days per week is shared with the mocked Schedule screen

Not implemented:

- Settings persistence
- Database integration
- Applying number of exercises per page to library and workout exercise pagination
- Applying default reps exercise duration to Add Workout
- Applying default reps exercise duration to workout execution
- Updating existing workouts with default reps duration
- Updating existing workouts
- Schedule generation

Settings and Workouts currently share mocked rest time state.

This is not persisted and does not use the local repository or Drizzle.

## Theme Feature

Status:

- Approved
- Implemented with local theme tokens

Current behavior:

- App supports Light and Dark themes.
- Settings Theme preference controls active theme.
- Light preference loads Light Theme.
- Dark preference loads Dark Theme.
- Theme architecture should follow Google Stitch output.
- Stitch is the source of truth for visual design.
- Codex may adapt colors, shapes, fonts, controls, pictures, and icons according to Stitch rules.

Not implemented:

- Persistent theme preference
- Full app-wide Stitch adaptation unless explicitly requested

## AI Coach Screen

Status:

- Approved
- Implemented with a browser-local model and local fallback data

Current behavior:

- Available from Home AI Coach card
- Available from AI Coach navbar tab
- Provides tips for today's planned workout exercises
- If no workout is planned today, selects one random available exercise
- Uses guided chat-style buttons
- Uses validated local technique knowledge as model context
- Uses Transformers.js with WebGPU first and WebAssembly fallback
- Falls back to local coaching advice when generation is unavailable
- Home AI Coach card displays a random tip every time Home is shown

Not implemented:

- Server-side LLM or external AI API
- Backend
- Database persistence
- Open-ended chat input
- Voice input
- Speech output

## Explicitly Out Of Scope

- iOS support
- Native Android APK distribution
- Cloud sync
- Authentication
- Public store release
- Wearables
- Medical advice
- Nutrition advice
- Social features
- Payments
- Public user accounts

## Private Web Deployment

ThaiStricker is deployed as a personal PWA on Vercel Hobby.

- React, TypeScript and Vite
- Installable from the phone browser
- Offline application shell after the first successful visit
- Versioned JSON data stored in the browser
- Manual JSON export/import for backups and device transfers
- No Expo, APK, app store, backend, account or cloud synchronization

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
