# Database Architecture

## Decision

- SQLite
- `expo-sqlite`
- Drizzle ORM planned

## Rationale

The app will use local-only storage. SQLite is a good fit for Expo Android and is suitable for structured training data, local coach chat history, and future relational queries.

There will be no cloud database and no sync.

## Rejected Options

- AsyncStorage: too limited for structured relational data
- Realm: unnecessary native complexity
- WatermelonDB: overkill for this personal app

## Schema Status

Do not create the database schema yet.
