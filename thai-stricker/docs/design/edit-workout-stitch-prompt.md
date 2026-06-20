# Edit Workout Stitch Prompt

Use this prompt with Stitch to design the `Edit Workout` screen without prescribing visual direction.

```text
Design an "Edit Workout" screen for a mobile fitness app.

This screen edits an existing workout.

Include these controls and behaviors:

- A way to return to the workouts list without saving.
- A screen title for editing a workout.
- A text input for workout title.
- A multiline text input for workout description.
- A selectable control for workout difficulty with these options:
  - Beginner
  - Intermediate
  - Advanced
- A selectable control for workout category with these options:
  - Fundamentals
  - Striking
  - Defense
  - Conditioning
  - Footwork
- A read-only display for calculated total duration in minutes.
- A section for available exercises.
- In the available exercises section:
  - Show helper text that the user is selecting from a mocked exercise library.
  - Show the maximum allowed exercises value from settings.
  - Show pagination with current page and total pages.
  - Include controls for previous page and next page.
  - Include a control to open an Add Exercise placeholder action.
  - For each available exercise, show:
    - title
    - description
    - an Add control
    - an Edit control
- A section for exercises currently in the workout.
- In the workout exercises section:
  - Show the current number of selected exercises and the maximum allowed.
  - If there are no exercises, show an empty-state message.
  - For each selected exercise, show:
    - order in the workout
    - title
    - description
    - help text
    - target value
    - a Remove control
- An error state for selection errors, such as exceeding the maximum number of exercises.
- An error state for workout validation errors, such as:
  - missing title
  - missing description
  - no exercises selected
  - too many exercises selected
- A primary action to save the workout.
- A secondary action to go back without saving.

Behavior requirements:
- Existing workout values should appear prefilled.
- Exercise order should be preserved.
- Total duration is calculated automatically and is not editable.
- Saving keeps the workout id and last-done date.
- Saving returns the user to the workouts list.
- Going back returns without saving.

Please propose the visual design, layout, hierarchy, and interaction treatment.
```

## Validation Notes

- The prompt names required controls and states only.
- It does not ask Stitch to match existing UI.
- It does not prescribe colors, typography, spacing, card styles, or layout patterns.
- It leaves visual design decisions to Stitch.
