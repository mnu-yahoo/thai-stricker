# Data Architecture

## Decision

ThaiStricker stores one validated, versioned JSON document in browser
`localStorage` under `thai-stricker:data:v1`.

- `ThaiStrickerDataFileV1` is the interchange and backup format.
- Repository operations clone, validate and then replace the complete document.
- Full import downloads the previous document before replacement.
- Workout and technique imports remain available for legacy files.
- Data is local to one browser profile and is never cached by the service worker.

There is no cloud database or synchronization. Moving to another phone requires
exporting and importing a JSON backup.
