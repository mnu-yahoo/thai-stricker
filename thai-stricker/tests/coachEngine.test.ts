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
    expect(prompt).not.toContain("Critical guard cue");
    expect(prompt).not.toContain("Key cues");
    expect(prompt).toContain("disrupt timing");
    expect(prompt).toContain("Keep the elbow down");
    expect(prompt).toContain("for as long as possible");
    expect(prompt).toContain("Copy exactly 1 existing principle");
    expect(prompt).toContain("Final constraint: stay specific to the requested action");
    expect(prompt).toContain("create space");
    expect(prompt).toContain("Return only the integer index of exactly 1 allowed response");
    expect(prompt).toContain("Allowed responses (select exactly one index):");
    expect(prompt).toContain("Focus technique: JAB");
    expect(prompt).toContain("Copy exactly 1 existing principle");
    expect(prompt).toContain("Do not explain another technique");
    const mistakePrompt = buildCoachPrompt({ action: "commonMistakes", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(mistakePrompt).toContain("Copy exactly 1 existing mistake");
    const focusPrompt = buildCoachPrompt({ action: "focusPoints", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(focusPrompt).toContain("Copy exactly 1 existing focus point");
    const explanationPrompt = buildCoachPrompt({ action: "explanation", focusTechnique: "JAB", exercise, techniques: [technique], knowledge, workout });
    expect(explanationPrompt).toContain("Copy exactly 1 existing sentence or documented combination entry");
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
    expect(knowledge[0].focusPoints).toContain("Keep the lead hand close to the chin.");
    const prompt = buildCoachPrompt({ action: "technicalTips", focusTechnique: "CROSS", exercise, techniques: [cross], knowledge, workout });
    expect(prompt).toContain("Focus technique: CROSS");
    expect(prompt).toContain("Drive from the rear foot");
    expect(prompt).toContain("lead hand close to the chin");
    expect(prompt).not.toContain("front-hand straight punch");
    const mistakes = buildCoachPrompt({ action: "commonMistakes", focusTechnique: "CROSS", exercise, techniques: [cross], knowledge, workout });
    expect(mistakes).toContain("Copy exactly 1 existing mistake from the validated cross sheet");
    expect(mistakes).not.toContain("four requested jab mistakes");
  });

  it("exposes the user-approved left hook fiche separately", () => {
    const leftHook = getCoachKnowledgeForTechniqueNames(["LEFT HOOK"]);
    expect(leftHook).toHaveLength(1);
    expect(leftHook[0].technique).toBe("LEFT HOOK");
    expect(leftHook[0].source.status).toBe("user-approved");
    expect(leftHook[0].principles).toContain("Keep the left elbow aligned with the fist during the strike.");
    expect(leftHook[0].commonMistakes).toContain("Do not drop the rear hand.");
    expect(leftHook[0].combinations.map((item) => item.name)).toContain("JAB–CROSS–LEFT HOOK");
  });

  it("exposes the user-approved right hook fiche separately", () => {
    const rightHook = getCoachKnowledgeForTechniqueNames(["RIGHT HOOK"]);
    expect(rightHook).toHaveLength(1);
    expect(rightHook[0].technique).toBe("RIGHT HOOK");
    expect(rightHook[0].source.status).toBe("user-approved");
    expect(rightHook[0].principles).toContain("Keep the lead hand close to the chin.");
    expect(rightHook[0].commonMistakes).toContain("Do not drop the lead hand.");
    expect(rightHook[0].combinations.map((item) => item.name)).toContain("JAB–CROSS–RIGHT HOOK");
  });

  it("exposes the user-approved left uppercut fiche", () => {
    const leftUppercut = getCoachKnowledgeForTechniqueNames(["LEFT UPPERCUT"]);
    expect(leftUppercut).toHaveLength(1);
    expect(leftUppercut[0].technique).toBe("LEFT UPPERCUT");
    expect(leftUppercut[0].source.status).toBe("user-approved");
    expect(leftUppercut[0].principles).toContain("Bend the knees slightly and drive upward from the floor.");
    expect(leftUppercut[0].commonMistakes).toContain("Do not drop the left hand before the punch.");
    expect(leftUppercut[0].combinations.map((item) => item.name)).toContain("LEFT UPPERCUT–RIGHT HOOK");
  });

  it("exposes the user-approved low jab fiche separately from jab", () => {
    const lowJab = getCoachKnowledgeForTechniqueNames(["LOW JAB"]);
    expect(lowJab).toHaveLength(1);
    expect(lowJab[0].technique).toBe("LOW JAB");
    expect(lowJab[0].source.status).toBe("user-approved");
    expect(lowJab[0].principles).toContain("Punch straight toward the lower target with the lead hand.");
    expect(lowJab[0].commonMistakes).toContain("Do not bend forward from the waist.");
    expect(lowJab[0].combinations.map((item) => item.name)).toContain("LOW JAB–LEFT HOOK");
  });

  it("exposes the user-approved low cross fiche separately from cross", () => {
    const lowCross = getCoachKnowledgeForTechniqueNames(["LOW CROSS"]);
    expect(lowCross).toHaveLength(1);
    expect(lowCross[0].technique).toBe("LOW CROSS");
    expect(lowCross[0].source.status).toBe("user-approved");
    expect(lowCross[0].principles).toContain("Punch straight toward the lower target with the rear hand.");
    expect(lowCross[0].commonMistakes).toContain("Do not bend forward from the waist.");
    expect(lowCross[0].combinations.map((item) => item.name)).toContain("LOW CROSS–LEFT HOOK");
  });

  it("exposes the user-approved left low hook fiche separately from left hook", () => {
    const lowLeftHook = getCoachKnowledgeForTechniqueNames(["LEFT LOW HOOK"]);
    expect(lowLeftHook).toHaveLength(1);
    expect(lowLeftHook[0].technique).toBe("LEFT LOW HOOK");
    expect(lowLeftHook[0].source.status).toBe("user-approved");
    expect(lowLeftHook[0].principles).toContain("Use the left low hook to attack the body or lower ribs.");
    expect(lowLeftHook[0].commonMistakes).toContain("Do not bend forward from the waist.");
    expect(lowLeftHook[0].combinations.map((item) => item.name)).toContain("LOW CROSS–LEFT LOW HOOK");
  });

  it("exposes the user-approved right low hook fiche separately from right hook", () => {
    const lowRightHook = getCoachKnowledgeForTechniqueNames(["RIGHT LOW HOOK"]);
    expect(lowRightHook).toHaveLength(1);
    expect(lowRightHook[0].technique).toBe("RIGHT LOW HOOK");
    expect(lowRightHook[0].source.status).toBe("user-approved");
    expect(lowRightHook[0].principles).toContain("Use the right low hook to attack the body or lower ribs.");
    expect(lowRightHook[0].commonMistakes).toContain("Do not drop the lead hand while punching low.");
    expect(lowRightHook[0].combinations.map((item) => item.name)).toContain("LOW CROSS–RIGHT LOW HOOK");
  });

  it("exposes the user-approved right uppercut fiche separately from cross", () => {
    const rightUppercut = getCoachKnowledgeForTechniqueNames(["RIGHT UPPERCUT"]);
    expect(rightUppercut).toHaveLength(1);
    expect(rightUppercut[0].technique).toBe("RIGHT UPPERCUT");
    expect(rightUppercut[0].source.status).toBe("user-approved");
    expect(rightUppercut[0].principles).toContain("Drive from the rear foot and rotate the rear hip and shoulder together.");
    expect(rightUppercut[0].commonMistakes).toContain("Do not drop the lead hand before the punch.");
    expect(rightUppercut[0].combinations.map((item) => item.name)).toContain("JAB–CROSS–RIGHT UPPERCUT");
  });

  it("exposes the user-approved left horizontal elbow fiche", () => {
    const leftHorizontalElbow = getCoachKnowledgeForTechniqueNames(["LEFT HORIZONTAL ELBOW"]);
    expect(leftHorizontalElbow).toHaveLength(1);
    expect(leftHorizontalElbow[0].technique).toBe("LEFT HORIZONTAL ELBOW");
    expect(leftHorizontalElbow[0].source.status).toBe("user-approved");
    expect(leftHorizontalElbow[0].principles).toContain("Use the elbow at close range.");
    expect(leftHorizontalElbow[0].commonMistakes).toContain("Do not drop the rear hand.");
    expect(leftHorizontalElbow[0].combinations.map((item) => item.name)).toContain("JAB–LEFT HORIZONTAL ELBOW");
  });

  it("exposes the user-approved right horizontal elbow fiche", () => {
    const rightHorizontalElbow = getCoachKnowledgeForTechniqueNames(["RIGHT HORIZONTAL ELBOW"]);
    expect(rightHorizontalElbow).toHaveLength(1);
    expect(rightHorizontalElbow[0].technique).toBe("RIGHT HORIZONTAL ELBOW");
    expect(rightHorizontalElbow[0].source.status).toBe("user-approved");
    expect(rightHorizontalElbow[0].principles).toContain("Drive from the rear foot and rotate the rear hip and shoulder together.");
    expect(rightHorizontalElbow[0].commonMistakes).toContain("Do not drop the lead hand.");
    expect(rightHorizontalElbow[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT HORIZONTAL ELBOW");
  });

  it("exposes the user-approved left down elbow fiche", () => {
    const leftDownElbow = getCoachKnowledgeForTechniqueNames(["LEFT DOWN ELBOW"]);
    expect(leftDownElbow).toHaveLength(1);
    expect(leftDownElbow[0].technique).toBe("LEFT DOWN ELBOW");
    expect(leftDownElbow[0].source.status).toBe("user-approved");
    expect(leftDownElbow[0].principles).toContain("Direct the elbow downward through the target.");
    expect(leftDownElbow[0].commonMistakes).toContain("Do not drop the rear hand.");
    expect(leftDownElbow[0].combinations.map((item) => item.name)).toContain("JAB–LEFT DOWN ELBOW");
  });

  it("exposes the user-approved right down elbow fiche", () => {
    const rightDownElbow = getCoachKnowledgeForTechniqueNames(["RIGHT DOWN ELBOW"]);
    expect(rightDownElbow).toHaveLength(1);
    expect(rightDownElbow[0].technique).toBe("RIGHT DOWN ELBOW");
    expect(rightDownElbow[0].source.status).toBe("user-approved");
    expect(rightDownElbow[0].principles).toContain("Drive from the rear foot and coordinate the rear hip, shoulder, and elbow.");
    expect(rightDownElbow[0].commonMistakes).toContain("Do not drop the lead hand.");
    expect(rightDownElbow[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT DOWN ELBOW");
  });

  it("exposes the user-approved left up elbow fiche", () => {
    const leftUpElbow = getCoachKnowledgeForTechniqueNames(["LEFT UP ELBOW"]);
    expect(leftUpElbow).toHaveLength(1);
    expect(leftUpElbow[0].technique).toBe("LEFT UP ELBOW");
    expect(leftUpElbow[0].source.status).toBe("user-approved");
    expect(leftUpElbow[0].principles).toContain("Drive upward through the lead foot, hip, and shoulder.");
    expect(leftUpElbow[0].commonMistakes).toContain("Do not drop the rear hand.");
    expect(leftUpElbow[0].combinations.map((item) => item.name)).toContain("JAB–LEFT UP ELBOW");
  });

  it("exposes the user-approved right up elbow fiche", () => {
    const rightUpElbow = getCoachKnowledgeForTechniqueNames(["RIGHT UP ELBOW"]);
    expect(rightUpElbow).toHaveLength(1);
    expect(rightUpElbow[0].technique).toBe("RIGHT UP ELBOW");
    expect(rightUpElbow[0].source.status).toBe("user-approved");
    expect(rightUpElbow[0].principles).toContain("Drive upward through the rear foot, hip, and shoulder.");
    expect(rightUpElbow[0].commonMistakes).toContain("Do not drop the lead hand.");
    expect(rightUpElbow[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT UP ELBOW");
  });

  it("exposes the user-approved left spinning back-fist fiche", () => {
    const leftSpinningBackFist = getCoachKnowledgeForTechniqueNames(["LEFT SPINNING BACK-FIST"]);
    expect(leftSpinningBackFist).toHaveLength(1);
    expect(leftSpinningBackFist[0].technique).toBe("LEFT SPINNING BACK-FIST");
    expect(leftSpinningBackFist[0].source.status).toBe("user-approved");
    expect(leftSpinningBackFist[0].principles).toContain("Rotate through the feet, hips, and shoulders together.");
    expect(leftSpinningBackFist[0].commonMistakes).toContain("Do not spin without controlling the distance.");
    expect(leftSpinningBackFist[0].combinations.map((item) => item.name)).toContain("JAB–LEFT SPINNING BACK-FIST");
  });

  it("exposes the user-approved right spinning back-fist fiche", () => {
    const rightSpinningBackFist = getCoachKnowledgeForTechniqueNames(["RIGHT SPINNING BACK-FIST"]);
    expect(rightSpinningBackFist).toHaveLength(1);
    expect(rightSpinningBackFist[0].technique).toBe("RIGHT SPINNING BACK-FIST");
    expect(rightSpinningBackFist[0].source.status).toBe("user-approved");
    expect(rightSpinningBackFist[0].principles).toContain("Rotate through the feet, hips, and shoulders together.");
    expect(rightSpinningBackFist[0].commonMistakes).toContain("Do not spin without controlling the distance.");
    expect(rightSpinningBackFist[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT SPINNING BACK-FIST");
  });

  it("exposes the user-approved left spinning back-elbow fiche", () => {
    const leftSpinningBackElbow = getCoachKnowledgeForTechniqueNames(["LEFT SPINNING BACK-ELBOW"]);
    expect(leftSpinningBackElbow).toHaveLength(1);
    expect(leftSpinningBackElbow[0].technique).toBe("LEFT SPINNING BACK-ELBOW");
    expect(leftSpinningBackElbow[0].source.status).toBe("user-approved");
    expect(leftSpinningBackElbow[0].principles).toContain("Rotate through the feet, hips, and shoulders together.");
    expect(leftSpinningBackElbow[0].commonMistakes).toContain("Do not spin without controlling the distance.");
    expect(leftSpinningBackElbow[0].combinations.map((item) => item.name)).toContain("JAB–LEFT SPINNING BACK-ELBOW");
  });

  it("exposes the user-approved right spinning back-elbow fiche", () => {
    const rightSpinningBackElbow = getCoachKnowledgeForTechniqueNames(["RIGHT SPINNING BACK-ELBOW"]);
    expect(rightSpinningBackElbow).toHaveLength(1);
    expect(rightSpinningBackElbow[0].technique).toBe("RIGHT SPINNING BACK-ELBOW");
    expect(rightSpinningBackElbow[0].source.status).toBe("user-approved");
    expect(rightSpinningBackElbow[0].principles).toContain("Rotate through the feet, hips, and shoulders together.");
    expect(rightSpinningBackElbow[0].commonMistakes).toContain("Do not spin without controlling the distance.");
    expect(rightSpinningBackElbow[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT SPINNING BACK-ELBOW");
  });

  it("exposes the user-approved left jump fly cross fiche", () => {
    const leftJumpFlyCross = getCoachKnowledgeForTechniqueNames(["LEFT JUMP FLY CROSS"]);
    expect(leftJumpFlyCross).toHaveLength(1);
    expect(leftJumpFlyCross[0].technique).toBe("LEFT JUMP FLY CROSS");
    expect(leftJumpFlyCross[0].source.status).toBe("user-approved");
    expect(leftJumpFlyCross[0].principles).toContain("Drive from the rear foot.");
    expect(leftJumpFlyCross[0].commonMistakes).toContain("Do not lose balance during the landing.");
    expect(leftJumpFlyCross[0].combinations.map((item) => item.name)).toContain("JAB–LEFT JUMP FLY CROSS");
  });

  it("exposes the user-approved right jump fly cross fiche", () => {
    const rightJumpFlyCross = getCoachKnowledgeForTechniqueNames(["RIGHT JUMP FLY CROSS"]);
    expect(rightJumpFlyCross).toHaveLength(1);
    expect(rightJumpFlyCross[0].technique).toBe("RIGHT JUMP FLY CROSS");
    expect(rightJumpFlyCross[0].source.status).toBe("user-approved");
    expect(rightJumpFlyCross[0].principles).toContain("Drive from the rear foot.");
    expect(rightJumpFlyCross[0].commonMistakes).toContain("Do not lose balance during the landing.");
    expect(rightJumpFlyCross[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT JUMP FLY CROSS");
  });

  it("exposes the user-approved left jump fly elbow fiche", () => {
    const leftJumpFlyElbow = getCoachKnowledgeForTechniqueNames(["LEFT JUMP FLY ELBOW"]);
    expect(leftJumpFlyElbow).toHaveLength(1);
    expect(leftJumpFlyElbow[0].technique).toBe("LEFT JUMP FLY ELBOW");
    expect(leftJumpFlyElbow[0].source.status).toBe("user-approved");
    expect(leftJumpFlyElbow[0].principles).toContain("Drive from the feet and hips.");
    expect(leftJumpFlyElbow[0].commonMistakes).toContain("Do not lose balance during the landing.");
    expect(leftJumpFlyElbow[0].combinations.map((item) => item.name)).toContain("JAB–LEFT JUMP FLY ELBOW");
  });

  it("exposes the user-approved right jump fly elbow fiche", () => {
    const rightJumpFlyElbow = getCoachKnowledgeForTechniqueNames(["RIGHT JUMP FLY ELBOW"]);
    expect(rightJumpFlyElbow).toHaveLength(1);
    expect(rightJumpFlyElbow[0].technique).toBe("RIGHT JUMP FLY ELBOW");
    expect(rightJumpFlyElbow[0].source.status).toBe("user-approved");
    expect(rightJumpFlyElbow[0].principles).toContain("Drive from the feet and hips.");
    expect(rightJumpFlyElbow[0].commonMistakes).toContain("Do not lose balance during the landing.");
    expect(rightJumpFlyElbow[0].combinations.map((item) => item.name)).toContain("JAB–RIGHT JUMP FLY ELBOW");
  });

  it("uses combination coaching when jab and cross are in the same exercise", () => {
    const cross = { ...technique, id: "technique-2", name: "CROSS", shortName: "CROSS" };
    const techniques = [technique, cross];
    const knowledge = getCoachKnowledgeForTechniqueNames(techniques.map((item) => item.name));
    const prompt = buildCoachPrompt({ action: "technicalTips", focusTechnique: "JAB + CROSS", exercise, techniques, knowledge, workout });
    expect(prompt).toContain("This is combination coaching for JAB then CROSS");
    expect(prompt).toContain("documented technique entries in sequence");
    expect(prompt).toContain("never output combination names");
    expect(prompt).toContain("Validated technique: JAB");
    expect(prompt).toContain("Validated technique: CROSS");
    const focusPrompt = buildCoachPrompt({ action: "focusPoints", focusTechnique: "JAB + CROSS", exercise, techniques, knowledge, workout });
    expect(focusPrompt).toContain("Copy exactly 1 existing focus point");
    expect(focusPrompt).toContain("without 'Focus points:'");
    expect(focusPrompt).toContain("output exactly 1 plain focus point and nothing else");
    const fallback = getFallbackCoachResponse({ action: "focusPoints", focusTechnique: "JAB + CROSS", exercise, techniques, knowledge, workout });
    expect(fallback).toContain("Stay stable and balanced.");
    expect(fallback).not.toContain("Focus point:");
    expect(fallback).not.toContain("Transition:");
  });
});
