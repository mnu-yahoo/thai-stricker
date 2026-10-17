# Data reset policy

Storage manifests use versioned local web-storage keys. The current schema is
version 3 and uses the hierarchy `techniques → exercises → workouts`.

When the application finds no current v3 manifest, it creates a fresh snapshot
from `seedData`. Older manifests and legacy backups are not converted into the
new hierarchy. Users should export any needed data before resetting the app.

## Verification

- `npm test` runs the repository tests with an isolated in-memory storage adapter.
- `npm run typecheck` validates the TypeScript model and application code.
- `npm run build` validates the production web bundle.
