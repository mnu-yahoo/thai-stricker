# Start Workout Stitch Prompt

Use this prompt with Stitch to design the `Start Workout` screen without prescribing visual direction.

```text
Design a "Start Workout" screen for a mobile fitness app.

This screen runs a selected workout from the first exercise to the last.

Include these controls and behaviors:

- A display for the workout title.
- A display for the current exercise position, such as current exercise number out of total exercises.
- A display for the current exercise title.
- A display for the current exercise description.
- A display for the current exercise help text.
- A display for the current exercise target.
- A skip exercise action.

For time-based exercise steps:
- Show a countdown timer for the current exercise.
- When the countdown reaches zero, the exercise finishes automatically.

For rep-based exercise steps:
- Show a primary action to finish the current exercise manually.

Include a rest state that appears after each non-final exercise.

In the rest state, show:
- A rest title.
- Remaining rest time.
- The next exercise title.
- A skip rest action.

Behavior requirements:
- The screen progresses through exercises in sequence.
- Rest appears after each exercise except the final one.
- Rest time comes from settings.
- Skipping an exercise moves the workout flow forward.
- If another exercise exists, skipping the exercise moves to rest.
- If the skipped exercise is the final exercise, the flow moves to the finished recap.
- Timers are used for time-based exercises only.
- Rep-based exercises require manual completion.

Please propose the visual design, layout, hierarchy, and interaction treatment.
```

## Validation Notes

- The prompt names required controls, states, and behaviors only.
- It does not ask Stitch to match existing UI.
- It does not prescribe colors, typography, spacing, card styles, or layout patterns.
- It leaves visual design decisions to Stitch.
