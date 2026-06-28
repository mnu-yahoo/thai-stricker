import { useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNavbar } from "../../components/navigation/BottomNavbar";
import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
import type { AppTheme } from "../../styles/theme";
import type { MockWorkout } from "../workouts/workoutMocks";

type WorkoutFlowStep = "exercise" | "rest" | "prestart";
const PRESTART_SECONDS = 10;

type StartWorkoutScreenProps = {
  theme: AppTheme;
  workout: MockWorkout;
  currentExerciseIndex: number;
  currentStep: WorkoutFlowStep;
  hasStarted: boolean;
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  onCancelWorkout: () => void;
  onStartWorkout: () => void;
  onFinishExercise: () => void;
  onSkipExercise: () => void;
  onFinishRest: () => void;
  onFinishPrestart: () => void;
};

function formatTarget(target: MockWorkout["exercises"][number]["target"]) {
  if (target.type === "duration") {
    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

function formatTimerValue(seconds: number) {
  const minutesPart = `${Math.floor(seconds / 60)}`.padStart(2, "0");
  const secondsPart = `${seconds % 60}`.padStart(2, "0");

  return `${minutesPart}:${secondsPart}`;
}

export function StartWorkoutScreen({
  theme,
  workout,
  currentExerciseIndex,
  currentStep,
  hasStarted,
  restSecondsBetweenExercises,
  onCancelWorkout,
  onStartWorkout,
  onFinishExercise,
  onSkipExercise,
  onFinishRest,
  onFinishPrestart,
}: StartWorkoutScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
  const disabledActionColor = "#A7B0B4";
  const exercise = workout.exercises[currentExerciseIndex];
  const nextExercise = workout.exercises[currentExerciseIndex + 1];
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    if (!hasStarted && currentStep === "exercise" && exercise.target.type === "duration") {
      setRemainingSeconds(exercise.target.seconds);
      return;
    }

    if (currentStep === "exercise" && exercise.target.type === "duration") {
      setRemainingSeconds(exercise.target.seconds);
      return;
    }

    if (currentStep === "rest") {
      setRemainingSeconds(restSecondsBetweenExercises);
      return;
    }

    if (currentStep === "prestart") {
      setRemainingSeconds(PRESTART_SECONDS);
      return;
    }

    setRemainingSeconds(null);
  }, [currentStep, currentExerciseIndex, exercise.target, hasStarted, restSecondsBetweenExercises]);

  useEffect(() => {
    if (!hasStarted || remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null) {
          return current;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, remainingSeconds]);

  useEffect(() => {
    if (
      hasStarted &&
      currentStep === "exercise" &&
      exercise.target.type === "duration" &&
      remainingSeconds === 0
    ) {
      onFinishExercise();
    }
  }, [currentStep, exercise.target, hasStarted, remainingSeconds, onFinishExercise]);

  useEffect(() => {
    if (hasStarted && currentStep === "rest" && remainingSeconds === 0) {
      onFinishRest();
    }
  }, [currentStep, hasStarted, remainingSeconds, onFinishRest]);

  useEffect(() => {
    if (hasStarted && currentStep === "prestart" && remainingSeconds === 0) {
      onFinishPrestart();
    }
  }, [currentStep, hasStarted, remainingSeconds, onFinishPrestart]);

  const isRestStep = currentStep === "rest";
  const isPrestartStep = currentStep === "prestart";
  const heartbeatValue = 142;
  const phaseLabel = isRestStep ? "Recovery window" : isPrestartStep ? "Pre-start" : "Active";
  const headline = isRestStep ? "Rest" : isPrestartStep ? "Get ready" : exercise.title;
  const summary = isRestStep
    ? `Next: ${nextExercise?.title ?? "Workout complete"}`
    : isPrestartStep
      ? `Up next: ${exercise.title}`
      : exercise.description;
  const detailLine = isRestStep
    ? "Catch your breath and get ready."
    : isPrestartStep
      ? exercise.description || "Set your stance and prepare to launch the next round."
      : exercise.help;
  const counterLabel = isRestStep
    ? "Rest remaining"
    : isPrestartStep
      ? "Starting in"
      : exercise.target.type === "duration"
        ? "Time remaining"
        : "Target";
  const counterValue = isRestStep || isPrestartStep
    ? formatTimerValue(remainingSeconds ?? 0)
    : exercise.target.type === "duration"
      ? formatTimerValue(remainingSeconds ?? 0)
      : formatTarget(exercise.target).toUpperCase();
  const primaryActionLabel = "Done";
  const primaryAction = isRestStep
    ? onFinishRest
    : isPrestartStep
      ? onFinishPrestart
      : onFinishExercise;
  const showStartState = currentStep === "exercise" && !hasStarted;
  const secondaryActionLabel = showStartState
    ? "Start Workout"
    : isRestStep || isPrestartStep
      ? "Next"
      : "Skip";
  const secondaryAction = showStartState
    ? onStartWorkout
    : isRestStep
      ? onFinishRest
      : isPrestartStep
        ? onFinishPrestart
      : onSkipExercise;
  const activeOverviewIndex = isRestStep
    ? Math.min(currentExerciseIndex + 1, workout.exercises.length - 1)
    : currentExerciseIndex;
  const progressValue = (currentExerciseIndex + 1) / Math.max(workout.exercises.length, 1);
  const timerProgress = useMemo(() => {
    if (isRestStep) {
      return Math.max(0.08, (remainingSeconds ?? restSecondsBetweenExercises) / restSecondsBetweenExercises);
    }

    if (isPrestartStep) {
      return Math.max(0.08, (remainingSeconds ?? PRESTART_SECONDS) / PRESTART_SECONDS);
    }

    if (exercise.target.type === "duration") {
      return Math.max(0.08, (remainingSeconds ?? exercise.target.seconds) / exercise.target.seconds);
    }

    return 0.75;
  }, [exercise.target, isPrestartStep, isRestStep, remainingSeconds, restSecondsBetweenExercises]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <>
            <View style={styles.sessionBody}>
              <View style={styles.topBar}>
                <View style={styles.sessionBrandRow}>
                  <Pressable onPress={onCancelWorkout} style={styles.closeIconWrap}>
                    <GoogleMaterialSymbol
                      color="#F06C6C"
                      fallbackName="close"
                      name="close"
                      size={26}
                    />
                  </Pressable>
                  <Text numberOfLines={1} style={styles.sessionTitle}>
                    {workout.title.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.heartbeatBlock}>
                  <Text style={styles.heartbeatLabel}>Session heartbeat</Text>
                  <View style={styles.heartbeatValueRow}>
                    <GoogleMaterialSymbol
                      color={theme.colors.primary}
                      fallbackName="favorite-border"
                      name="favorite"
                      size={18}
                    />
                    <Text style={styles.heartbeatValue}>{heartbeatValue} BPM</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressChip}>
                <View style={styles.progressDot} />
                <Text style={styles.progressChipText}>
                  Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
                </Text>
              </View>

              <View style={styles.titleBlock}>
                <Text style={styles.phaseLabel}>{phaseLabel}</Text>
                <Text style={styles.exerciseTitle}>{headline.toUpperCase()}</Text>
                <Text style={styles.exerciseSummary}>{summary}</Text>
                <Text style={styles.exerciseHelp}>{detailLine}</Text>
              </View>

              <View style={styles.timerShell}>
                <View style={styles.timerPanel}>
                  <Text style={styles.timerLabel}>{counterLabel}</Text>
                  <Text style={styles.timerValue}>{counterValue}</Text>
                </View>
              </View>

              <Pressable onPress={onCancelWorkout} style={styles.cancelLinkButton}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </Pressable>

              {showOverview ? (
                <View style={styles.overviewPanel}>
                  <Text style={styles.overviewLink}>View workout overview</Text>
                  <View style={styles.overviewList}>
                    {workout.exercises.map((workoutExercise, index) => {
                      const isActiveExercise = index === activeOverviewIndex;

                      return (
                        <View
                          key={workoutExercise.id}
                          style={[
                            styles.overviewRow,
                            isActiveExercise ? styles.overviewRowActive : undefined,
                          ]}
                        >
                          <Text
                            style={[
                              styles.overviewIndex,
                              isActiveExercise ? styles.overviewIndexActive : undefined,
                            ]}
                          >
                            {index + 1}
                          </Text>
                          <View style={styles.overviewCopy}>
                            <Text
                              style={[
                                styles.overviewTitle,
                                isActiveExercise ? styles.overviewTitleActive : undefined,
                              ]}
                            >
                              {workoutExercise.title}
                            </Text>
                            <Text style={styles.overviewTarget}>
                              {formatTarget(workoutExercise.target).toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>

            <View style={styles.footerSection}>
              <View style={styles.bottomRail}>
                <Pressable
                  onPress={() => setShowOverview((currentValue) => !currentValue)}
                  style={[styles.railCard, showOverview ? styles.railCardActive : undefined]}
                >
                  <GoogleMaterialSymbol
                    color={showOverview ? theme.colors.primary : theme.colors.textSecondary}
                    fallbackName="grid-view"
                    name="grid_view"
                    size={22}
                  />
                  <Text style={[styles.railCardText, showOverview ? styles.railCardTextActive : undefined]}>
                    Overview
                  </Text>
                </Pressable>

                <Pressable
                  onPress={secondaryAction}
                  style={[styles.railCard, showStartState ? styles.railCardPrimary : undefined]}
                >
                  {showStartState ? (
                    <GoogleMaterialSymbol
                      color={theme.colors.primaryText}
                      fallbackName="play-arrow"
                      name="play_arrow"
                      size={22}
                    />
                  ) : (
                    <GoogleMaterialSymbol
                      color={theme.colors.textPrimary}
                      fallbackName="skip-next"
                      name="skip_next"
                      size={22}
                    />
                  )}
                  <Text
                    style={[styles.railCardText, showStartState ? styles.railCardPrimaryText : undefined]}
                  >
                    {secondaryActionLabel}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={showStartState}
                  onPress={primaryAction}
                  style={[
                    styles.railCard,
                    styles.railCardPrimary,
                    showStartState ? styles.railCardPrimaryDisabled : undefined,
                  ]}
                >
                  <GoogleMaterialSymbol
                    color={showStartState ? disabledActionColor : theme.colors.primaryText}
                    fallbackName="check-circle"
                    name="check_circle"
                    size={22}
                  />
                  <Text
                    style={[
                      styles.railCardPrimaryText,
                      showStartState ? styles.railCardPrimaryTextDisabled : undefined,
                    ]}
                  >
                    {primaryActionLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.lightTopBar}>
              <Pressable onPress={onCancelWorkout} style={styles.lightTopIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="close"
                  name="close"
                  size={26}
                />
              </Pressable>

              <View style={styles.lightTopCenter}>
                <Text style={styles.lightBrandTitle}>MUAY THAI ELITE</Text>
                <Text style={styles.lightLiveLabel}>● LIVE SESSION</Text>
              </View>

              <Pressable style={styles.lightTopIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="more-vert"
                  name="more_vert"
                  size={24}
                />
              </Pressable>
            </View>

            <View style={styles.lightHeaderBlock}>
              <Text style={styles.lightWorkoutTitle}>{workout.title}</Text>

              <View style={styles.lightProgressBarTrack}>
                <View style={[styles.lightProgressBarFill, { width: `${progressValue * 100}%` }]} />
              </View>

              <Text style={styles.lightProgressText}>
                Exercise {currentExerciseIndex + 1} / {workout.exercises.length}
              </Text>
            </View>

            <View style={styles.lightInstructionCard}>
              <View style={styles.lightInstructionHeader}>
                <Text style={styles.lightExerciseTitle}>{headline}</Text>
                <View style={styles.lightPhaseBadge}>
                  <Text style={styles.lightPhaseBadgeText}>{phaseLabel.toUpperCase()}</Text>
                </View>
              </View>

              <Text style={styles.lightExerciseSummary}>"{summary}"</Text>

              <View style={styles.lightHelpPanel}>
                <GoogleMaterialSymbol
                  color="#8B6200"
                  fallbackName="info-outline"
                  name="info"
                  size={22}
                />
                <Text style={styles.lightExerciseHelp}>{detailLine}</Text>
              </View>
            </View>

            <View style={styles.lightTimerShell}>
              <View style={styles.lightTimerPanel}>
                <Text style={styles.lightTimerLabel}>{counterLabel.toUpperCase()}</Text>
                <Text style={styles.lightTimerValue}>{counterValue}</Text>
              </View>
            </View>

            {showOverview ? (
              <View style={styles.lightOverviewSection}>
                <Text style={styles.lightOverviewLink}>View workout overview</Text>
                <View style={styles.lightOverviewList}>
                  {workout.exercises.map((workoutExercise, index) => {
                    const isActiveExercise = index === activeOverviewIndex;

                    return (
                      <View
                        key={workoutExercise.id}
                        style={[
                          styles.lightOverviewRow,
                          isActiveExercise ? styles.lightOverviewRowActive : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.lightOverviewIndex,
                            isActiveExercise ? styles.lightOverviewIndexActive : undefined,
                          ]}
                        >
                          {index + 1}
                        </Text>
                        <View style={styles.lightOverviewCopy}>
                          <Text
                            style={[
                              styles.lightOverviewRowTitle,
                              isActiveExercise ? styles.lightOverviewRowTitleActive : undefined,
                            ]}
                          >
                            {workoutExercise.title}
                          </Text>
                          <Text style={styles.lightOverviewTarget}>
                            {formatTarget(workoutExercise.target).toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            <View style={styles.lightFooterSection}>
              <Pressable onPress={onCancelWorkout} style={styles.lightCancelLinkButton}>
                <Text style={styles.lightCancelLinkText}>Cancel</Text>
              </Pressable>

              <View style={styles.lightBottomRail}>
                <Pressable
                  onPress={() => setShowOverview((currentValue) => !currentValue)}
                  style={[
                    styles.lightRailCard,
                    showOverview ? styles.lightRailCardActive : undefined,
                  ]}
                >
                  <GoogleMaterialSymbol
                    color={showOverview ? "#1560C8" : "#5F6A7F"}
                    fallbackName="grid-view"
                    name="grid_view"
                    size={22}
                  />
                  <Text
                    style={[
                      styles.lightRailCardText,
                      showOverview ? styles.lightRailCardTextActive : undefined,
                    ]}
                  >
                    Overview
                  </Text>
                </Pressable>

                <Pressable
                  onPress={showStartState ? onStartWorkout : secondaryAction}
                  style={[
                    styles.lightRailCard,
                    showStartState ? styles.lightRailCardPrimary : undefined,
                  ]}
                >
                  <GoogleMaterialSymbol
                    color={showStartState ? "#FFFFFF" : "#243B5E"}
                    fallbackName={showStartState ? "play-arrow" : "skip-next"}
                    name={showStartState ? "play_arrow" : "skip_next"}
                    size={22}
                  />
                  <Text
                    style={[
                      styles.lightRailCardText,
                      showStartState ? styles.lightRailCardPrimaryText : undefined,
                    ]}
                  >
                    {showStartState ? "Start Workout" : isRestStep || isPrestartStep ? "Next" : "Skip"}
                  </Text>
                </Pressable>

                <Pressable
                  disabled={showStartState}
                  onPress={primaryAction}
                  style={[
                    styles.lightRailCard,
                    styles.lightRailCardPrimary,
                    showStartState ? styles.lightRailCardPrimaryDisabled : undefined,
                  ]}
                >
                  <GoogleMaterialSymbol
                    color={showStartState ? "#A7B0B4" : "#FFFFFF"}
                    fallbackName="check-circle"
                    name="check_circle"
                    size={22}
                  />
                  <Text
                    style={[
                      styles.lightRailCardPrimaryText,
                      showStartState ? styles.lightRailCardPrimaryTextDisabled : undefined,
                    ]}
                  >
                    {primaryActionLabel}
                  </Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.navbarDock}>
        <BottomNavbar activeTab="Workouts" onTabPress={() => {}} theme={theme} />
      </View>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
    },
    content: {
      paddingHorizontal: isDarkTheme ? 26 : 20,
      paddingTop: 18,
      paddingBottom: 126,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
      gap: 16,
    },
    sessionBody: {
      gap: 12,
    },
    footerSection: {
      gap: 10,
      paddingBottom: 8,
      marginTop: 4,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
    },
    sessionBrandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    closeIconWrap: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    sessionTitle: {
      flex: 1,
      color: theme.colors.primary,
      fontSize: 22,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    heartbeatBlock: {
      alignItems: "flex-end",
      gap: 4,
    },
    heartbeatLabel: {
      color: "#7F8287",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.5,
      textTransform: "uppercase",
    },
    heartbeatValueRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    heartbeatValue: {
      color: theme.colors.primary,
      fontSize: 24,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    progressChip: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: 18,
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#4D5A60",
      backgroundColor: "#34363A",
    },
    progressDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.colors.primary,
    },
    progressChipText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 1.6,
      textTransform: "uppercase",
    },
    titleBlock: {
      alignItems: "center",
      marginTop: 16,
      gap: 10,
    },
    phaseLabel: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: 4.2,
      textTransform: "uppercase",
    },
    exerciseTitle: {
      color: theme.colors.textPrimary,
      fontSize: 28,
      fontWeight: "900",
      fontStyle: "italic",
      textAlign: "center",
      textTransform: "uppercase",
    },
    exerciseSummary: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
    },
    exerciseHelp: {
      color: "#8D9197",
      fontSize: 13,
      lineHeight: 18,
      textAlign: "center",
    },
    timerShell: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: "dashed",
      borderColor: "#222B2F",
      padding: 16,
      backgroundColor: "#161719",
    },
    timerPanel: {
      minHeight: 170,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#22272B",
      backgroundColor: "#131416",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 24,
      gap: 12,
    },
    overviewPanel: {
      width: "100%",
      gap: 12,
    },
    overviewList: {
      gap: 8,
    },
    overviewRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#293238",
      backgroundColor: "#16181B",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    overviewRowActive: {
      borderColor: theme.colors.primary,
      backgroundColor: "#102226",
    },
    overviewIndex: {
      width: 24,
      color: "#879096",
      fontSize: 12,
      fontWeight: "800",
      textAlign: "center",
    },
    overviewIndexActive: {
      color: theme.colors.primary,
    },
    overviewCopy: {
      flex: 1,
      gap: 3,
    },
    overviewTitle: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    overviewTitleActive: {
      color: theme.colors.primary,
    },
    overviewTarget: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    cancelLinkButton: {
      alignSelf: "center",
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    cancelLinkText: {
      color: "#F06C6C",
      fontSize: 13,
      fontWeight: "700",
    },
    timerLabel: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 3,
    },
    timerValue: {
      color: theme.colors.primary,
      fontSize: 64,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: -3,
      textTransform: "uppercase",
      textShadowColor: "rgba(0, 240, 255, 0.22)",
      textShadowRadius: 20,
    },
    overviewLink: {
      color: "#666B71",
      fontSize: 12,
      fontWeight: "500",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    bottomRail: {
      flexDirection: "row",
      gap: 12,
    },
    navbarDock: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
    },
    railCard: {
      flex: 1,
      minHeight: 82,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#364348",
      backgroundColor: "#131416",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    railCardPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    railCardPrimaryDisabled: {
      backgroundColor: "#4A5257",
      borderColor: "#4A5257",
    },
    railCardActive: {
      borderColor: theme.colors.primary,
      backgroundColor: "#102226",
    },
    railCardText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "500",
    },
    railCardTextActive: {
      color: theme.colors.primary,
    },
    railCardPrimaryText: {
      color: theme.colors.primaryText,
      fontSize: 13,
      fontWeight: "500",
    },
    railCardPrimaryTextDisabled: {
      color: "#A7B0B4",
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#E8E1DC",
    },
    lightTopIconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopCenter: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    lightBrandTitle: {
      color: "#1560C8",
      fontSize: 22,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    lightLiveLabel: {
      color: "#BE150E",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    lightHeaderBlock: {
      alignItems: "center",
      gap: 14,
      marginTop: 6,
    },
    lightWorkoutTitle: {
      color: "#151515",
      fontSize: 34,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 44,
    },
    lightProgressBarTrack: {
      width: "100%",
      height: 10,
      borderRadius: 999,
      backgroundColor: "#E6E1DE",
      overflow: "hidden",
    },
    lightProgressBarFill: {
      height: "100%",
      borderRadius: 999,
      backgroundColor: "#1560C8",
    },
    lightProgressText: {
      color: "#70798B",
      fontSize: 16,
      fontWeight: "500",
      letterSpacing: 2.2,
    },
    lightInstructionCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#DDD8D4",
      paddingHorizontal: 18,
      paddingVertical: 16,
      gap: 12,
      shadowColor: "#395A88",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    lightInstructionHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    lightExerciseTitle: {
      flex: 1,
      color: "#1560C8",
      fontSize: 22,
      lineHeight: 30,
      fontWeight: "800",
    },
    lightPhaseBadge: {
      minHeight: 34,
      borderRadius: 999,
      backgroundColor: "#2B73E2",
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    lightPhaseBadgeText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "800",
    },
    lightExerciseSummary: {
      color: "#24406A",
      fontSize: 15,
      lineHeight: 22,
      fontStyle: "italic",
    },
    lightHelpPanel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingTop: 2,
    },
    lightExerciseHelp: {
      flex: 1,
      color: "#374457",
      fontSize: 15,
      lineHeight: 22,
    },
    lightTimerShell: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#D9E2EF",
      padding: 16,
      backgroundColor: "#F4EFEA",
    },
    lightTimerPanel: {
      minHeight: 170,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#C8D5E8",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      paddingVertical: 24,
      gap: 12,
    },
    lightTimerLabel: {
      color: "#1560C8",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 3,
      textTransform: "uppercase",
    },
    lightTimerValue: {
      color: "#1560C8",
      fontSize: 64,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: -3,
      textTransform: "uppercase",
      textShadowColor: "rgba(21, 96, 200, 0.12)",
      textShadowRadius: 10,
    },
    lightOverviewSection: {
      gap: 12,
      marginTop: 2,
    },
    lightOverviewLink: {
      color: "#6B7384",
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    lightOverviewList: {
      gap: 10,
      paddingTop: 2,
    },
    lightOverviewRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "center",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#D6DFEE",
      backgroundColor: "#FFFFFF",
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    lightOverviewRowActive: {
      borderColor: "#2B73E2",
      backgroundColor: "#F2F7FF",
    },
    lightOverviewIndex: {
      width: 26,
      color: "#7A8394",
      fontSize: 14,
      fontWeight: "800",
      textAlign: "center",
    },
    lightOverviewIndexActive: {
      color: "#1560C8",
    },
    lightOverviewCopy: {
      flex: 1,
      gap: 3,
    },
    lightOverviewRowTitle: {
      color: "#151515",
      fontSize: 15,
      fontWeight: "700",
    },
    lightOverviewRowTitleActive: {
      color: "#1560C8",
    },
    lightOverviewTarget: {
      color: "#5F6A7F",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    lightFooterSection: {
      gap: 10,
      paddingBottom: 8,
      marginTop: 4,
    },
    lightBottomRail: {
      flexDirection: "row",
      gap: 12,
    },
    lightRailCard: {
      flex: 1,
      minHeight: 82,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C8D5E8",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    lightRailCardPrimary: {
      backgroundColor: "#1560C8",
      borderColor: "#1560C8",
    },
    lightRailCardPrimaryDisabled: {
      backgroundColor: "#B8C0CC",
      borderColor: "#B8C0CC",
    },
    lightRailCardActive: {
      borderColor: "#1560C8",
      backgroundColor: "#EAF2FF",
    },
    lightRailCardText: {
      color: "#5F6A7F",
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
    },
    lightRailCardTextActive: {
      color: "#1560C8",
    },
    lightRailCardPrimaryText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
    },
    lightRailCardPrimaryTextDisabled: {
      color: "#F3F5F8",
    },
    lightCancelLinkButton: {
      alignSelf: "center",
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    lightCancelLinkText: {
      color: "#D00000",
      fontSize: 13,
      fontWeight: "700",
    },
  });
}
