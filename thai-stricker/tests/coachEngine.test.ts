import { describe, expect, it } from "vitest";
import { buildCoachPrompt, getFallbackCoachResponse } from "../src/application/services/coachEngine";
import { getCoachKnowledgeForTechniqueNames } from "../src/application/services/coachKnowledge";
import type { Exercise, Technique, Workout } from "../src/types/domain";

const exercise: Exercise = {
  id: "exercise-1", title: "Jab cross", description: "Enchaînement direct et contrôle du retour en garde.",
  help: "Gardez les épaules relâchées.", category: "Striking", detail: { type: "reps", reps: 15 }, techniqueIds: ["technique-1"],
};
const technique: Technique = {
  id: "technique-1", name: "JAB", shortName: "JAB", description: "Direct du bras avant.", category: "Muay Thai techniques", subCategory: "Punches",
};
const workout: Workout = {
  id: "workout-1", title: "Fondamentaux", description: "Travail propre et progressif.", difficulty: "Beginner", category: "Fundamentals",
  totalDurationMinutes: 5, restSecondsBetweenExercises: 30, exercises: [{ exerciseId: exercise.id, detail: exercise.detail }],
};

describe("local coach engine", () => {
  it("builds a strict prompt from the selected exercise and workout context", () => {
    const knowledge = getCoachKnowledgeForTechniqueNames([technique.name]);
    const prompt = buildCoachPrompt({ action: "technicalTips", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(prompt).toContain("Jab cross");
    expect(prompt).toContain(exercise.description);
    expect(prompt).toContain("Gardez les épaules relâchées.");
    expect(prompt).toContain("JAB");
    expect(prompt).toContain("Fondamentaux");
    expect(prompt).toContain("Validated technique: JAB");
    expect(prompt).toContain("disrupt timing");
    expect(prompt).toContain("Keep the elbow down");
    expect(prompt).toContain("front foot");
    expect(prompt).toContain("create space");
    expect(prompt).toContain("Double or triple jab");
    expect(prompt).toContain("Answer in English");
    expect(prompt).toContain("Focus technique: JAB");
    expect(prompt).toContain("Give 2 or 3 concrete execution cues");
    expect(prompt).toContain("Do not explain another technique");
  });

  it("provides a local response for every guided action", () => {
    for (const action of ["technicalTips", "commonMistakes", "focusPoints", "explanation"] as const) {
      expect(getFallbackCoachResponse({ action, focusTechnique: "JAB", exercise, techniques: [technique], knowledge: [], workout })).toBeTruthy();
    }
  });
});
