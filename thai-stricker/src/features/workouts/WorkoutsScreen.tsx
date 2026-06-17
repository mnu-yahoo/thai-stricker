import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import type { AppTheme } from "../../styles/theme";
import type { MockWorkout } from "./workoutMocks";

type WorkoutsScreenProps = {
  theme: AppTheme;
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  workouts: MockWorkout[];
  onStartWorkout: (workoutId: string) => void;
  onOpenAddWorkout: () => void;
  onOpenEditWorkout: (workoutId: string) => void;
};

function formatTarget(target: MockWorkout["exercises"][number]["target"]) {
  if (target.type === "duration") {
    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

export function WorkoutsScreen({
  theme,
  restSecondsBetweenExercises,
  workouts,
  onStartWorkout,
  onOpenAddWorkout,
  onOpenEditWorkout,
}: WorkoutsScreenProps) {
  const styles = getStyles(theme);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const toggleWorkoutContent = (workoutId: string) => {
    setExpandedWorkoutId((currentId) => (currentId === workoutId ? null : workoutId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>Workout library</Text>
            <Text style={styles.title}>Workouts</Text>
            <Text style={styles.subtitle}>
              Browse focused sessions, inspect their content inline, and add workouts through the
              mocked form flow.
            </Text>
          </View>
          <Pressable onPress={onOpenAddWorkout} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add workout</Text>
          </Pressable>
        </View>

        {workouts.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;

          return (
            <View key={workout.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <Text style={styles.cardDescription}>{workout.description}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{workout.difficulty}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Category</Text>
                  <Text style={styles.metaValue}>{workout.category}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Duration</Text>
                  <Text style={styles.metaValue}>{workout.totalDurationMinutes} min</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Exercises</Text>
                  <Text style={styles.metaValue}>{workout.exercises.length}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Rest</Text>
                  <Text style={styles.metaValue}>{restSecondsBetweenExercises} s</Text>
                </View>
              </View>

              <Text style={styles.lastDoneText}>
                {workout.lastDoneDate ? `Last done: ${workout.lastDoneDate}` : "Not completed yet"}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => toggleWorkoutContent(workout.id)}
                  style={styles.ghostButton}
                >
                  <Text style={styles.ghostButtonText}>
                    {isExpanded ? "Hide content" : "View content"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onStartWorkout(workout.id)}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Start workout</Text>
                </Pressable>
                <Pressable
                  onPress={() => onOpenEditWorkout(workout.id)}
                  style={styles.ghostButton}
                >
                  <Text style={styles.ghostButtonText}>Edit workout</Text>
                </Pressable>
              </View>

              {isExpanded ? (
                <View style={styles.expandedSection}>
                  {workout.exercises.map((exercise, index) => {
                    const isLastExercise = index === workout.exercises.length - 1;

                    return (
                      <View key={exercise.id} style={styles.exerciseCard}>
                        <View style={styles.exerciseHeader}>
                          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                          <Text style={styles.exerciseTarget}>{formatTarget(exercise.target)}</Text>
                        </View>
                        <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                        <Text style={styles.exerciseHelp}>{exercise.help}</Text>
                        {!isLastExercise ? (
                          <Text style={styles.restNote}>
                            Rest {restSecondsBetweenExercises} sec before the next exercise
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.appBackground,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
      gap: 16,
    },
    header: {
      gap: 16,
    },
    headerText: {
      gap: 6,
    },
    eyebrow: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    addButton: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      minHeight: 48,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    addButtonText: {
      color: theme.colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      padding: 18,
      gap: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    headerCopy: {
      flex: 1,
      gap: 6,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
    },
    cardDescription: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
    },
    badge: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    badgeText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    metaRow: {
      flexDirection: "row",
      gap: 12,
    },
    metaPill: {
      flex: 1,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      padding: 12,
      gap: 4,
    },
    metaLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    metaValue: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: "700",
    },
    actionsRow: {
      flexDirection: "column",
      gap: 10,
    },
    lastDoneText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
    },
    ghostButton: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    ghostButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      fontWeight: "700",
    },
    expandedSection: {
      gap: 12,
      paddingTop: 4,
    },
    exerciseCard: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      padding: 14,
      gap: 8,
    },
    exerciseHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
    },
    exerciseTitle: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: "700",
    },
    exerciseTarget: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    exerciseDescription: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    exerciseHelp: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
    },
    restNote: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "600",
    },
  });
}
