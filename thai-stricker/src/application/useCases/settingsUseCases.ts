import type { DataSectionName, NamedSectionImport, ThaiStrickerSectionFileV1, WorkoutImportPayload } from "../../types/domain";
import type { PersistedSettings } from "../../domain/entities/settings";
import type { Technique } from "../../domain/entities/technique";

export type SettingsRepository = {
  saveSetting<K extends keyof PersistedSettings>(key: K, value: PersistedSettings[K]): Promise<void>;
  exportSections(selection: DataSectionName[]): Promise<ThaiStrickerSectionFileV1[]>;
  importSections(files: NamedSectionImport[]): Promise<void>;
  importLegacyDataFile(input: unknown): Promise<unknown>;
  importWorkouts(values: WorkoutImportPayload[]): Promise<void>;
  importTechniques(values: Technique[]): Promise<void>;
  reset(): Promise<void>;
};

export async function updateSetting<K extends keyof PersistedSettings>(repository: SettingsRepository, key: K, value: PersistedSettings[K]) {
  await repository.saveSetting(key, value);
}

export async function exportBackup(repository: SettingsRepository, selection: DataSectionName[]) {
  return repository.exportSections(selection);
}

export function extractWorkouts(input: unknown): WorkoutImportPayload[] {
  const values = Array.isArray(input) ? input : (input as { workouts?: WorkoutImportPayload[] } | null)?.workouts;
  if (!Array.isArray(values)) throw new Error("The file does not contain workouts.");
  return values;
}

export function extractTechniques(input: unknown): Technique[] {
  const values = Array.isArray(input) ? input : (input as { techniques?: Technique[] } | null)?.techniques;
  if (!Array.isArray(values)) throw new Error("The file does not contain techniques.");
  return values;
}

export async function importSectionFiles(repository: SettingsRepository, files: NamedSectionImport[], backupSelection: DataSectionName[]) {
  const backup = await repository.exportSections(backupSelection);
  await repository.importSections(files);
  return backup;
}

export async function importLegacyBackup(repository: SettingsRepository, input: unknown, backupSelection: DataSectionName[]) {
  const backup = await repository.exportSections(backupSelection);
  await repository.importLegacyDataFile(input);
  return backup;
}

export async function importWorkouts(repository: SettingsRepository, input: unknown) {
  const values = extractWorkouts(input);
  await repository.importWorkouts(values);
  return values.length;
}

export async function importTechniques(repository: SettingsRepository, input: unknown) {
  const values = extractTechniques(input);
  await repository.importTechniques(values);
  return values.length;
}

export async function resetApplication(repository: SettingsRepository, backupSelection: DataSectionName[]) {
  const backup = await repository.exportSections(backupSelection);
  await repository.reset();
  return backup;
}
