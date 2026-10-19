import type { Exercise } from "../../domain/entities/exercise";
import type { Technique } from "../../domain/entities/technique";

export const ALL_SUB_CATEGORIES = "all";

export type CreateTechniqueInput = Omit<Technique, "id">;

function makeTechniqueId() {
  return `technique-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

export function createTechnique(input: CreateTechniqueInput, existingId?: string): Technique {
  if (!input.name.trim()) throw new Error("A technique name is required.");
  if (!input.shortName.trim()) throw new Error("A technique short name is required.");
  if (!input.description.trim()) throw new Error("A technique description is required.");
  if (!input.subCategory.trim()) throw new Error("A technique sub-category is required.");

  return {
    ...input,
    id: existingId ?? makeTechniqueId(),
    name: input.name.trim(),
    shortName: input.shortName.trim(),
    description: input.description.trim(),
    subCategory: input.subCategory.trim(),
  };
}

export function searchTechniques(techniques: Technique[], searchTerm: string) {
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  if (!normalizedSearchTerm) return techniques;
  return techniques.filter((technique) => technique.name.toLocaleLowerCase().includes(normalizedSearchTerm));
}

export function filterTechniquesBySubCategory(techniques: Technique[], subCategory: string) {
  if (subCategory === ALL_SUB_CATEGORIES) return techniques;
  return techniques.filter((technique) => technique.subCategory === subCategory);
}

export function getTechniqueSubCategories(techniques: Technique[]) {
  return Array.from(new Set(techniques.map((technique) => technique.subCategory)));
}

export function groupTechniquesBySubCategory(techniques: Technique[]) {
  const groups = new Map<string, Technique[]>();
  for (const technique of techniques) {
    const group = groups.get(technique.subCategory) ?? [];
    group.push(technique);
    groups.set(technique.subCategory, group);
  }
  return Array.from(groups, ([subCategory, group]) => ({
    subCategory,
    techniques: [...group].sort((left, right) => left.name.localeCompare(right.name)),
  })).sort((left, right) => left.subCategory.localeCompare(right.subCategory));
}

export function getTechniqueUsage(techniques: Technique[], exercises: Exercise[]) {
  return new Map(techniques.map((technique) => [
    technique.id,
    exercises.filter((exercise) => exercise.techniqueIds.includes(technique.id)).length,
  ]));
}
