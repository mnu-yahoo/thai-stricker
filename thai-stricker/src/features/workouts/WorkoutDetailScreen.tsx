import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
import type { AppTheme } from "../../styles/theme";
import type { MockWorkout } from "./workoutMocks";

type WorkoutDetailScreenProps = {
  theme: AppTheme;
  workout: MockWorkout | null;
  onBackToWorkouts: () => void;
  onStartWorkout: (workoutId: string) => void;
  onOpenEditWorkout: (workoutId: string) => void;
};

function formatTarget(target: MockWorkout["exercises"][number]["target"]) {
  if (target.type === "duration") {
    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

function formatLastDoneDate(lastDoneDate?: string) {
  if (!lastDoneDate) {
    return "Not yet";
  }

  const parsedDate = new Date(lastDoneDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return lastDoneDate;
  }

  return parsedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function WorkoutDetailScreen({
  theme,
  workout,
  onBackToWorkouts,
  onStartWorkout,
  onOpenEditWorkout,
}: WorkoutDetailScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missingState}>
          <Text style={styles.missingStateTitle}>Workout not found</Text>
          <Pressable onPress={onBackToWorkouts} style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionButtonText}>Back to workouts</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <View style={styles.darkTopBar}>
            <View style={styles.brandRow}>
              <Pressable onPress={onBackToWorkouts} style={styles.backIconButton}>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="arrow-back"
                  name="arrow_back"
                  size={22}
                />
              </Pressable>
              <Text style={styles.darkHubTitle}>Workout Detail</Text>
            </View>
            <Pressable style={styles.iconButton}>
              <GoogleMaterialSymbol
                color={theme.colors.primary}
                fallbackName="settings"
                name="settings"
                size={22}
              />
            </Pressable>
          </View>
        ) : (
          <View style={styles.lightTopBar}>
            <Pressable onPress={onBackToWorkouts} style={styles.lightIconButton}>
              <GoogleMaterialSymbol
                color="#1560C8"
                fallbackName="arrow-back"
                name="arrow_back"
                size={24}
              />
            </Pressable>
            <Text style={styles.lightTopTitle}>Workout Detail</Text>
            <Pressable style={styles.lightIconButton}>
              <GoogleMaterialSymbol
                color="#1560C8"
                fallbackName="edit"
                name="edit"
                size={24}
              />
            </Pressable>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>{isDarkTheme ? "Private coaching app" : "Workout profile"}</Text>
          <Text style={styles.title}>{workout.title}</Text>
          <Text style={styles.subtitle}>{workout.description}</Text>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.primaryBadge]}>
              <Text style={styles.primaryBadgeText}>{workout.difficulty.toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, styles.secondaryBadge]}>
              <Text style={styles.secondaryBadgeText}>{workout.category.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={styles.statValue}>{workout.totalDurationMinutes} min</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Exercises</Text>
              <Text style={styles.statValue}>{workout.exercises.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Rest</Text>
              <Text style={styles.statValue}>{workout.restSecondsBetweenExercises}s</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Last done</Text>
              <Text style={styles.statValue}>{formatLastDoneDate(workout.lastDoneDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <GoogleMaterialSymbol
              color={isDarkTheme ? theme.colors.primary : "#1560C8"}
              fallbackName="format-list-bulleted"
              name="format_list_bulleted"
              size={20}
            />
            <Text style={styles.sectionTitle}>Workout Flow</Text>
          </View>

          <View style={styles.exerciseList}>
            {workout.exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseIndexBadge}>
                  <Text style={styles.exerciseIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                  <Text style={styles.exerciseTarget}>{formatTarget(exercise.target).toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable onPress={() => onOpenEditWorkout(workout.id)} style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionButtonText}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => onStartWorkout(workout.id)} style={styles.primaryActionButton}>
            <Text style={styles.primaryActionButtonText}>Start Workout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? "#141416" : theme.colors.appBackground,
    },
    content: {
      paddingHorizontal: isDarkTheme ? 20 : 16,
      paddingTop: 18,
      paddingBottom: 28,
      gap: 20,
      backgroundColor: isDarkTheme ? "#141416" : theme.colors.appBackground,
    },
    darkTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backIconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    darkHubTitle: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    iconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
    },
    lightIconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopTitle: {
      flex: 1,
      color: "#1560C8",
      fontSize: 24,
      fontWeight: "700",
      marginLeft: 12,
    },
    header: {
      gap: 8,
    },
    eyebrow: {
      color: isDarkTheme ? theme.colors.primary : "#5B6D87",
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: isDarkTheme ? 34 : 32,
      fontWeight: "800",
      letterSpacing: isDarkTheme ? -0.8 : 0,
    },
    subtitle: {
      color: isDarkTheme ? theme.colors.textSecondary : "#394B65",
      fontSize: 15,
      lineHeight: 22,
    },
    metaCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#42565B" : "#C5D1E5",
      backgroundColor: isDarkTheme ? "#1E1D20" : "#FFFFFF",
      padding: 16,
      gap: 16,
    },
    badgeRow: {
      flexDirection: "row",
      gap: 10,
      flexWrap: "wrap",
    },
    badge: {
      minHeight: 32,
      borderRadius: 999,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryBadge: {
      backgroundColor: isDarkTheme ? theme.colors.primary : "#EAF2FF",
    },
    primaryBadgeText: {
      color: isDarkTheme ? theme.colors.primaryText : "#1560C8",
      fontSize: 12,
      fontWeight: "800",
    },
    secondaryBadge: {
      backgroundColor: isDarkTheme ? "#2A2A2D" : "#F6F2EF",
    },
    secondaryBadgeText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    statCard: {
      width: "47%",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#35464B" : "#D9E0EC",
      backgroundColor: isDarkTheme ? "#16181B" : "#FBF9F7",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 6,
    },
    statLabel: {
      color: isDarkTheme ? theme.colors.textSecondary : "#5B6D87",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.1,
    },
    statValue: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    section: {
      gap: 12,
    },
    sectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    sectionTitle: {
      color: isDarkTheme ? theme.colors.textPrimary : "#1560C8",
      fontSize: 22,
      fontWeight: "700",
    },
    exerciseList: {
      gap: 10,
    },
    exerciseCard: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#35464B" : "#D9E0EC",
      backgroundColor: isDarkTheme ? "#1E1D20" : "#FFFFFF",
      padding: 14,
    },
    exerciseIndexBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkTheme ? theme.colors.primary : "#EAF2FF",
    },
    exerciseIndexText: {
      color: isDarkTheme ? theme.colors.primaryText : "#1560C8",
      fontSize: 15,
      fontWeight: "800",
    },
    exerciseCopy: {
      flex: 1,
      gap: 4,
    },
    exerciseTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
    },
    exerciseDescription: {
      color: isDarkTheme ? theme.colors.textSecondary : "#394B65",
      fontSize: 14,
      lineHeight: 20,
    },
    exerciseTarget: {
      color: isDarkTheme ? theme.colors.primary : "#1560C8",
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 14,
      paddingTop: 2,
    },
    secondaryActionButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: isDarkTheme ? 4 : 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#1F1D20" : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
    },
    primaryActionButton: {
      flex: 1,
      minHeight: 52,
      borderRadius: isDarkTheme ? 4 : 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    primaryActionButtonText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: "800",
      textAlign: "center",
    },
    missingState: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      backgroundColor: theme.colors.appBackground,
    },
    missingStateTitle: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
    },
  });
}
