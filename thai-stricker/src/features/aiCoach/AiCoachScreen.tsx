import { useEffect, useMemo, useState } from "react";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
import type { AppTheme } from "../../styles/theme";
import type { MockAvailableExercise } from "../exercises/exerciseMocks";
import type { MockWeeklyWorkoutPlan } from "../plannedWorkouts/plannedWorkoutMocks";
import type { MockExercise, MockWorkout } from "../workouts/workoutMocks";
import type { MockCoachTip } from "./coachTipsMocks";

const FALLBACK_SHORT_TIP = "Focus on clean technique, steady balance, and controlled movement.";
const SAFETY_NOTE = "Kru AI can make mistakes. Verify important technique with a physical coach.";
const LIGHT_COACH_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

type CoachPromptKey = "technique" | "mistakes" | "focus" | "explain";

type CoachExerciseContext = {
  exercise: Pick<MockExercise, "id" | "title" | "description" | "help" | "target">;
  coachTip: MockCoachTip | null;
};

type CoachMessage = {
  id: string;
  role: "coach" | "user";
  text: string;
  timestamp: string;
};

type AiCoachScreenProps = {
  theme: AppTheme;
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

function buildCoachReply(promptKey: CoachPromptKey, exerciseContext: CoachExerciseContext | null) {
  const response = getPromptResponse(promptKey, exerciseContext);
  return response.lines.join(" ");
}

export function AiCoachScreen({
  theme,
  availableExercises,
  coachTips,
  visitKey,
  weeklyWorkoutPlans,
  workouts,
}: AiCoachScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
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
  const [draftMessage, setDraftMessage] = useState("");

  useEffect(() => {
    setSelectedExerciseIndex(0);
    setSelectedPrompt("technique");
    setDraftMessage("");
  }, [visitKey]);

  const selectedExercise = context.exercises[selectedExerciseIndex] ?? null;
  const promptResponse = getPromptResponse(selectedPrompt, selectedExercise);
  const selectedShortTip = selectedExercise?.coachTip?.shortTip ?? FALLBACK_SHORT_TIP;
  const coachIntroMessage = selectedExercise
    ? `Sawatdee krap! Ready to sharpen your technique today? I've reviewed your last heavy bag session—your ${
        selectedExercise.exercise.title.toLowerCase()
      } is improving, but we should keep refining your balance and hip rotation.`
    : "Sawatdee krap! Ready to sharpen your technique today?";
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: "coach-welcome",
      role: "coach",
      text: coachIntroMessage,
      timestamp: "09:12 AM",
    },
    {
      id: "user-followup",
      role: "user",
      text: `Thanks Kru. I feel like my balance is off when I reset after the hook. Any drill I should focus on?`,
      timestamp: "09:14 AM",
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        id: "coach-welcome",
        role: "coach",
        text: coachIntroMessage,
        timestamp: "09:12 AM",
      },
      {
        id: "user-followup",
        role: "user",
        text: `Thanks Kru. I feel like my balance is off when I reset after the hook. Any drill I should focus on?`,
        timestamp: "09:14 AM",
      },
    ]);
  }, [coachIntroMessage, visitKey]);

  const sendPromptMessage = (promptKey: CoachPromptKey) => {
    setSelectedPrompt(promptKey);
    const labels: Record<CoachPromptKey, string> = {
      technique: "Analyze my roundhouse kick",
      mistakes: "Show common mistakes",
      focus: "Suggest a drill for balance",
      explain: "Explain today's focus",
    };

    const nextReply = buildCoachReply(promptKey, selectedExercise);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-${promptKey}-${currentMessages.length}`,
        role: "user",
        text: labels[promptKey],
        timestamp: "09:15 AM",
      },
      {
        id: `coach-${promptKey}-${currentMessages.length}`,
        role: "coach",
        text: nextReply,
        timestamp: "09:16 AM",
      },
    ]);
  };

  const handleSendDraft = () => {
    const trimmedDraft = draftMessage.trim();

    if (trimmedDraft.length === 0) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `user-draft-${currentMessages.length}`,
        role: "user",
        text: trimmedDraft,
        timestamp: "09:18 AM",
      },
      {
        id: `coach-draft-${currentMessages.length}`,
        role: "coach",
        text: `${selectedShortTip} ${buildCoachReply(selectedPrompt, selectedExercise)}`,
        timestamp: "09:19 AM",
      },
    ]);
    setDraftMessage("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <>
            <View style={styles.darkTopBar}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <GoogleMaterialSymbol
                    color={theme.colors.primary}
                    fallbackName="account-circle"
                    name="account_circle"
                    size={28}
                  />
                </View>
                <Text style={styles.darkHubTitle}>Training Hub</Text>
              </View>
              <View style={styles.topActions}>
                <Pressable style={styles.iconButton}>
                  <GoogleMaterialSymbol
                    color={theme.colors.textPrimary}
                    fallbackName="search"
                    name="search"
                    size={22}
                  />
                </Pressable>
                <Pressable style={styles.iconButton}>
                  <GoogleMaterialSymbol
                    color={theme.colors.textPrimary}
                    fallbackName="notifications-none"
                    name="notifications"
                    size={22}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.header}>
              <Text style={styles.eyebrow}>Private coaching app</Text>
              <Text style={styles.title}>AI COACH</Text>
              <Text style={styles.subtitle}>Technique guidance for today&apos;s focus.</Text>
            </View>

            <View style={styles.contextCard}>
              <View style={styles.contextHeader}>
                <View style={styles.contextTagRow}>
                  <Text style={styles.contextLabel}>Today&apos;s coaching context</Text>
                </View>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="psychology"
                  name="psychology"
                  size={18}
                />
              </View>
              <Text style={styles.contextMessage}>{context.message}</Text>
              <Text style={styles.contextHint}>
                AI Coach is local and rule-based. Responses come from locally stored coach-tip data.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.cardTitle}>Exercise focus</Text>
                <Text style={styles.sectionMeta}>
                  {context.source === "planned"
                    ? `${context.exercises.length} drills`
                    : "Random fallback"}
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
                        style={[
                          styles.exerciseCard,
                          isSelected ? styles.exerciseCardSelected : undefined,
                        ]}
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
                      style={[
                        styles.promptButton,
                        isSelected ? styles.promptButtonActive : undefined,
                      ]}
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
          </>
        ) : (
          <>
            <View style={styles.lightTopBar}>
              <Pressable style={styles.lightIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="menu"
                  name="menu"
                  size={28}
                />
              </Pressable>
              <Text style={styles.lightTopTitle}>AI COACH</Text>
              <Pressable style={styles.lightIconButton}>
                <GoogleMaterialSymbol
                  color="#24344D"
                  fallbackName="notifications-none"
                  name="notifications"
                  size={24}
                />
              </Pressable>
            </View>

            <View style={styles.lightHeroSection}>
              <View style={styles.lightAvatarFrame}>
                <ImageBackground
                  imageStyle={styles.lightAvatarImage}
                  source={{ uri: LIGHT_COACH_IMAGE_URI }}
                  style={styles.lightAvatar}
                />
                <View style={styles.lightAvatarOnlineDot} />
              </View>
              <Text style={styles.lightHeroTitle}>Meet Kru AI</Text>
              <Text style={styles.lightHeroSubtitle}>
                Your expert partner for technique, strategy, and motivation in the art of eight
                limbs.
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.lightQuickPrompts}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Pressable
                onPress={() => sendPromptMessage("technique")}
                style={styles.lightQuickPromptChip}
              >
                <Text style={styles.lightQuickPromptText}>Analyze my roundhouse kick</Text>
              </Pressable>
              <Pressable
                onPress={() => sendPromptMessage("focus")}
                style={styles.lightQuickPromptChip}
              >
                <Text style={styles.lightQuickPromptText}>Suggest a drill for balance</Text>
              </Pressable>
              <Pressable
                onPress={() => sendPromptMessage("mistakes")}
                style={styles.lightQuickPromptChip}
              >
                <Text style={styles.lightQuickPromptText}>Show common mistakes</Text>
              </Pressable>
            </ScrollView>

            <View style={styles.lightChatThread}>
              {messages.map((message) =>
                message.role === "coach" ? (
                  <View key={message.id} style={styles.lightMessageBlockLeft}>
                    <Text style={styles.lightMessageMeta}>KRU AI • {message.timestamp}</Text>
                    <View style={styles.lightCoachBubble}>
                      <Text style={styles.lightCoachBubbleText}>{message.text}</Text>
                    </View>
                  </View>
                ) : (
                  <View key={message.id} style={styles.lightMessageBlockRight}>
                    <Text style={styles.lightMessageMetaRight}>YOU • {message.timestamp}</Text>
                    <View style={styles.lightUserBubble}>
                      <Text style={styles.lightUserBubbleText}>{message.text}</Text>
                    </View>
                  </View>
                ),
              )}
            </View>

            <View style={styles.lightComposerWrap}>
              <View style={styles.lightComposerRow}>
                <View style={styles.lightInputShell}>
                  <TextInput
                    onChangeText={setDraftMessage}
                    placeholder="Ask about technique, drills, or strategy"
                    placeholderTextColor="#8A93A1"
                    style={styles.lightInput}
                    value={draftMessage}
                  />
                  <Pressable onPress={() => setDraftMessage("")} style={styles.lightClearButton}>
                    <GoogleMaterialSymbol
                      color="#B0B7C5"
                      fallbackName="cancel"
                      name="cancel"
                      size={22}
                    />
                  </Pressable>
                </View>

                <Pressable onPress={handleSendDraft} style={styles.lightSendButton}>
                  <GoogleMaterialSymbol
                    color="#FFFFFF"
                    fallbackName="send"
                    name="send"
                    size={24}
                  />
                </Pressable>
              </View>

              <Text style={styles.lightSafetyText}>{SAFETY_NOTE}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? theme.colors.appBackground : "#F7F3F0",
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 24,
      gap: 16,
    },
    darkTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
      marginBottom: 8,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    brandBadge: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    darkHubTitle: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    topActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      gap: 6,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: -0.8,
      textTransform: "uppercase",
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    contextCard: {
      backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : theme.colors.card,
      borderRadius: 18,
      padding: 18,
      gap: 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? theme.colors.primary : theme.colors.border,
      elevation: isDarkTheme ? 2 : 0,
      overflow: "hidden",
    },
    contextHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    contextTagRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    contextLabel: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    contextMessage: {
      color: theme.colors.textPrimary,
      fontSize: isDarkTheme ? 26 : 20,
      fontWeight: "700",
      lineHeight: isDarkTheme ? 36 : 28,
      fontStyle: isDarkTheme ? "italic" : "normal",
    },
    contextHint: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    card: {
      backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : theme.colors.card,
      borderRadius: 18,
      padding: 18,
      gap: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: isDarkTheme ? 2 : 0,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    sectionMeta: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    exerciseList: {
      gap: 10,
    },
    exerciseCard: {
      backgroundColor: isDarkTheme ? "#1A191C" : theme.colors.surfaceMuted,
      borderRadius: 12,
      padding: 14,
      gap: 6,
      borderWidth: 1,
      borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.03)" : theme.colors.border,
    },
    exerciseCardSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: isDarkTheme ? "#102226" : theme.colors.primary,
    },
    exerciseTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "800",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    exerciseTitleSelected: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.primaryText,
    },
    exerciseTip: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    exerciseTipSelected: {
      color: isDarkTheme ? theme.colors.textPrimary : theme.colors.primaryText,
    },
    emptyState: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
    },
    promptRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    promptButton: {
      backgroundColor: isDarkTheme ? "#1A191C" : theme.colors.surfaceMuted,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#3F4D52" : theme.colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    promptButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    promptButtonText: {
      color: isDarkTheme ? theme.colors.textPrimary : theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
      letterSpacing: isDarkTheme ? 0.6 : 0,
    },
    promptButtonTextActive: {
      color: theme.colors.primaryText,
    },
    responseCard: {
      backgroundColor: isDarkTheme ? "#1A191C" : theme.colors.surfaceMuted,
      borderRadius: 12,
      padding: 14,
      gap: 8,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.03)" : "transparent",
    },
    responseTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    responseLine: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    selectedSummary: {
      gap: 4,
    },
    selectedSummaryLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    selectedSummaryText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 21,
    },
    safetyCard: {
      backgroundColor: isDarkTheme ? "#1A191C" : theme.colors.cardElevated,
      borderRadius: 18,
      padding: 18,
      gap: 8,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#3F4D52" : theme.colors.border,
    },
    safetyTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    safetyText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
      marginBottom: 4,
    },
    lightIconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopTitle: {
      color: "#1560C8",
      fontSize: 24,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    lightHeroSection: {
      alignItems: "center",
      gap: 14,
      paddingTop: 14,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
    },
    lightAvatarFrame: {
      width: 148,
      height: 148,
      borderRadius: 22,
      borderWidth: 3,
      borderColor: "#1560C8",
      padding: 8,
      backgroundColor: "#FFFFFF",
      position: "relative",
    },
    lightAvatar: {
      flex: 1,
      borderRadius: 18,
      overflow: "hidden",
      backgroundColor: "#0E1725",
    },
    lightAvatarImage: {
      borderRadius: 18,
    },
    lightAvatarOnlineDot: {
      position: "absolute",
      right: 2,
      bottom: 2,
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#28C65A",
      borderWidth: 3,
      borderColor: "#FFFFFF",
    },
    lightHeroTitle: {
      color: "#151515",
      fontSize: 32,
      fontWeight: "800",
      textAlign: "center",
    },
    lightHeroSubtitle: {
      maxWidth: 540,
      color: "#33435D",
      fontSize: 17,
      lineHeight: 24,
      textAlign: "center",
    },
    lightQuickPrompts: {
      gap: 14,
      paddingTop: 8,
      paddingBottom: 2,
    },
    lightQuickPromptChip: {
      minHeight: 56,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#F7F3F0",
      paddingHorizontal: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    lightQuickPromptText: {
      color: "#151515",
      fontSize: 16,
      fontWeight: "500",
    },
    lightChatThread: {
      gap: 18,
      paddingTop: 6,
    },
    lightMessageBlockLeft: {
      alignItems: "flex-start",
      gap: 8,
    },
    lightMessageBlockRight: {
      alignItems: "flex-end",
      gap: 8,
    },
    lightMessageMeta: {
      color: "#6E7788",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    lightMessageMetaRight: {
      color: "#6E7788",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    lightCoachBubble: {
      maxWidth: "84%",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#EDEAE8",
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    lightCoachBubbleText: {
      color: "#151515",
      fontSize: 18,
      lineHeight: 28,
    },
    lightUserBubble: {
      maxWidth: "84%",
      borderRadius: 18,
      backgroundColor: "#2A73E2",
      paddingHorizontal: 18,
      paddingVertical: 16,
    },
    lightUserBubbleText: {
      color: "#FFFFFF",
      fontSize: 18,
      lineHeight: 28,
    },
    lightComposerWrap: {
      gap: 14,
      paddingTop: 10,
      paddingBottom: 6,
      borderTopWidth: 1,
      borderTopColor: "#CFD8EA",
    },
    lightComposerRow: {
      flexDirection: "row",
      gap: 14,
      alignItems: "center",
    },
    lightInputShell: {
      flex: 1,
      minHeight: 88,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 18,
      paddingRight: 10,
      gap: 8,
    },
    lightInput: {
      flex: 1,
      color: "#151515",
      fontSize: 17,
      paddingVertical: 0,
    },
    lightClearButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    lightSendButton: {
      width: 88,
      height: 88,
      borderRadius: 16,
      backgroundColor: "#2A73E2",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#2A73E2",
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    lightSafetyText: {
      color: "#6E7788",
      fontSize: 12,
      lineHeight: 20,
      letterSpacing: 1.5,
    },
  });
}
