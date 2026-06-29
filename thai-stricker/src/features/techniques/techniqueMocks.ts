export type TechniqueCategory =
  | "Muay Thai techniques"
  | "Stretching Techniques"
  | "Strength Techniques";

export const TECHNIQUE_CATEGORIES: TechniqueCategory[] = [
  "Muay Thai techniques",
  "Stretching Techniques",
  "Strength Techniques",
];

export type Technique = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: TechniqueCategory;
  subCategory: string;
};
