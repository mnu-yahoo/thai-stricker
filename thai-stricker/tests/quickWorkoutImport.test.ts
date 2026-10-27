import { describe, expect, it } from "vitest";
import { buildQuickWorkoutImportPlan } from "../src/application/useCases/quickWorkoutImportUseCases";
import type { AppDataSnapshot } from "../src/types/domain";

const data: AppDataSnapshot = {
  settings: { restSecondsBetweenExercises: 30, trainingDaysPerWeek: 3, numberOfExercisesPerPage: 6, defaultRepsExerciseDurationMinutes: 3, themePreference: "Dark" },
  techniques: [
    { id: "jab", name: "JAB", shortName: "JAB", description: "Lead hand straight", category: "Muay Thai techniques", subCategory: "Punches" },
    { id: "cross", name: "CROSS", shortName: "CROSS", description: "Rear hand straight", category: "Muay Thai techniques", subCategory: "Punches" },
    { id: "hook", name: "LEFT HOOK", shortName: "LHOOK", description: "Left hook", category: "Muay Thai techniques", subCategory: "Punches" },
  ],
  exercises: [{ id: "punches", title: "Punches #1", description: "JAB, CROSS", help: "", category: "Striking", detail: { type: "reps", reps: 15 }, techniqueIds: ["jab", "cross"] }],
  workouts: [], weeklyWorkoutPlans: [], workoutLogs: [], coachTips: [], calendarWorkoutDays: [], monthlySummary: { completedWorkouts: 0, plannedWorkouts: 0, missedWorkouts: 0 },
};

describe("quick workout TXT import", () => {
  it("matches existing exercises and creates missing combinations in order", () => {
    const plan = buildQuickWorkoutImportPlan("Workout 001\nJAB, CROSS\nLHOOK, JAB", data);
    expect(plan.workout.title).toBe("Workout 001");
    expect(plan.matchedExerciseCount).toBe(1);
    expect(plan.createdExerciseCount).toBe(1);
    expect(plan.newExercises[0].techniqueIds).toEqual(["hook", "jab"]);
    expect(plan.workout.exercises.map((item) => item.exerciseId)).toEqual(["punches", plan.newExercises[0].id]);
  });

  it("rejects unknown techniques before creating anything", () => {
    expect(() => buildQuickWorkoutImportPlan("Workout 001\nJAB, UNKNOWN", data)).toThrow("Unknown technique");
  });
});
