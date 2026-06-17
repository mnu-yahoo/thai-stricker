# Project Guardrails

- Reduce Codex token consumption
- Read only relevant files
- Do not implement undefined features
- Keep changes small and focused
- Android only
- Android Emulator required for preview/debugging
- No medical advice
- No nutrition advice
- No wearable readiness
- No cloud
- No auth
- Personal/private use only

## Screen Documentation Rule

Each screen must have a corresponding documentation file:

    docs/screens/<screen-name>.md

Codex must read only:

- `docs/project-scope.md`
- the documentation file for the screen currently being worked on
- relevant architecture documents

Codex must not read documentation for unrelated screens.

Codex must not implement functionality for screens that are not explicitly approved.

Codex must not implement functionality that belongs to another screen.

Screen documentation files are the source of truth for screen-specific behavior.

## Navigation Guardrail

The bottom navbar is approved as part of the app shell.

Navbar items may be displayed before all screens exist, but inactive or future tabs must remain placeholders.

Codex must not implement a screen just because a navbar item exists.

Codex must not add navigation dependencies unless explicitly requested.

Codex must not create routes for screens that are not approved for implementation in the current task.
