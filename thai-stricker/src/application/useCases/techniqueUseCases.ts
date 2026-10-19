import type { Technique } from "../../domain/entities/technique";

export const ALL_SUB_CATEGORIES = "all";

export function searchTechniques(techniques: Technique[], searchTerm: string) {
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  if (!normalizedSearchTerm) return techniques;
  return techniques.filter((technique) => technique.name.toLocaleLowerCase().includes(normalizedSearchTerm));
}

export function filterTechniquesBySubCategory(techniques: Technique[], subCategory: string) {
  if (subCategory === ALL_SUB_CATEGORIES) return techniques;
  return techniques.filter((technique) => technique.subCategory === subCategory);
}
