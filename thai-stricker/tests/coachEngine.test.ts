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
    expect(prompt).toContain("Critical guard cue");
    expect(prompt).toContain("rear elbow down to protect the upper torso");
    expect(prompt).toContain("rear hand close to the cheek");
    expect(prompt).toContain("rotate it only just before the strike");
    expect(prompt).toContain("protect against a simultaneous or early counter");
    expect(prompt).toContain("not to disrupt timing");
    expect(prompt).toContain("disrupt timing");
    expect(prompt).toContain("Keep the elbow down");
    expect(prompt).toContain("for as long as possible");
    expect(prompt).toContain("do not replace this with 'quick elbow movement'");
    expect(prompt).toContain("Final constraint: stay specific to the requested action");
    expect(prompt).toContain("front foot");
    expect(prompt).toContain("create space");
    expect(prompt).toContain("Double or triple jab");
    expect(prompt).toContain("Answer in English");
    expect(prompt).toContain("Focus technique: JAB");
    expect(prompt).toContain("Select only 2 or 3 concrete execution cues");
    expect(prompt).toContain("Do not explain another technique");
    const mistakePrompt = buildCoachPrompt({ action: "commonMistakes", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(mistakePrompt).toContain("Select only 2 or 3 of the validated jab mistakes");
    expect(mistakePrompt).toContain("each paired with its correction");
    const focusPrompt = buildCoachPrompt({ action: "focusPoints", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(focusPrompt).toContain("Select only 2 or 3 short focus points");
    expect(focusPrompt).toContain("do not list all eight");
    const explanationPrompt = buildCoachPrompt({ action: "explanation", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(explanationPrompt).toContain("Select only 2 or 3 validated points");
    expect(explanationPrompt).toContain("disrupt the opponent's timing");
    expect(explanationPrompt).toContain("keep it direct to the target");
  });

  it("provides a local response for every guided action", () => {
    for (const action of ["technicalTips", "commonMistakes", "focusPoints", "explanation"] as const) {
      expect(getFallbackCoachResponse({ action, focusTechnique: "JAB", exercise, techniques: [technique], knowledge: [], workout })).toBeTruthy();
    }
  });

  it("builds cross-specific coaching context without jab-only instructions", () => {
    const cross = { ...technique, name: "CROSS", shortName: "CROSS" };
    const knowledge = getCoachKnowledgeForTechniqueNames([cross.name]);
    expect(knowledge).toHaveLength(1);
    expect(knowledge[0].technique).toBe("CROSS");
    expect(knowledge[0].principles).toContain("Drive from the rear foot and rotate the rear hip, waist, and shoulder together.");
    expect(knowledge[0].criticalGuardCue).toContain("lead hand close to the chin");
    const prompt = buildCoachPrompt({ action: "technicalTips", focusTechnique: "CROSS", exercise, techniques: [cross], knowledge, workout });
    expect(prompt).toContain("Focus technique: CROSS");
    expect(prompt).toContain("rear-foot drive");
    expect(prompt).toContain("lead hand close to the chin");
    expect(prompt).not.toContain("front-hand straight punch");
    const mistakes = buildCoachPrompt({ action: "commonMistakes", focusTechnique: "CROSS", exercise, techniques: [cross], knowledge, workout });
    expect(mistakes).toContain("validated cross mistakes");
    expect(mistakes).not.toContain("four requested jab mistakes");
  });

  it("uses combination coaching when jab and cross are in the same exercise", () => {
    const cross = { ...technique, id: "technique-2", name: "CROSS", shortName: "CROSS" };
    const techniques = [technique, cross];
    const knowledge = getCoachKnowledgeForTechniqueNames(techniques.map((item) => item.name));
    const prompt = buildCoachPrompt({ action: "technicalTips", focusTechnique: "JAB + CROSS", exercise, techniques, knowledge, workout });
    expect(prompt).toContain("This is combination coaching for JAB then CROSS");
    expect(prompt).toContain("Address every validated technique in sequence");
    expect(prompt).toContain("transition between techniques");
    expect(prompt).toContain("Validated technique: JAB");
    expect(prompt).toContain("Validated technique: CROSS");
    const fallback = getFallbackCoachResponse({ action: "focusPoints", focusTechnique: "JAB + CROSS", exercise, techniques, knowledge, workout });
    expect(fallback).toContain("JAB:");
    expect(fallback).toContain("CROSS:");
  });
});
