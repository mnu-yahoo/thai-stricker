import type { AppDataSnapshot, Exercise, Technique, Workout } from "../../types/domain";

const MATCH_THRESHOLD = 0.9;

export type QuickWorkoutImportPlan = {
  workout: Workout;
  newExercises: Exercise[];
  matchedExerciseCount: number;
  createdExerciseCount: number;
};

const normalizeToken = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleUpperCase("en");
const normalizeSequence = (value: string) => value.split(",").map(normalizeToken).join(", ");

function similarity(left: string, right: string) {
  const a = normalizeSequence(left);
  const b = normalizeSequence(right);
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;
  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let row = 1; row <= a.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= b.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
    for (let column = 0; column <= b.length; column += 1) previous[column] = current[column];
  }
  return 1 - previous[b.length] / Math.max(a.length, b.length);
}

function makeId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
}

function resolveTechnique(token: string, techniques: Technique[]) {
  const normalized = normalizeToken(token);
  const matches = techniques.filter((technique) => [technique.name, technique.shortName].some((value) => normalizeToken(value) === normalized));
  if (!matches.length) throw new Error(`Unknown technique “${token.trim()}”.`);
  if (matches.length > 1) throw new Error(`Ambiguous technique “${token.trim()}”.`);
  return matches[0];
}

function findMatchingExercise(input: string, data: AppDataSnapshot) {
  const techniques = new Map(data.techniques.map((technique) => [technique.id, technique]));
  let best: { exercise: Exercise; score: number } | undefined;
  for (const exercise of data.exercises) {
    const exerciseShortNames = exercise.techniqueIds.map((id) => techniques.get(id)?.shortName ?? "").join(", ");
    const score = Math.max(similarity(input, exercise.description), similarity(input, exerciseShortNames));
    if (score >= MATCH_THRESHOLD && (!best || score > best.score)) best = { exercise, score };
  }
  return best?.exercise;
}

export function buildQuickWorkoutImportPlan(text: string, data: AppDataSnapshot): QuickWorkoutImportPlan {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("The TXT file must contain a workout name and at least one exercise.");
  const title = lines[0];
  const newExercises: Exercise[] = [];
  const workoutExercises: Workout["exercises"] = [];
  let matchedExerciseCount = 0;

  for (const line of lines.slice(1)) {
    const tokens = line.split(",").map((token) => token.trim()).filter(Boolean);
    if (!tokens.length) continue;
    const techniques = tokens.map((token) => resolveTechnique(token, data.techniques));
    const techniqueIds = techniques.map((technique) => technique.id);
    let exercise = findMatchingExercise(line, data);
    if (!exercise) {
      exercise = newExercises.find((candidate) => candidate.techniqueIds.join(",") === techniqueIds.join(","));
    }
    if (!exercise) {
      exercise = {
        id: makeId("exercise"),
        title: normalizeSequence(line),
        description: techniques.map((technique) => technique.name).join(", "),
        help: "Imported from a quick workout file.",
        category: "Imported",
        detail: { type: "reps", reps: 15 },
        techniqueIds: [...techniqueIds],
      };
      newExercises.push(exercise);
    } else {
      matchedExerciseCount += 1;
    }
    workoutExercises.push({ exerciseId: exercise.id, detail: { ...exercise.detail } });
  }

  if (!workoutExercises.length) throw new Error("The TXT file contains no exercises.");
  const workout: Workout = {
    id: makeId("workout"),
    title,
    description: "Imported from a quick workout file.",
    difficulty: "Beginner",
    category: "Fundamentals",
    totalDurationMinutes: 0,
    restSecondsBetweenExercises: data.settings.restSecondsBetweenExercises,
    exercises: workoutExercises,
  };
  return { workout, newExercises, matchedExerciseCount, createdExerciseCount: newExercises.length };
}

export async function importQuickWorkout(repository: {
  loadAppData(): Promise<AppDataSnapshot>;
  importQuickWorkout(workout: Workout, newExercises: Exercise[]): Promise<void>;
}, text: string) {
  const plan = buildQuickWorkoutImportPlan(text, await repository.loadAppData());
  await repository.importQuickWorkout(plan.workout, plan.newExercises);
  return plan;
}
