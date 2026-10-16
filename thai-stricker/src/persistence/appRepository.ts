import { z } from "zod";
import { appDataSchema, dataFileSchemaV1, sectionDataFileSchemasV1 } from "./dataSchema";
import { seedData } from "./seedData";
import type { AppDataSnapshot, DataSectionName, Exercise, NamedSectionImport, PersistedSettings, Technique, ThaiStrickerDataFileV1, ThaiStrickerSectionFileV1, WeeklyWorkoutPlan, Workout, WorkoutImportPayload, WorkoutLogEntry } from "../types/domain";

export const LEGACY_STORAGE_KEY = "thai-stricker:data:v1";
export const MANIFEST_STORAGE_KEY = "thai-stricker:data:v2:manifest";
export const STORAGE_KEY = MANIFEST_STORAGE_KEY;
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
  importTechniques(values: Technique[]): Promise<void>;
  addAvailableExercise(value: Exercise): Promise<void>;
  updateAvailableExercise(value: Exercise): Promise<void>;
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
  storageVersion: z.literal(2),
  sections: z.object({
    settings: z.string().min(1),
    workouts: z.string().min(1),
    weeklyWorkoutPlans: z.string().min(1),
    workoutLogs: z.string().min(1),
    coachTips: z.string().min(1),
    calendar: z.string().min(1),
  }),
});

type StorageManifestV2 = z.infer<typeof storageManifestSchema>;

const clone = <T,>(value: T): T => structuredClone(value);
export const normalizeExerciseName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
const makeId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;

export function calculateWorkoutDuration(exercises: Workout["exercises"], restSeconds: number, defaultRepsMinutes: number) {
  const workSeconds = exercises.reduce((sum, exercise) => sum + (exercise.target.type === "duration" ? exercise.target.seconds : defaultRepsMinutes * 60), 0);
  return Math.ceil((workSeconds + Math.max(0, exercises.length - 1) * restSeconds) / 60);
}

function assertIntegrity(data: AppDataSnapshot) {
  const techniqueIds = new Set(data.techniques.map((item) => item.id));
  const exerciseIds = new Set<string>();
  const names = new Set<string>();
  for (const exercise of data.availableExercises) {
    const name = normalizeExerciseName(exercise.title);
    if (exerciseIds.has(exercise.id)) throw new Error(`Duplicate exercise ID: ${exercise.id}`);
    if (names.has(name)) throw new Error(`An exercise named “${exercise.title.trim()}” already exists.`);
    if (new Set(exercise.techniqueIds).size !== exercise.techniqueIds.length) throw new Error(`The techniques for “${exercise.title}” are duplicated.`);
    for (const id of exercise.techniqueIds) if (!techniqueIds.has(id)) throw new Error(`Unknown technique: ${id}`);
    exerciseIds.add(exercise.id);
    names.add(name);
  }
  const workoutIds = new Set<string>();
  for (const workout of data.workouts) {
    if (workoutIds.has(workout.id)) throw new Error(`Duplicate workout ID: ${workout.id}`);
    for (const exercise of workout.exercises) if (!exerciseIds.has(exercise.id)) throw new Error(`The exercise “${exercise.title}” no longer exists.`);
    workoutIds.add(workout.id);
  }
  for (const plan of data.weeklyWorkoutPlans) {
    for (const day of plan.plannedDays) if (!workoutIds.has(day.workoutId)) throw new Error(`The scheduled workout “${day.workoutTitle}” no longer exists.`);
  }
}

function parseData(value: unknown): AppDataSnapshot {
  const result = appDataSchema.safeParse(value);
  if (!result.success) throw new Error(`Invalid ThaiStricker data: ${result.error.issues[0]?.message ?? "incorrect format"}`);
  const parsed = result.data as AppDataSnapshot;
  assertIntegrity(parsed);
  return parsed;
}

function buildSectionFile(section: DataSectionName, data: AppDataSnapshot, exportedAt = new Date().toISOString()): ThaiStrickerSectionFileV1 {
  switch (section) {
    case "settings": return { schemaVersion: 1, fileType: section, exportedAt, settings: clone(data.settings) };
    case "workouts": return { schemaVersion: 1, fileType: section, exportedAt, techniques: clone(data.techniques), availableExercises: clone(data.availableExercises), workouts: clone(data.workouts) };
    case "weeklyWorkoutPlans": return { schemaVersion: 1, fileType: section, exportedAt, weeklyWorkoutPlans: clone(data.weeklyWorkoutPlans) };
    case "workoutLogs": return { schemaVersion: 1, fileType: section, exportedAt, workoutLogs: clone(data.workoutLogs) };
    case "coachTips": return { schemaVersion: 1, fileType: section, exportedAt, coachTips: clone(data.coachTips) };
    case "calendar": return { schemaVersion: 1, fileType: section, exportedAt, calendarWorkoutDays: clone(data.calendarWorkoutDays), monthlySummary: clone(data.monthlySummary) };
  }
}

function applySectionFile(data: AppDataSnapshot, file: ThaiStrickerSectionFileV1) {
  switch (file.fileType) {
    case "settings": data.settings = clone(file.settings); break;
    case "workouts": data.techniques = clone(file.techniques); data.availableExercises = clone(file.availableExercises); data.workouts = clone(file.workouts); break;
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

const storageSectionKey = (section: DataSectionName, revision: string) => `thai-stricker:data:v2:${section}:${revision}`;
const makeRevision = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function createAppRepository(storage: StorageAdapter): AppRepository {
  const readManifest = (): StorageManifestV2 | null => {
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

  const readFromManifest = (manifest: StorageManifestV2): AppDataSnapshot => {
    const data = clone(seedData);
    for (const section of DATA_SECTION_NAMES) {
      const raw = storage.getItem(storageSectionKey(section, manifest.sections[section]));
      if (!raw) throw new Error(`The ${SECTION_FILE_NAMES[section]} section is missing from local storage.`);
      try { applySectionFile(data, parseSectionFile(section, JSON.parse(raw))); }
      catch (error) { throw new Error(`Unable to read local data. ${error instanceof Error ? error.message : ""}`.trim()); }
    }
    return parseData(data);
  };

  const commit = (data: AppDataSnapshot, previous: StorageManifestV2 | null): StorageManifestV2 => {
    const valid = parseData(data);
    const revisions = Object.fromEntries(DATA_SECTION_NAMES.map((section) => [section, makeRevision()])) as Record<DataSectionName, string>;
    const next: StorageManifestV2 = { storageVersion: 2, sections: revisions };
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

  const ensureManifest = (): StorageManifestV2 => {
    const current = readManifest();
    if (current) return current;
    const legacyRaw = storage.getItem(LEGACY_STORAGE_KEY);
    let initial = clone(seedData);
    if (legacyRaw) {
      try { initial = parseData(JSON.parse(legacyRaw)); }
      catch (error) { throw new Error(`Unable to migrate local data. ${error instanceof Error ? error.message : ""}`.trim()); }
    }
    const manifest = commit(initial, null);
    if (legacyRaw) storage.removeItem(LEGACY_STORAGE_KEY);
    return manifest;
  };

  const read = () => readFromManifest(ensureManifest());
  const write = (data: AppDataSnapshot) => { commit(data, ensureManifest()); };
  const mutate = async (task: (draft: AppDataSnapshot) => void) => { const draft = clone(read()); task(draft); write(draft); };
  const hydrateWorkout = (draft: AppDataSnapshot, workout: Workout) => {
    const library = new Map(draft.availableExercises.map((item) => [item.id, item]));
    const exercises = workout.exercises.map((occurrence) => {
      const shared = library.get(occurrence.id);
      if (!shared) throw new Error(`The exercise “${occurrence.title}” no longer exists.`);
      return { ...occurrence, title: shared.title, description: shared.description, help: shared.help, category: shared.category, imageUri: shared.imageUri };
    });
    return { ...workout, title: workout.title.trim(), exercises, totalDurationMinutes: calculateWorkoutDuration(exercises, workout.restSecondsBetweenExercises, draft.settings.defaultRepsExerciseDurationMinutes) };
  };

  return {
    async loadAppData() { return clone(read()); },
    async saveSetting(key, value) { await mutate((draft) => { Object.assign(draft.settings, { [key]: value }); }); },
    async addTechnique(value) { await mutate((draft) => { if (draft.techniques.some((item) => item.id === value.id)) throw new Error("This technique already exists."); draft.techniques.push(clone(value)); }); },
    async updateTechnique(value) { await mutate((draft) => { const index = draft.techniques.findIndex((item) => item.id === value.id); if (index < 0) throw new Error("Technique not found."); draft.techniques[index] = clone(value); }); },
    async importTechniques(values) { await mutate((draft) => { for (const value of values) { const index = draft.techniques.findIndex((item) => item.id === value.id); if (index >= 0) draft.techniques[index] = clone(value); else draft.techniques.push(clone(value)); } }); },
    async addAvailableExercise(value) {
      await mutate((draft) => {
        const item = { ...clone(value), id: value.id || makeId("exercise"), title: value.title.trim() };
        if (draft.availableExercises.some((other) => normalizeExerciseName(other.title) === normalizeExerciseName(item.title))) throw new Error(`An exercise named “${item.title}” already exists.`);
        draft.availableExercises.push(item);
      });
    },
    async updateAvailableExercise(value) {
      await mutate((draft) => {
        const index = draft.availableExercises.findIndex((item) => item.id === value.id);
        if (index < 0) throw new Error("Exercise not found.");
        if (draft.availableExercises.some((other) => other.id !== value.id && normalizeExerciseName(other.title) === normalizeExerciseName(value.title))) throw new Error(`An exercise named “${value.title.trim()}” already exists.`);
        const shared = { ...clone(value), title: value.title.trim() };
        draft.availableExercises[index] = shared;
        draft.workouts = draft.workouts.map((workout) => ({ ...workout, exercises: workout.exercises.map((item) => item.id === shared.id ? { ...item, title: shared.title, description: shared.description, help: shared.help, category: shared.category, imageUri: shared.imageUri } : item) }));
      });
    },
    async deleteAvailableExercise(id) { await mutate((draft) => { if (draft.workouts.some((workout) => workout.exercises.some((item) => item.id === id))) throw new Error("This exercise is used in a workout."); draft.availableExercises = draft.availableExercises.filter((item) => item.id !== id); }); },
    async addWorkout(value) { await mutate((draft) => { if (draft.workouts.some((item) => item.id === value.id)) throw new Error("This workout already exists."); draft.workouts.push(hydrateWorkout(draft, value)); }); },
    async updateWorkout(value) { await mutate((draft) => { const index = draft.workouts.findIndex((item) => item.id === value.id); if (index < 0) throw new Error("Workout not found."); draft.workouts[index] = hydrateWorkout(draft, value); }); },
    async deleteWorkout(id) { await mutate((draft) => { draft.workouts = draft.workouts.filter((item) => item.id !== id); draft.weeklyWorkoutPlans = draft.weeklyWorkoutPlans.map((plan) => ({ ...plan, plannedDays: plan.plannedDays.filter((day) => day.workoutId !== id) })); }); },
    async importWorkouts(values) {
      await mutate((draft) => {
        for (const imported of values) {
          const occurrences = imported.exercises.map((exercise) => {
            let shared = draft.availableExercises.find((item) => normalizeExerciseName(item.title) === normalizeExerciseName(exercise.title));
            if (!shared) { shared = { ...clone(exercise), id: makeId("exercise"), techniqueIds: exercise.techniqueIds ?? [] }; draft.availableExercises.push(shared); }
            return { ...shared, target: clone(exercise.target) };
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
    async exportLegacyDataFile() { return { ...clone(read()), schemaVersion: 1, exportedAt: new Date().toISOString() }; },
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
