import { appDataSchema, dataFileSchemaV1 } from "./dataSchema";
import { seedData } from "./seedData";
import type { AppDataSnapshot, Exercise, PersistedSettings, Technique, ThaiStrickerDataFileV1, WeeklyWorkoutPlan, Workout, WorkoutImportPayload, WorkoutLogEntry } from "../types/domain";

export const STORAGE_KEY = "thai-stricker:data:v1";

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
  exportDataFile(): Promise<ThaiStrickerDataFileV1>;
  importDataFile(input: unknown): Promise<ThaiStrickerDataFileV1>;
  reset(): Promise<void>;
}

const clone = <T,>(value: T): T => structuredClone(value);
export const normalizeExerciseName = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
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
    if (exerciseIds.has(exercise.id)) throw new Error(`Identifiant d'exercice dupliqué : ${exercise.id}`);
    if (names.has(name)) throw new Error(`Un exercice nommé « ${exercise.title.trim()} » existe déjà.`);
    if (new Set(exercise.techniqueIds).size !== exercise.techniqueIds.length) throw new Error(`Les techniques de « ${exercise.title} » sont dupliquées.`);
    for (const id of exercise.techniqueIds) if (!techniqueIds.has(id)) throw new Error(`Technique inconnue : ${id}`);
    exerciseIds.add(exercise.id);
    names.add(name);
  }
  const workoutIds = new Set<string>();
  for (const workout of data.workouts) {
    if (workoutIds.has(workout.id)) throw new Error(`Identifiant de séance dupliqué : ${workout.id}`);
    for (const exercise of workout.exercises) if (!exerciseIds.has(exercise.id)) throw new Error(`L'exercice « ${exercise.title} » n'existe plus.`);
    workoutIds.add(workout.id);
  }
  for (const plan of data.weeklyWorkoutPlans) {
    for (const day of plan.plannedDays) if (!workoutIds.has(day.workoutId)) throw new Error(`La séance planifiée « ${day.workoutTitle} » n'existe plus.`);
  }
}

function parseData(value: unknown): AppDataSnapshot {
  const result = appDataSchema.safeParse(value);
  if (!result.success) throw new Error(`Données ThaiStricker invalides : ${result.error.issues[0]?.message ?? "format incorrect"}`);
  const parsed = result.data as AppDataSnapshot;
  assertIntegrity(parsed);
  return parsed;
}

export function createAppRepository(storage: StorageAdapter): AppRepository {
  const read = () => {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return clone(seedData);
    try { return parseData(JSON.parse(raw)); }
    catch (error) { throw new Error(`Impossible de lire les données locales. ${error instanceof Error ? error.message : ""}`.trim()); }
  };
  const write = (data: AppDataSnapshot) => {
    const valid = parseData(data);
    try { storage.setItem(STORAGE_KEY, JSON.stringify(valid)); }
    catch { throw new Error("Le navigateur n'a pas pu enregistrer les données. Vérifiez l'espace disponible et le mode de navigation."); }
  };
  const mutate = async (task: (draft: AppDataSnapshot) => void) => { const draft = clone(read()); task(draft); write(draft); };
  const hydrateWorkout = (draft: AppDataSnapshot, workout: Workout) => {
    const library = new Map(draft.availableExercises.map((item) => [item.id, item]));
    const exercises = workout.exercises.map((occurrence) => {
      const shared = library.get(occurrence.id);
      if (!shared) throw new Error(`L'exercice « ${occurrence.title} » n'existe plus.`);
      return { ...occurrence, title: shared.title, description: shared.description, help: shared.help, category: shared.category, imageUri: shared.imageUri };
    });
    return { ...workout, title: workout.title.trim(), exercises, totalDurationMinutes: calculateWorkoutDuration(exercises, workout.restSecondsBetweenExercises, draft.settings.defaultRepsExerciseDurationMinutes) };
  };

  return {
    async loadAppData() { return clone(read()); },
    async saveSetting(key, value) { await mutate((draft) => { Object.assign(draft.settings, { [key]: value }); }); },
    async addTechnique(value) { await mutate((draft) => { if (draft.techniques.some((item) => item.id === value.id)) throw new Error("Cette technique existe déjà."); draft.techniques.push(clone(value)); }); },
    async updateTechnique(value) { await mutate((draft) => { const index = draft.techniques.findIndex((item) => item.id === value.id); if (index < 0) throw new Error("Technique introuvable."); draft.techniques[index] = clone(value); }); },
    async importTechniques(values) { await mutate((draft) => { for (const value of values) { const index = draft.techniques.findIndex((item) => item.id === value.id); if (index >= 0) draft.techniques[index] = clone(value); else draft.techniques.push(clone(value)); } }); },
    async addAvailableExercise(value) {
      await mutate((draft) => {
        const item = { ...clone(value), id: value.id || makeId("exercise"), title: value.title.trim() };
        if (draft.availableExercises.some((other) => normalizeExerciseName(other.title) === normalizeExerciseName(item.title))) throw new Error(`Un exercice nommé « ${item.title} » existe déjà.`);
        draft.availableExercises.push(item);
      });
    },
    async updateAvailableExercise(value) {
      await mutate((draft) => {
        const index = draft.availableExercises.findIndex((item) => item.id === value.id);
        if (index < 0) throw new Error("Exercice introuvable.");
        if (draft.availableExercises.some((other) => other.id !== value.id && normalizeExerciseName(other.title) === normalizeExerciseName(value.title))) throw new Error(`Un exercice nommé « ${value.title.trim()} » existe déjà.`);
        const shared = { ...clone(value), title: value.title.trim() };
        draft.availableExercises[index] = shared;
        draft.workouts = draft.workouts.map((workout) => ({ ...workout, exercises: workout.exercises.map((item) => item.id === shared.id ? { ...item, title: shared.title, description: shared.description, help: shared.help, category: shared.category, imageUri: shared.imageUri } : item) }));
      });
    },
    async deleteAvailableExercise(id) { await mutate((draft) => { if (draft.workouts.some((workout) => workout.exercises.some((item) => item.id === id))) throw new Error("Cet exercice est utilisé dans une séance."); draft.availableExercises = draft.availableExercises.filter((item) => item.id !== id); }); },
    async addWorkout(value) { await mutate((draft) => { if (draft.workouts.some((item) => item.id === value.id)) throw new Error("Cette séance existe déjà."); draft.workouts.push(hydrateWorkout(draft, value)); }); },
    async updateWorkout(value) { await mutate((draft) => { const index = draft.workouts.findIndex((item) => item.id === value.id); if (index < 0) throw new Error("Séance introuvable."); draft.workouts[index] = hydrateWorkout(draft, value); }); },
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
    async exportDataFile() { return { ...clone(read()), schemaVersion: 1, exportedAt: new Date().toISOString() }; },
    async importDataFile(input) {
      const parsed = dataFileSchemaV1.safeParse(input);
      if (!parsed.success) { const version = typeof input === "object" && input !== null && "schemaVersion" in input ? String(input.schemaVersion) : "absente"; throw new Error(`Sauvegarde incompatible (version ${version}). ${parsed.error.issues[0]?.message ?? "Format incorrect."}`); }
      const backup = await this.exportDataFile(); write(parseData(parsed.data)); return backup;
    },
    async reset() { storage.removeItem(STORAGE_KEY); },
  };
}

const unavailableStorage: StorageAdapter = {
  getItem: () => null,
  setItem: () => { throw new Error("Stockage navigateur indisponible."); },
  removeItem: () => undefined,
};

export const appRepository = createAppRepository(
  typeof window === "undefined" ? unavailableStorage : window.localStorage,
);
