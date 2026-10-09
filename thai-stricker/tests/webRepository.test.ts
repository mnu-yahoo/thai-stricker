import { describe, expect, it } from "vitest";
import { createAppRepository, STORAGE_KEY, type StorageAdapter } from "../src/persistence/appRepository";
import type { Exercise, Workout } from "../src/types/domain";

function memoryStorage(): StorageAdapter {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value); },
    removeItem: (key) => { data.delete(key); },
  };
}

const exercise = (id = "exercise-1", title = "Jab"): Exercise => ({
  id, title, description: "Direct du bras avant", help: "Revenir en garde", category: "Striking",
  target: { type: "reps", reps: 20 }, techniqueIds: [],
});

const workout = (item = exercise()): Workout => ({
  id: "workout-1", title: "Fondamentaux", description: "Travail propre", difficulty: "Beginner",
  category: "Fundamentals", totalDurationMinutes: 0, restSecondsBetweenExercises: 30, exercises: [item],
});

describe("JSON app repository", () => {
  it("persists data and reloads it from the same browser storage", async () => {
    const storage = memoryStorage();
    const repository = createAppRepository(storage);
    await repository.addAvailableExercise(exercise());
    await repository.addWorkout(workout());
    const restarted = createAppRepository(storage);
    const snapshot = await restarted.loadAppData();
    expect(snapshot.availableExercises).toHaveLength(1);
    expect(snapshot.workouts[0].totalDurationMinutes).toBe(3);
    expect(storage.getItem(STORAGE_KEY)).toContain("Fondamentaux");
  });

  it("rejects duplicate normalized exercise names", async () => {
    const repository = createAppRepository(memoryStorage());
    await repository.addAvailableExercise(exercise());
    await expect(repository.addAvailableExercise(exercise("exercise-2", "  JAB "))).rejects.toThrow("existe déjà");
  });

  it("rejects workouts that reference a missing exercise", async () => {
    const repository = createAppRepository(memoryStorage());
    await expect(repository.addWorkout(workout())).rejects.toThrow("n'existe plus");
  });

  it("exports a versioned file and imports it atomically with a backup", async () => {
    const source = createAppRepository(memoryStorage());
    await source.addAvailableExercise(exercise());
    await source.addWorkout(workout());
    const file = await source.exportDataFile();
    expect(file.schemaVersion).toBe(1);

    const targetStorage = memoryStorage();
    const target = createAppRepository(targetStorage);
    await target.addAvailableExercise(exercise("old", "Ancien"));
    const backup = await target.importDataFile(file);
    expect(backup.availableExercises[0].title).toBe("Ancien");
    expect((await target.loadAppData()).workouts[0].title).toBe("Fondamentaux");

    const before = targetStorage.getItem(STORAGE_KEY);
    await expect(target.importDataFile({ ...file, schemaVersion: 99 })).rejects.toThrow("version 99");
    expect(targetStorage.getItem(STORAGE_KEY)).toBe(before);
  });
});
