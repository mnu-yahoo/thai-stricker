# Data Model Overview

The active training model has three compositional levels:

- `techniques`: atomic strikes or movements.
- `exercises`: one or more ordered techniques, with a default duration or repetition target.
- `workouts`: ordered exercise occurrences. Each occurrence references an exercise by ID and may override its detail.

Additional data groups planned for later:

- training sessions
- rounds
- drills
- techniques
- coach chat messages
- user notes
- progress snapshots

Detailed schema decisions are intentionally deferred.
