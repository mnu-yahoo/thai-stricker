import { z } from "zod";
import { appDataSchema, dataFileSchemaV1, sectionDataFileSchemasV1 } from "./dataSchema";
import { seedData } from "./seedData";
import { assertExerciseCollectionIntegrity, normalizeExerciseName } from "../domain/rules/exerciseRules";
import { calculateWorkoutDuration } from "../domain/rules/workoutRules";
import type { AppDataSnapshot, DataSectionName, Exercise, NamedSectionImport, PersistedSettings, ResolvedWorkoutExercise, Technique, ThaiStrickerDataFileV1, ThaiStrickerSectionFileV1, WeeklyWorkoutPlan, Workout, WorkoutImportPayload, WorkoutLogEntry } from "../types/domain";

export const LEGACY_STORAGE_KEY = "thai-stricker:data:v1";
export const MANIFEST_STORAGE_KEY = "thai-stricker:data:v4:manifest";
export const STORAGE_KEY = MANIFEST_STORAGE_KEY;
export const STORAGE_VERSION = 4;
export const DATA_SECTION_NAMES: DataSectionName[] = ["settings", "workouts", "weeklyWorkoutPlans", "workoutLogs", "coachTips", "calendar"];
export const SECTION_FILE_NAMES: Record<DataSectionName, string> = {
  settings: "settings.json",
  workouts: "workouts.json",
  weeklyWorkoutPlans: "weeklyWorkoutPlans.json",
  workoutLogs: "workoutLogs.json",
  coachTips: "coachTips.json",
  calendar: "calendar.json",
};

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AppRepository {
  loadAppData(): Promise<AppDataSnapshot>;
  saveSetting<K extends keyof PersistedSettings>(key: K, value: PersistedSettings[K]): Promise<void>;
  addTechnique(value: Technique): Promise<void>;
  updateTechnique(value: Technique): Promise<void>;
  deleteTechnique(id: string): Promise<void>;
  importTechniques(values: Technique[]): Promise<void>;
  addExercise(value: Exercise): Promise<void>;
  updateExercise(value: Exercise): Promise<void>;
  deleteExercise(id: string): Promise<void>;
  /** @deprecated Use addExercise. */
  addAvailableExercise(value: Exercise): Promise<void>;
  /** @deprecated Use updateExercise. */
  updateAvailableExercise(value: Exercise): Promise<void>;
  /** @deprecated Use deleteExercise. */
  deleteAvailableExercise(id: string): Promise<void>;
  addWorkout(value: Workout): Promise<void>;
  updateWorkout(value: Workout): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  importWorkouts(values: WorkoutImportPayload[]): Promise<void>;
  saveWeeklyPlan(value: WeeklyWorkoutPlan): Promise<void>;
  addWorkoutLog(value: WorkoutLogEntry): Promise<void>;
  exportSections(selection: DataSectionName[]): Promise<ThaiStrickerSectionFileV1[]>;
  importSections(files: NamedSectionImport[]): Promise<void>;
  exportLegacyDataFile(): Promise<ThaiStrickerDataFileV1>;
  importLegacyDataFile(input: unknown): Promise<ThaiStrickerDataFileV1>;
  reset(): Promise<void>;
}

const storageManifestSchema = z.object({
  storageVersion: z.literal(STORAGE_VERSION),
  sections: z.object({
    settings: z.string().min(1),
    workouts: z.string().min(1),
    weeklyWorkoutPlans: z.string().min(1),
    workoutLogs: z.string().min(1),
    coachTips: z.string().min(1),
    calendar: z.string().min(1),
  }),
});

type StorageManifest = z.infer<typeof storageManifestSchema>;

const clone = <T,>(value: T): T => structuredClone(value);
const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;

export function resolveWorkoutExercises(data: AppDataSnapshot, workout: Workout): ResolvedWorkoutExercise[] {
  const byId = new Map(data.exercises.map((exercise) => [exercise.id, exercise]));
  return workout.exercises.map((occurrence) => {
    const exercise = byId.get(occurrence.exerciseId);
    if (!exercise) throw new Error(`The exercise “${occurrence.exerciseId}” no longer exists.`);
    return { ...occurrence, ...exercise, exerciseId: occurrence.exerciseId, detail: clone(occurrence.detail) };
  });
}

function materialize(data: AppDataSnapshot): AppDataSnapshot {
  const exercises = data.exercises.map((exercise) => ({ ...exercise, techniqueIds: [...exercise.techniqueIds] }));
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const workouts = data.workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((occurrence) => {
      const exercise = byId.get(occurrence.exerciseId);
      return exercise ? { ...exercise, ...occurrence, id: exercise.id } : occurrence;
    }),
  }));
  return { ...data, exercises, workouts };
}

function canonicalize(data: AppDataSnapshot): AppDataSnapshot {
  return {
    ...data,
    exercises: data.exercises.map((exercise) => ({ ...exercise, techniqueIds: [...exercise.techniqueIds] })),
    workouts: data.workouts.map((workout) => ({
      ...workout,
      exercises: workout.exercises.map(({ exerciseId, detail }) => ({ exerciseId, detail: clone(detail) })),
    })),
  };
}

function assertIntegrity(data: AppDataSnapshot) {
  const techniqueIds = new Set(data.techniques.map((item) => item.id));
  assertExerciseCollectionIntegrity(data.exercises, techniqueIds);
  const exerciseIds = new Set(data.exercises.map((exercise) => exercise.id));
  const workoutIds = new Set<string>();
  for (const workout of data.workouts) {
    if (workoutIds.has(workout.id)) throw new Error(`Duplicate workout ID: ${workout.id}`);
    for (const exercise of workout.exercises) if (!exerciseIds.has(exercise.exerciseId)) throw new Error(`The exercise “${exercise.exerciseId}” no longer exists.`);
    workoutIds.add(workout.id);
  }
  for (const plan of data.weeklyWorkoutPlans) {
    for (const day of plan.plannedDays) if (!workoutIds.has(day.workoutId)) throw new Error(`The scheduled workout “${day.workoutTitle}” no longer exists.`);
  }
}

function parseData(value: unknown): AppDataSnapshot {
  const result = appDataSchema.safeParse(value);
  if (!result.success) throw new Error(`Invalid THAI STRICKER data: ${result.error.issues[0]?.message ?? "incorrect format"}`);
  const parsed = result.data as AppDataSnapshot;
  assertIntegrity(parsed);
  return parsed;
}

function buildSectionFile(section: DataSectionName, data: AppDataSnapshot, exportedAt = new Date().toISOString()): ThaiStrickerSectionFileV1 {
  const canonical = canonicalize(data);
  switch (section) {
    case "settings": return { schemaVersion: 1, fileType: section, exportedAt, settings: clone(canonical.settings) };
    case "workouts": return { schemaVersion: 1, fileType: section, exportedAt, techniques: clone(canonical.techniques), exercises: clone(canonical.exercises), workouts: clone(canonical.workouts) };
    case "weeklyWorkoutPlans": return { schemaVersion: 1, fileType: section, exportedAt, weeklyWorkoutPlans: clone(canonical.weeklyWorkoutPlans) };
    case "workoutLogs": return { schemaVersion: 1, fileType: section, exportedAt, workoutLogs: clone(canonical.workoutLogs) };
    case "coachTips": return { schemaVersion: 1, fileType: section, exportedAt, coachTips: clone(canonical.coachTips) };
    case "calendar": return { schemaVersion: 1, fileType: section, exportedAt, calendarWorkoutDays: clone(canonical.calendarWorkoutDays), monthlySummary: clone(canonical.monthlySummary) };
  }
}

function applySectionFile(data: AppDataSnapshot, file: ThaiStrickerSectionFileV1) {
  switch (file.fileType) {
    case "settings": data.settings = clone(file.settings); break;
    case "workouts": data.techniques = clone(file.techniques); data.exercises = clone(file.exercises); data.workouts = clone(file.workouts); break;
    case "weeklyWorkoutPlans": data.weeklyWorkoutPlans = clone(file.weeklyWorkoutPlans); break;
    case "workoutLogs": data.workoutLogs = clone(file.workoutLogs); break;
    case "coachTips": data.coachTips = clone(file.coachTips); break;
    case "calendar": data.calendarWorkoutDays = clone(file.calendarWorkoutDays); data.monthlySummary = clone(file.monthlySummary); break;
  }
}

function parseSectionFile(section: DataSectionName, value: unknown): ThaiStrickerSectionFileV1 {
  if (typeof value === "object" && value !== null && "schemaVersion" in value && value.schemaVersion !== 1) {
    throw new Error(`Unknown version in ${SECTION_FILE_NAMES[section]}: ${String(value.schemaVersion)}.`);
  }
  if (typeof value === "object" && value !== null && "fileType" in value && value.fileType !== section) {
    throw new Error(`${SECTION_FILE_NAMES[section]} declares type “${String(value.fileType)}” instead of “${section}”.`);
  }
  const result = sectionDataFileSchemasV1[section].safeParse(value);
  if (!result.success) throw new Error(`${SECTION_FILE_NAMES[section]} is invalid: ${result.error.issues[0]?.message ?? "incorrect format"}`);
  return result.data as ThaiStrickerSectionFileV1;
}

const storageSectionKey = (section: DataSectionName, revision: string) => `thai-stricker:data:v4:${section}:${revision}`;
const makeRevision = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createAppRepository(storage: StorageAdapter): AppRepository {
  const readManifest = (): StorageManifest | null => {
    const raw = storage.getItem(MANIFEST_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = storageManifestSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "incorrect format");
      return parsed.data;
    } catch (error) {
      throw new Error(`The storage manifest cannot be read. ${error instanceof Error ? error.message : ""}`.trim());
    }
  };

  const readFromManifest = (manifest: StorageManifest): AppDataSnapshot => {
    const data = clone(seedData);
    for (const section of DATA_SECTION_NAMES) {
      const raw = storage.getItem(storageSectionKey(section, manifest.sections[section]));
      if (!raw) throw new Error(`The ${SECTION_FILE_NAMES[section]} section is missing from local storage.`);
      try { applySectionFile(data, parseSectionFile(section, JSON.parse(raw))); }
      catch (error) { throw new Error(`Unable to read local data. ${error instanceof Error ? error.message : ""}`.trim()); }
    }
    return materialize(parseData(data));
  };

  const commit = (data: AppDataSnapshot, previous: StorageManifest | null): StorageManifest => {
    const valid = parseData(data);
    const revisions = Object.fromEntries(DATA_SECTION_NAMES.map((section) => [section, makeRevision()])) as Record<DataSectionName, string>;
    const next: StorageManifest = { storageVersion: STORAGE_VERSION, sections: revisions };
    const writtenKeys: string[] = [];
    try {
      const exportedAt = new Date().toISOString();
      for (const section of DATA_SECTION_NAMES) {
        const key = storageSectionKey(section, revisions[section]);
        storage.setItem(key, JSON.stringify(buildSectionFile(section, valid, exportedAt)));
        writtenKeys.push(key);
      }
      storage.setItem(MANIFEST_STORAGE_KEY, JSON.stringify(next));
    } catch {
      for (const key of writtenKeys) { try { storage.removeItem(key); } catch { /* best effort */ } }
      throw new Error("The browser could not save the data. Check the available storage space and browsing mode.");
    }
    if (previous) {
      for (const section of DATA_SECTION_NAMES) {
        try { storage.removeItem(storageSectionKey(section, previous.sections[section])); } catch { /* best effort */ }
      }
    }
    return next;
  };

  const ensureManifest = (): StorageManifest => {
    const current = readManifest();
    if (current) return current;
    const manifest = commit(clone(seedData), null);
    return manifest;
  };

  const read = () => readFromManifest(ensureManifest());
  const write = (data: AppDataSnapshot) => { commit(data, ensureManifest()); };
  const mutate = async (task: (draft: AppDataSnapshot) => void) => { const draft = clone(read()); task(draft); write(draft); };
  const hydrateWorkout = (draft: AppDataSnapshot, workout: Workout) => {
    const library = new Map(draft.exercises.map((item) => [item.id, item]));
    const exercises = workout.exercises.map((occurrence) => {
      const shared = library.get(occurrence.exerciseId);
      if (!shared) throw new Error(`The exercise “${occurrence.exerciseId}” no longer exists.`);
      return { exerciseId: shared.id, detail: clone(occurrence.detail) };
    });
    return { ...workout, title: workout.title.trim(), exercises, totalDurationMinutes: calculateWorkoutDuration(exercises, workout.restSecondsBetweenExercises, draft.settings.defaultRepsExerciseDurationMinutes) };
  };

  return {
    async loadAppData() { return clone(materialize(read())); },
    async saveSetting(key, value) { await mutate((draft) => { Object.assign(draft.settings, { [key]: value }); }); },
    async addTechnique(value) { await mutate((draft) => { if (draft.techniques.some((item) => item.id === value.id)) throw new Error("This technique already exists."); draft.techniques.push(clone(value)); }); },
    async updateTechnique(value) { await mutate((draft) => { const index = draft.techniques.findIndex((item) => item.id === value.id); if (index < 0) throw new Error("Technique not found."); draft.techniques[index] = clone(value); }); },
    async deleteTechnique(id) {
      await mutate((draft) => {
        const techniqueIndex = draft.techniques.findIndex((item) => item.id === id);
        if (techniqueIndex < 0) throw new Error("Technique not found.");
        draft.techniques.splice(techniqueIndex, 1);
        draft.exercises = draft.exercises.map((exercise) => ({ ...exercise, techniqueIds: exercise.techniqueIds.filter((techniqueId) => techniqueId !== id) }));
      });
    },
    async importTechniques(values) { await mutate((draft) => { for (const value of values) { const index = draft.techniques.findIndex((item) => item.id === value.id); if (index >= 0) draft.techniques[index] = clone(value); else draft.techniques.push(clone(value)); } }); },
    async addExercise(value) {
      await mutate((draft) => {
        const item = { ...clone(value), id: value.id || makeId("exercise"), title: value.title.trim() };
        if (draft.exercises.some((other) => normalizeExerciseName(other.title) === normalizeExerciseName(item.title))) throw new Error(`An exercise named “${item.title}” already exists.`);
        draft.exercises.push(item);
      });
    },
    async updateExercise(value) {
      await mutate((draft) => {
        const index = draft.exercises.findIndex((item) => item.id === value.id);
        if (index < 0) throw new Error("Exercise not found.");
        if (draft.exercises.some((other) => other.id !== value.id && normalizeExerciseName(other.title) === normalizeExerciseName(value.title))) throw new Error(`An exercise named “${value.title.trim()}” already exists.`);
        draft.exercises[index] = { ...clone(value), title: value.title.trim() };
      });
    },
    async deleteExercise(id) {
      await mutate((draft) => {
        if (!draft.exercises.some((item) => item.id === id)) throw new Error("Exercise not found.");
        draft.exercises = draft.exercises.filter((item) => item.id !== id);
        draft.workouts = draft.workouts.map((workout) => ({
          ...workout,
          exercises: workout.exercises.filter((item) => item.exerciseId !== id),
          totalDurationMinutes: calculateWorkoutDuration(
            workout.exercises.filter((item) => item.exerciseId !== id),
            workout.restSecondsBetweenExercises,
            draft.settings.defaultRepsExerciseDurationMinutes,
          ),
        }));
      });
    },
    async addAvailableExercise(value) { return this.addExercise(value); },
    async updateAvailableExercise(value) { return this.updateExercise(value); },
    async deleteAvailableExercise(id) { return this.deleteExercise(id); },
    async addWorkout(value) { await mutate((draft) => { if (draft.workouts.some((item) => item.id === value.id)) throw new Error("This workout already exists."); draft.workouts.push(hydrateWorkout(draft, value)); }); },
    async updateWorkout(value) { await mutate((draft) => { const index = draft.workouts.findIndex((item) => item.id === value.id); if (index < 0) throw new Error("Workout not found."); draft.workouts[index] = hydrateWorkout(draft, value); }); },
    async deleteWorkout(id) { await mutate((draft) => { draft.workouts = draft.workouts.filter((item) => item.id !== id); draft.weeklyWorkoutPlans = draft.weeklyWorkoutPlans.map((plan) => ({ ...plan, plannedDays: plan.plannedDays.filter((day) => day.workoutId !== id) })); }); },
    async importWorkouts(values) {
      await mutate((draft) => {
        for (const imported of values) {
          const occurrences = imported.exercises.map((exercise) => {
            const shared = draft.exercises.find((item) => item.id === exercise.exerciseId);
            if (!shared) throw new Error(`The exercise “${exercise.exerciseId}” no longer exists.`);
            return { exerciseId: shared.id, detail: clone(exercise.detail) };
          });
          const workout: Workout = { ...clone(imported), id: makeId("workout"), exercises: occurrences, totalDurationMinutes: 0 };
          draft.workouts.push(hydrateWorkout(draft, workout));
        }
      });
    },
    async saveWeeklyPlan(value) { await mutate((draft) => { const plan = { ...clone(value), source: "web" as const }; const index = draft.weeklyWorkoutPlans.findIndex((item) => item.weekStartDate === value.weekStartDate); if (index >= 0) draft.weeklyWorkoutPlans[index] = plan; else draft.weeklyWorkoutPlans.push(plan); }); },
    async addWorkoutLog(value) {
      await mutate((draft) => {
        draft.workoutLogs.push({ ...clone(value), source: "web" });
        const workout = draft.workouts.find((item) => item.id === value.workoutId); if (workout) workout.lastDoneDate = value.completedDate;
        draft.calendarWorkoutDays = draft.calendarWorkoutDays.filter((item) => item.date !== value.completedDate);
        draft.calendarWorkoutDays.push({ date: value.completedDate, status: "completed", workoutName: value.workoutTitle });
        const month = value.completedDate.slice(0, 7); draft.monthlySummary.completedWorkouts = draft.workoutLogs.filter((item) => item.completedDate.startsWith(month)).length;
      });
    },
    async exportSections(selection) {
      if (!selection.length) throw new Error("Select at least one file to export.");
      if (new Set(selection).size !== selection.length || selection.some((section) => !DATA_SECTION_NAMES.includes(section))) throw new Error("The export selection contains an unknown or duplicate section.");
      const data = read();
      const exportedAt = new Date().toISOString();
      return selection.map((section) => buildSectionFile(section, data, exportedAt));
    },
    async importSections(files) {
      if (!files.length) throw new Error("No files to import.");
      const byFilename = new Map<string, NamedSectionImport>();
      const sectionByFilename = Object.fromEntries(DATA_SECTION_NAMES.map((section) => [SECTION_FILE_NAMES[section], section])) as Record<string, DataSectionName>;
      for (const file of files) {
        const section = sectionByFilename[file.filename];
        if (!section) throw new Error(`Unknown filename: ${file.filename}.`);
        if (byFilename.has(file.filename)) throw new Error(`Duplicate file: ${file.filename}.`);
        byFilename.set(file.filename, file);
      }
      const next = clone(read());
      for (const [filename, file] of byFilename) applySectionFile(next, parseSectionFile(sectionByFilename[filename], file.content));
      write(parseData(next));
    },
    async exportLegacyDataFile() { return { ...clone(canonicalize(read())), schemaVersion: 1, exportedAt: new Date().toISOString() }; },
    async importLegacyDataFile(input) {
      const parsed = dataFileSchemaV1.safeParse(input);
      if (!parsed.success) { const version = typeof input === "object" && input !== null && "schemaVersion" in input ? String(input.schemaVersion) : "missing"; throw new Error(`Incompatible backup (version ${version}). ${parsed.error.issues[0]?.message ?? "Incorrect format."}`); }
      const backup = await this.exportLegacyDataFile(); write(parseData(parsed.data)); return backup;
    },
    async reset() {
      const manifest = readManifest();
      if (manifest) for (const section of DATA_SECTION_NAMES) storage.removeItem(storageSectionKey(section, manifest.sections[section]));
      storage.removeItem(MANIFEST_STORAGE_KEY);
      storage.removeItem(LEGACY_STORAGE_KEY);
    },
  };
}

const unavailableStorage: StorageAdapter = {
  getItem: () => null,
  setItem: () => { throw new Error("Browser storage is unavailable."); },
  removeItem: () => undefined,
};

export const appRepository = createAppRepository(
  typeof window === "undefined" ? unavailableStorage : window.localStorage,
);
