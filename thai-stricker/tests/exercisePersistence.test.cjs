const assert = require('node:assert/strict');
const { test } = require('node:test');
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Run the production repository against real SQLite, adapting only Expo's
// native transport. Each harness has independent module state and database.
function harness(database = new DatabaseSync(':memory:')) {
  let failSql;
  const adapter = {
    async execAsync(sql) { if (failSql?.(sql)) throw Error('injected failure'); database.exec(sql); },
    async runAsync(sql, ...params) {
      if (failSql?.(sql)) throw Error('injected failure');
      return database.prepare(sql).run(...params);
    },
    async getAllAsync(sql, ...params) { return database.prepare(sql).all(...params); },
    async getFirstAsync(sql, ...params) { return database.prepare(sql).get(...params) ?? null; },
    async withExclusiveTransactionAsync(task) {
      database.exec('BEGIN IMMEDIATE');
      try { await task(adapter); database.exec('COMMIT'); }
      catch (error) { database.exec('ROLLBACK'); throw error; }
    },
  };
  const cache = new Map();
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    let source = fs.readFileSync(filename, 'utf8');
    if (filename.endsWith('appRepository.ts')) source += '\nexport { createTables as testCreateTables };';
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    const localRequire = (id) => id === 'expo-sqlite'
      ? { openDatabaseAsync: async () => adapter }
      : id.startsWith('.') ? load(path.resolve(path.dirname(filename), `${id}.ts`)) : require(id);
    new Function('require', 'module', 'exports', code)(localRequire, module, module.exports);
    return module.exports;
  }
  const repo = load(path.resolve(__dirname, '../src/persistence/appRepository.ts'));
  return { database, adapter, repo, load, fail: (predicate) => { failSql = predicate; } };
}

const exercise = (id, title = 'Ankle Circles', target = { type: 'duration', seconds: 30 }) => ({
  id, title, description: 'Original description', help: 'Original help', target,
});
const workout = (exercises) => ({
  title: 'Workout', description: 'Test workout', difficulty: 'Beginner', category: 'Fundamentals',
  restSecondsBetweenExercises: 30, exercises,
});
const all = (db, sql) => db.prepare(sql).all().map((row) => ({ ...row }));

async function legacyFixture(h) {
  await h.repo.testCreateTables(h.adapter);
  h.database.exec(`
    INSERT INTO app_meta VALUES ('seed_version', '13');
    INSERT INTO exercises (id,title,description,help,category,image_uri,target_type,target_value) VALUES
      ('first','Ankle Circles','Original description','','',NULL,'duration',30),
      ('second','  ANKLE   Circles  ','Different description','Fill help','warmup','image','reps',12),
      ('third','ankle circles','Third description','Third help','','other-image','duration',60);
    INSERT INTO workouts VALUES ('w1','Workout','Description','Beginner','Fundamentals',7,30,NULL);
    INSERT INTO workout_exercises VALUES
      ('w1','first',0,'Ankle Circles','First snapshot','Help','duration',30),
      ('w1','second',1,'Ankle Circles','Second snapshot','Help','reps',12),
      ('w1','third',2,'Ankle Circles','Third snapshot','Help','duration',60),
      ('w1','exercise-draft-old',3,'Ankle Circles','Orphan snapshot','Help','duration',90),
      ('w1','exercise-draft-other',4,'New movement','Recovered description','Help','reps',7);
    INSERT INTO exercise_techniques VALUES
      ('first','t1',0),('first','t2',1),('second','t2',0),('second','t3',1),
      ('second','t4',2),('second','t5',3),('third','t6',0);
    INSERT INTO ai_coach_tips VALUES
      ('first','Ankle Circles','Keep first','[]','[]','[]','first'),
      ('second','Ankle Circles','Keep archived','[]','[]','[]','second');
    INSERT INTO planned_workouts VALUES ('p1','2026-09-07',37,2026,3,'sqlite');
    INSERT INTO planned_workout_days VALUES ('p1','2026-09-10','Thursday','w1','Workout');
    INSERT INTO workout_logs VALUES ('log1','w1','Workout','2026-09-10','2026-09-10',5,4,1,7,'sqlite');
  `);
}

test('migration merges by name, preserves occurrences and archives all prior content', async () => {
  const h = harness();
  await legacyFixture(h);
  const preserved = ['workouts', 'planned_workouts', 'planned_workout_days', 'workout_logs'];
  const before = preserved.map((table) => all(h.database, `SELECT * FROM ${table}`));
  const snapshot = await h.repo.loadAppData();
  assert.equal(snapshot.availableExercises.length, 2);
  const shared = snapshot.availableExercises.find((e) => e.id === 'first');
  assert.equal(shared.description, 'Original description');
  assert.equal(shared.help, 'Fill help');
  assert.equal(shared.imageUri, 'image');
  assert.deepEqual(snapshot.workouts[0].exercises.map((e) => e.id), ['first','first','first','first','migrated-14-w1-4']);
  assert.deepEqual(snapshot.workouts[0].exercises.map((e) => e.target), [
    { type: 'duration', seconds: 30 }, { type: 'reps', reps: 12 },
    { type: 'duration', seconds: 60 }, { type: 'duration', seconds: 90 }, { type: 'reps', reps: 7 },
  ]);
  assert.equal(snapshot.workouts[0].exercises[1].description, 'Original description');
  assert.deepEqual(preserved.map((table) => all(h.database, `SELECT * FROM ${table}`)), before);
  assert.deepEqual(all(h.database, 'SELECT technique_id FROM exercise_techniques ORDER BY sort_order').map((r) => r.technique_id), ['t1','t2','t3','t4','t5']);
  assert.equal(snapshot.coachTips[0].shortTip, 'Keep first');
  const archived = all(h.database, "SELECT payload_json FROM exercise_migration_archive WHERE source_table = 'workout_exercises'");
  assert.equal(archived.length, 5);
  assert.equal(JSON.parse(archived[1].payload_json).exercise_id, 'second');
  assert.equal(JSON.parse(archived[1].payload_json).description, 'Second snapshot');
  assert.equal(all(h.database, 'SELECT * FROM exercise_migration_archive').length, 17);
  const restarted = harness(h.database);
  assert.deepEqual(await restarted.repo.loadAppData(), snapshot);
  h.database.close();
});

test('migration rolls back archive, schema, references and version on failure, and can retry', async () => {
  const h = harness();
  await legacyFixture(h);
  h.fail((sql) => sql.includes('CREATE UNIQUE INDEX'));
  await assert.rejects(h.repo.initializeDatabase(), /injected failure/);
  assert.equal(all(h.database, 'SELECT * FROM exercises').length, 3);
  assert.equal(all(h.database, "SELECT value FROM app_meta WHERE key='seed_version'")[0].value, '13');
  assert.equal(all(h.database, "SELECT name FROM sqlite_master WHERE name='exercise_migration_archive'").length, 0);
  assert.equal(all(h.database, 'PRAGMA table_info(exercises)').some((r) => r.name === 'normalized_name'), false);
  assert.equal(all(h.database, 'SELECT exercise_id FROM workout_exercises ORDER BY sort_order')[1].exercise_id, 'second');
  h.fail(undefined);
  await h.repo.initializeDatabase();
  assert.equal(all(h.database, 'SELECT * FROM exercises').length, 2);
  h.database.close();
});

test('repeated and concurrent imports reuse the same exercise and preserve per-workout targets', async () => {
  const h = harness();
  await Promise.all([h.repo.initializeDatabase(), h.repo.initializeDatabase()]);
  await h.repo.addAvailableExercise(exercise('existing'));
  const payload = workout([
    { ...exercise('', '  ANKLE\t CIRCLES ', { type: 'reps', reps: 15 }), description: 'Do not overwrite', imageUri: 'fill-image' },
    exercise('', 'Ankle Circles', { type: 'duration', seconds: 75 }),
  ]);
  await Promise.all([h.repo.importWorkouts([payload], 3), h.repo.importWorkouts([payload], 3)]);
  await h.repo.importWorkouts([payload], 3);
  const snapshot = await h.repo.loadAppData();
  assert.equal(snapshot.availableExercises.length, 1);
  assert.equal(snapshot.availableExercises[0].description, 'Original description');
  assert.equal(snapshot.availableExercises[0].imageUri, 'fill-image');
  assert.equal(snapshot.workouts.length, 3);
  for (const w of snapshot.workouts) {
    assert.deepEqual(w.exercises.map((e) => e.id), ['existing','existing']);
    assert.deepEqual(w.exercises.map((e) => e.target), [{ type: 'reps', reps: 15 }, { type: 'duration', seconds: 75 }]);
  }
  assert.throws(() => h.database.exec("INSERT INTO exercises (id,title,description,help,target_type,target_value,normalized_name) VALUES ('bypass','Ankle Circles','','','reps',1,'ankle circles')"), /UNIQUE/);
  h.database.close();
});

test('manual duplicate create/rename rejected; shared edits propagate without changing targets', async () => {
  const h = harness();
  await h.repo.addAvailableExercise(exercise('one'));
  await assert.rejects(h.repo.addAvailableExercise(exercise('two', ' ANKLE  CIRCLES ')), /already exists/);
  await h.repo.addAvailableExercise(exercise('two', 'Arm Circles'));
  await assert.rejects(h.repo.updateAvailableExercise(exercise('two', 'ankle circles')), /already exists/);
  const occurrences = [exercise('one'), exercise('one', 'Ankle Circles', { type: 'reps', reps: 22 })];
  await h.repo.addWorkout({ ...workout(occurrences), id: 'manual', totalDurationMinutes: 5 });
  const renamed = { ...exercise('one', 'Ankle rotations'), description: 'Shared edit', imageUri: 'new-image' };
  await h.repo.updateAvailableExercise(renamed);
  const snapshot = await harness(h.database).repo.loadAppData();
  assert.deepEqual(snapshot.workouts[0].exercises.map((e) => e.title), ['Ankle rotations','Ankle rotations']);
  assert.equal(snapshot.workouts[0].exercises[1].target.reps, 22);
  const { shareExerciseDetails } = h.load(path.resolve(__dirname, '../src/features/exercises/exerciseIdentity.ts'));
  assert.deepEqual(shareExerciseDetails(occurrences, [renamed]).map((e) => e.target), occurrences.map((e) => e.target));
  const w = snapshot.workouts[0];
  const { reorderWorkoutExercises } = h.load(path.resolve(__dirname, '../src/features/workouts/reorderWorkoutExercises.ts'));
  const reorderedExercises = reorderWorkoutExercises(w.exercises, 1, 0);
  assert.notEqual(reorderedExercises, w.exercises);
  assert.deepEqual(reorderedExercises.map((item) => item.target), [
    { type: 'reps', reps: 22 },
    { type: 'duration', seconds: 30 },
  ]);
  await h.repo.updateWorkout({ ...w, exercises: reorderedExercises });
  assert.deepEqual((await h.repo.loadAppData()).workouts[0].exercises.map((item) => item.target), [
    { type: 'reps', reps: 22 },
    { type: 'duration', seconds: 30 },
  ]);
  assert.deepEqual(
    all(h.database, "SELECT sort_order, target_type, target_value FROM workout_exercises WHERE workout_id='manual' ORDER BY sort_order"),
    [
      { sort_order: 0, target_type: 'reps', target_value: 22 },
      { sort_order: 1, target_type: 'duration', target_value: 30 },
    ],
  );
  await h.repo.updateWorkout({ ...w, exercises: reorderedExercises.filter((_, index) => index !== 0) });
  assert.equal((await h.repo.loadAppData()).workouts[0].exercises[0].target.seconds, 30);
  await assert.rejects(h.repo.addWorkout({ ...workout([exercise('missing')]), id: 'invalid', totalDurationMinutes: 1 }), /no longer exists/);
  assert.equal(all(h.database, "SELECT * FROM workouts WHERE id='invalid'").length, 0);
  h.database.close();
});

test('new names within one import are shared and missing fields completed; invalid import rolls back', async () => {
  const h = harness();
  const first = { ...exercise(''), description: '', help: '', imageUri: '' };
  await h.repo.importWorkouts([workout([first, { ...exercise(''), imageUri: 'second-image' }])], 3);
  const snapshot = await h.repo.loadAppData();
  assert.equal(snapshot.availableExercises.length, 1);
  assert.equal(snapshot.availableExercises[0].help, 'Original help');
  assert.equal(snapshot.availableExercises[0].imageUri, 'second-image');
  await assert.rejects(h.repo.importWorkouts([workout([exercise('', 'New'), exercise('', '  ')])], 3), /title is required/);
  assert.deepEqual(await h.repo.loadAppData(), snapshot);
  h.database.close();
});
