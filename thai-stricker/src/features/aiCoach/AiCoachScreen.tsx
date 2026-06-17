import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import type { MockAvailableExercise } from "../exercises/exerciseMocks";
import type { MockWeeklyWorkoutPlan } from "../plannedWorkouts/plannedWorkoutMocks";
import type { MockWorkout, MockExercise } from "../workouts/workoutMocks";
import type { MockCoachTip } from "./coachTipsMocks";

const FALLBACK_SHORT_TIP = "Focus on clean technique, steady balance, and controlled movement.";
const SAFETY_NOTE = "For pain, injury, or health concerns, ask a qualified professional.";

type CoachPromptKey = "technique" | "mistakes" | "focus" | "explain";

type CoachExerciseContext = {
  exercise: Pick<MockExercise, "id" | "title" | "description" | "help" | "target">;
  coachTip: MockCoachTip | null;
};

type AiCoachScreenProps = {
  availableExercises: MockAvailableExercise[];
  coachTips: MockCoachTip[];
  visitKey: number;
  weeklyWorkoutPlans: MockWeeklyWorkoutPlan[];
  workouts: MockWorkout[];
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeLabel(value: string) {
  return value.trim().toLowerCase();
}

function findCoachTipForExercise(
  exercise: Pick<MockExercise, "id" | "title">,
  coachTips: MockCoachTip[],
) {
  return (
    coachTips.find((coachTip) => coachTip.exerciseId === exercise.id) ??
    coachTips.find(
      (coachTip) => normalizeLabel(coachTip.exerciseTitle) === normalizeLabel(exercise.title),
    ) ??
    null
  );
}

function buildFallbackCoachTip(exerciseTitle: string) {
  return {
    exerciseTitle,
    shortTip: FALLBACK_SHORT_TIP,
    technicalTips: ["Focus on clean technique, steady balance, and controlled movement."],
    commonMistakes: [
      "Moving too fast before the pattern feels controlled.",
      "Letting posture break while trying to add power.",
      "Forgetting to reset stance and guard between reps.",
    ],
    focusPoints: ["Balance", "Control", "Clean reset"],
    explanation:
      "Use smooth, controlled reps and keep your base organized from start to finish. Consistency matters more than speed here.",
  };
}

function getPromptResponse(
  promptKey: CoachPromptKey,
  exerciseContext: CoachExerciseContext | null,
) {
  if (!exerciseContext) {
    return {
      title: "No exercise selected",
      lines: [FALLBACK_SHORT_TIP],
    };
  }

  const fallbackTip = buildFallbackCoachTip(exerciseContext.exercise.title);
  const resolvedTip = exerciseContext.coachTip ?? fallbackTip;

  switch (promptKey) {
    case "technique":
      return {
        title: `Technique tips for ${exerciseContext.exercise.title}`,
        lines: resolvedTip.technicalTips,
      };
    case "mistakes":
      return {
        title: `Common mistakes for ${exerciseContext.exercise.title}`,
        lines: resolvedTip.commonMistakes,
      };
    case "focus":
      return {
        title: `Focus points for ${exerciseContext.exercise.title}`,
        lines: resolvedTip.focusPoints,
      };
    case "explain":
      return {
        title: `About ${exerciseContext.exercise.title}`,
        lines: [resolvedTip.explanation],
      };
  }
}

export function AiCoachScreen({
  availableExercises,
  coachTips,
  visitKey,
  weeklyWorkoutPlans,
  workouts,
}: AiCoachScreenProps) {
  const context = useMemo(() => {
    const todayDate = formatLocalDate(new Date());
    const todayPlannedDay = weeklyWorkoutPlans
      .flatMap((plan) => plan.plannedDays)
      .find((plannedDay) => plannedDay.dayDate === todayDate);
    const todayWorkout = todayPlannedDay
      ? workouts.find((workout) => workout.id === todayPlannedDay.workoutId) ?? null
      : null;

    if (todayWorkout) {
      return {
        source: "planned" as const,
        title: todayWorkout.title,
        message: `Today's workout: ${todayWorkout.title}`,
        exercises: todayWorkout.exercises.map((exercise) => ({
          exercise,
          coachTip: findCoachTipForExercise(exercise, coachTips),
        })),
      };
    }

    const randomExercise =
      availableExercises.length > 0
        ? availableExercises[Math.floor(Math.random() * availableExercises.length)]
        : null;

    return {
      source: "random" as const,
      title: randomExercise?.title ?? "Random exercise focus",
      message: "No workout planned today. Here is a random exercise focus.",
      exercises: randomExercise
        ? [
            {
              exercise: randomExercise,
              coachTip: findCoachTipForExercise(randomExercise, coachTips),
            },
          ]
        : [],
    };
  }, [availableExercises, coachTips, visitKey, weeklyWorkoutPlans, workouts]);

  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState<CoachPromptKey>("technique");

  useEffect(() => {
    setSelectedExerciseIndex(0);
    setSelectedPrompt("technique");
  }, [visitKey]);

  const selectedExercise = context.exercises[selectedExerciseIndex] ?? null;
  const selectedShortTip = selectedExercise?.coachTip?.shortTip ?? FALLBACK_SHORT_TIP;
  const promptResponse = getPromptResponse(selectedPrompt, selectedExercise);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Coach</Text>
          <Text style={styles.subtitle}>Technique tips for today.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.contextLabel}>Today&apos;s coaching context</Text>
          <Text style={styles.contextMessage}>{context.message}</Text>
          <Text style={styles.contextHint}>
            AI Coach is local and rule-based. Responses come from mocked coach-tip data only.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Exercise focus</Text>
            <Text style={styles.sectionMeta}>
              {context.source === "planned" ? `${context.exercises.length} exercises` : "Random fallback"}
            </Text>
          </View>

          {context.exercises.length > 0 ? (
            <View style={styles.exerciseList}>
              {context.exercises.map((exerciseContext, index) => {
                const isSelected = index === selectedExerciseIndex;
                const shortTip = exerciseContext.coachTip?.shortTip ?? FALLBACK_SHORT_TIP;

                return (
                  <Pressable
                    key={`${exerciseContext.exercise.id}-${index}`}
                    onPress={() => setSelectedExerciseIndex(index)}
                    style={[styles.exerciseCard, isSelected ? styles.exerciseCardSelected : undefined]}
                  >
                    <Text
                      style={[
                        styles.exerciseTitle,
                        isSelected ? styles.exerciseTitleSelected : undefined,
                      ]}
                    >
                      {exerciseContext.exercise.title}
                    </Text>
                    <Text
                      style={[
                        styles.exerciseTip,
                        isSelected ? styles.exerciseTipSelected : undefined,
                      ]}
                    >
                      {shortTip}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Text style={styles.emptyState}>{FALLBACK_SHORT_TIP}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Guided coach prompts</Text>
          <View style={styles.promptRow}>
            {(
              [
                ["technique", "Technique tips"],
                ["mistakes", "Common mistakes"],
                ["focus", "Focus points"],
                ["explain", "Explain exercise"],
              ] as const
            ).map(([promptKey, label]) => {
              const isSelected = selectedPrompt === promptKey;

              return (
                <Pressable
                  key={promptKey}
                  onPress={() => setSelectedPrompt(promptKey)}
                  style={[styles.promptButton, isSelected ? styles.promptButtonActive : undefined]}
                >
                  <Text
                    style={[
                      styles.promptButtonText,
                      isSelected ? styles.promptButtonTextActive : undefined,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.responseCard}>
            <Text style={styles.responseTitle}>{promptResponse.title}</Text>
            {promptResponse.lines.map((line) => (
              <Text key={line} style={styles.responseLine}>
                • {line}
              </Text>
            ))}
          </View>

          <View style={styles.selectedSummary}>
            <Text style={styles.selectedSummaryLabel}>Current quick tip</Text>
            <Text style={styles.selectedSummaryText}>{selectedShortTip}</Text>
          </View>
        </View>

        <View style={styles.safetyCard}>
          <Text style={styles.safetyTitle}>Safety boundary</Text>
          <Text style={styles.safetyText}>
            AI Coach does not replace a real coach, doctor, or physiotherapist.
          </Text>
          <Text style={styles.safetyText}>{SAFETY_NOTE}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    gap: 6,
    paddingTop: 8,
  },
  title: {
    color: "#231f1a",
    fontSize: 32,
    fontWeight: "800",
  },
  subtitle: {
    color: "#5f5446",
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fffaf3",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  contextLabel: {
    color: "#8b7355",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  contextMessage: {
    color: "#231f1a",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  contextHint: {
    color: "#6b5f51",
    fontSize: 14,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    color: "#231f1a",
    fontSize: 20,
    fontWeight: "700",
  },
  sectionMeta: {
    color: "#8b7355",
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: "#f8efe2",
    borderRadius: 16,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: "#eddcc5",
  },
  exerciseCardSelected: {
    backgroundColor: "#bf5b22",
    borderColor: "#bf5b22",
  },
  exerciseTitle: {
    color: "#231f1a",
    fontSize: 16,
    fontWeight: "700",
  },
  exerciseTitleSelected: {
    color: "#fffaf3",
  },
  exerciseTip: {
    color: "#5f5446",
    fontSize: 14,
    lineHeight: 20,
  },
  exerciseTipSelected: {
    color: "#fff1e6",
  },
  emptyState: {
    color: "#5f5446",
    fontSize: 15,
    lineHeight: 21,
  },
  promptRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  promptButton: {
    backgroundColor: "#f8efe2",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#eadfce",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  promptButtonActive: {
    backgroundColor: "#bf5b22",
    borderColor: "#bf5b22",
  },
  promptButtonText: {
    color: "#7c4f1f",
    fontSize: 14,
    fontWeight: "700",
  },
  promptButtonTextActive: {
    color: "#fffaf3",
  },
  responseCard: {
    backgroundColor: "#f8f3ea",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  responseTitle: {
    color: "#231f1a",
    fontSize: 16,
    fontWeight: "700",
  },
  responseLine: {
    color: "#5f5446",
    fontSize: 14,
    lineHeight: 20,
  },
  selectedSummary: {
    gap: 4,
  },
  selectedSummaryLabel: {
    color: "#8b7355",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  selectedSummaryText: {
    color: "#231f1a",
    fontSize: 15,
    lineHeight: 21,
  },
  safetyCard: {
    backgroundColor: "#1f3c36",
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  safetyTitle: {
    color: "#eef7f1",
    fontSize: 18,
    fontWeight: "700",
  },
  safetyText: {
    color: "#dce9e2",
    fontSize: 14,
    lineHeight: 20,
  },
});
