import { describe, expect, it } from "vitest";
import { strFromU8, strToU8, unzipSync, zipSync } from "fflate";
import { buildSectionArchive, readSectionImports, type BackupInputFile } from "../src/persistence/backupArchive";
import { createAppRepository, DATA_SECTION_NAMES, LEGACY_STORAGE_KEY, MANIFEST_STORAGE_KEY, SECTION_FILE_NAMES, type StorageAdapter } from "../src/persistence/appRepository";
import type { Exercise, WeeklyWorkoutPlan, Workout } from "../src/types/domain";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const storage: StorageAdapter = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
  return { storage, values };
}

const exercise = (id = "exercise-1", title = "Jab"): Exercise => ({
  id, title, description: "Direct du bras avant", help: "Revenir en garde", category: "Striking",
  target: { type: "reps", reps: 20 }, techniqueIds: ["technique-seed-jab"],
});

const workout = (item = exercise()): Workout => ({
  id: "workout-1", title: "Fondamentaux", description: "Travail propre", difficulty: "Beginner",
  category: "Fundamentals", totalDurationMinutes: 0, restSecondsBetweenExercises: 30, exercises: [{ exerciseId: item.id, target: item.target }],
});

const asInputFile = (name: string, bytes: Uint8Array): BackupInputFile => ({
  name,
  arrayBuffer: async () => new Uint8Array(bytes).buffer,
  text: async () => strFromU8(bytes),
});

describe("split JSON app repository", () => {
  it("persists data through six section documents and reloads it", async () => {
    const memory = memoryStorage();
    const repository = createAppRepository(memory.storage);
    await repository.addAvailableExercise(exercise());
    await repository.addWorkout(workout());
    const snapshot = await createAppRepository(memory.storage).loadAppData();
    expect(snapshot.exercises).toHaveLength(1);
    expect(snapshot.workouts[0].totalDurationMinutes).toBe(3);
    const manifest = JSON.parse(memory.storage.getItem(MANIFEST_STORAGE_KEY) ?? "null") as { sections: Record<string, string> };
    expect(Object.keys(manifest.sections)).toEqual(DATA_SECTION_NAMES);
    for (const section of DATA_SECTION_NAMES) expect([...memory.values.keys()].some((key) => key.includes(`:v3:${section}:`))).toBe(true);
  });

  it("resets legacy storage into the new schema", async () => {
    const source = createAppRepository(memoryStorage().storage);
    await source.addAvailableExercise(exercise()); await source.addWorkout(workout());
    const memory = memoryStorage({ [LEGACY_STORAGE_KEY]: JSON.stringify(await source.loadAppData()) });
    const migrated = await createAppRepository(memory.storage).loadAppData();
    expect(migrated.workouts).toHaveLength(0);
    expect(memory.storage.getItem(MANIFEST_STORAGE_KEY)).not.toBeNull();
    expect(memory.storage.getItem(LEGACY_STORAGE_KEY)).not.toBeNull();
  });

  it("keeps the previous manifest active when its atomic switch fails", async () => {
    const memory = memoryStorage(); let rejectManifest = false;
    const failingStorage: StorageAdapter = {
      getItem: memory.storage.getItem, removeItem: memory.storage.removeItem,
      setItem: (key, value) => { if (rejectManifest && key === MANIFEST_STORAGE_KEY) throw new Error("quota"); memory.storage.setItem(key, value); },
    };
    const repository = createAppRepository(failingStorage); const initialTheme = (await repository.loadAppData()).settings.themePreference;
    const before = memory.storage.getItem(MANIFEST_STORAGE_KEY); rejectManifest = true;
    await expect(repository.saveSetting("themePreference", initialTheme === "Light" ? "Dark" : "Light")).rejects.toThrow("could not save");
    rejectManifest = false;
    expect(memory.storage.getItem(MANIFEST_STORAGE_KEY)).toBe(before);
    expect((await repository.loadAppData()).settings.themePreference).toBe(initialTheme);
  });

  it("rejects duplicate exercise names and missing workout references", async () => {
    const repository = createAppRepository(memoryStorage().storage);
    await repository.addAvailableExercise(exercise());
    await expect(repository.addAvailableExercise(exercise("exercise-2", "  JAB "))).rejects.toThrow("already exists");
    await expect(createAppRepository(memoryStorage().storage).addWorkout(workout())).rejects.toThrow("no longer exists");
  });

  it("models exercises as ordered technique combinations and workout occurrences as references", async () => {
    const repository = createAppRepository(memoryStorage().storage);
    await repository.addTechnique({ id: "technique-cross", name: "Cross", shortName: "Cross", description: "Rear straight", category: "Muay Thai techniques", subCategory: "Punches" });
    const combo: Exercise = { ...exercise("combo", "Jab Cross"), techniqueIds: ["technique-seed-jab", "technique-cross"] };
    await repository.addExercise(combo);
    await repository.addWorkout({ ...workout(), id: "combo-workout", exercises: [
      { exerciseId: "combo", target: { type: "reps", reps: 10 } },
      { exerciseId: "combo", target: { type: "duration", seconds: 45 } },
    ] });
    const snapshot = await repository.loadAppData();
    expect(snapshot.exercises[0].techniqueIds).toEqual(["technique-seed-jab", "technique-cross"]);
    expect(snapshot.workouts[0].exercises.map(({ exerciseId, target }) => ({ exerciseId, target }))).toEqual([
      { exerciseId: "combo", target: { type: "reps", reps: 10 } },
      { exerciseId: "combo", target: { type: "duration", seconds: 45 } },
    ]);
    expect(snapshot.workouts[0].totalDurationMinutes).toBe(5);
    await repository.updateExercise({ ...combo, description: "Updated combo" });
    expect((await repository.loadAppData()).workouts[0].exercises[0].description).toBe("Updated combo");
    await expect(repository.deleteExercise("combo")).rejects.toThrow("used in a workout");
  });

  it("rejects an exercise without techniques", async () => {
    const repository = createAppRepository(memoryStorage().storage);
    await expect(repository.addExercise({ ...exercise("empty"), techniqueIds: [] })).rejects.toThrow("at least 1");
  });

  it("exports all six versioned formats with exact filenames", async () => {
    const files = await createAppRepository(memoryStorage().storage).exportSections(DATA_SECTION_NAMES);
    expect(files.map((file) => SECTION_FILE_NAMES[file.fileType])).toEqual(["settings.json", "workouts.json", "weeklyWorkoutPlans.json", "workoutLogs.json", "coachTips.json", "calendar.json"]);
    expect(files.every((file) => file.schemaVersion === 1 && Boolean(file.exportedAt))).toBe(true);
  });

  it("builds a ZIP and reads its selected JSON files", async () => {
    const repository = createAppRepository(memoryStorage().storage);
    const archive = buildSectionArchive(await repository.exportSections(["settings", "calendar"]));
    expect(Object.keys(unzipSync(archive))).toEqual(["settings.json", "calendar.json"]);
    const imported = await readSectionImports([asInputFile("backup.zip", archive)]);
    expect(imported.map((file) => file.filename)).toEqual(["settings.json", "calendar.json"]);
  });

  it("imports selected sections while preserving unselected data", async () => {
    const source = createAppRepository(memoryStorage().storage);
    await source.addAvailableExercise(exercise()); await source.addWorkout(workout());
    const [workoutsFile] = await source.exportSections(["workouts"]);
    const target = createAppRepository(memoryStorage().storage); await target.saveSetting("themePreference", "Light");
    await target.importSections([{ filename: "workouts.json", content: workoutsFile }]);
    const snapshot = await target.loadAppData();
    expect(snapshot.settings.themePreference).toBe("Light"); expect(snapshot.workouts[0].title).toBe("Fondamentaux");
  });

  it("rejects unknown names, duplicates, mismatched types and versions", async () => {
    const repository = createAppRepository(memoryStorage().storage); const [settings] = await repository.exportSections(["settings"]);
    await expect(repository.importSections([{ filename: "other.json", content: settings }])).rejects.toThrow("Unknown");
    await expect(repository.importSections([{ filename: "settings.json", content: settings }, { filename: "settings.json", content: settings }])).rejects.toThrow("Duplicate");
    await expect(repository.importSections([{ filename: "settings.json", content: { ...settings, fileType: "calendar" } }])).rejects.toThrow("instead");
    await expect(repository.importSections([{ filename: "settings.json", content: { ...settings, schemaVersion: 99 } }])).rejects.toThrow("Unknown version");
  });

  it("rejects an entire import when a supplied section breaks references", async () => {
    const memory = memoryStorage(); const repository = createAppRepository(memory.storage); await repository.loadAppData();
    const before = memory.storage.getItem(MANIFEST_STORAGE_KEY);
    const plan: WeeklyWorkoutPlan = { id: "plan-1", weekStartDate: "2026-10-12", weekNumber: 42, year: 2026, requiredTrainingDays: 1, source: "web", plannedDays: [{ dayDate: "2026-10-12", dayLabel: "lundi", workoutId: "missing", workoutTitle: "Absente" }] };
    await expect(repository.importSections([{ filename: "weeklyWorkoutPlans.json", content: { schemaVersion: 1, fileType: "weeklyWorkoutPlans", exportedAt: new Date().toISOString(), weeklyWorkoutPlans: [plan] } }])).rejects.toThrow("no longer exists");
    expect(memory.storage.getItem(MANIFEST_STORAGE_KEY)).toBe(before);
    expect((await repository.loadAppData()).weeklyWorkoutPlans).toHaveLength(0);
  });

  it("rejects unknown and duplicate files inside import selections", async () => {
    await expect(readSectionImports([asInputFile("unknown.zip", zipSync({ "unknown.json": strToU8("{}") }))])).rejects.toThrow("Unknown");
    await expect(readSectionImports([asInputFile("settings.json", strToU8("{invalid"))])).rejects.toThrow("valid JSON");
    const repository = createAppRepository(memoryStorage().storage); const [settings] = await repository.exportSections(["settings"]);
    await expect(readSectionImports([asInputFile("backup.zip", buildSectionArchive([settings])), asInputFile("settings.json", strToU8(JSON.stringify(settings)))])).rejects.toThrow("Duplicate");
  });

  it("keeps the legacy monolithic import available", async () => {
    const source = createAppRepository(memoryStorage().storage); await source.addAvailableExercise(exercise()); await source.addWorkout(workout());
    const target = createAppRepository(memoryStorage().storage); const backup = await target.importLegacyDataFile(await source.exportLegacyDataFile());
    expect(backup.schemaVersion).toBe(1); expect((await target.loadAppData()).workouts[0].title).toBe("Fondamentaux");
  });
});
