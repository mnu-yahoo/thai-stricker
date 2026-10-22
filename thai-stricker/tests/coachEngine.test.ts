import { describe, expect, it } from "vitest";
import { buildCoachPrompt, getFallbackCoachResponse } from "../src/application/services/coachEngine";
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
    const prompt = buildCoachPrompt({ action: "technicalTips", exercise, techniques: [technique], workout });
    expect(prompt).toContain("Jab cross");
    expect(prompt).toContain(exercise.description);
    expect(prompt).toContain("Gardez les épaules relâchées.");
    expect(prompt).toContain("JAB");
    expect(prompt).toContain("Fondamentaux");
    expect(prompt).toContain("Do not give medical, injury, nutrition, or supplement advice.");
  });

  it("provides a local response for every guided action", () => {
    for (const action of ["technicalTips", "commonMistakes", "focusPoints", "explanation"] as const) {
      expect(getFallbackCoachResponse({ action, exercise, techniques: [technique], workout })).toBeTruthy();
    }
  });
});
