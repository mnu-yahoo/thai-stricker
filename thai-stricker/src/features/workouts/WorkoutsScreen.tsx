import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";

import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
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

const WORKOUT_HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

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
  const isDarkTheme = theme.name === "dark";
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const workoutCategories = Array.from(new Set(workouts.map((workout) => workout.category)));
  const categoryTabs = ["All workouts", ...workoutCategories];
  const [selectedCategory, setSelectedCategory] = useState("All workouts");

  const visibleWorkouts =
    selectedCategory === "All workouts"
      ? workouts
      : workouts.filter((workout) => workout.category === selectedCategory);

  const toggleWorkoutContent = (workoutId: string) => {
    setExpandedWorkoutId((currentId) => (currentId === workoutId ? null : workoutId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
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
        ) : null}

        {isDarkTheme ? (
          <View style={styles.libraryHeader}>
            <Text style={styles.libraryTitle}>Workouts Library</Text>
            <Text style={styles.librarySubtitle}>
              {visibleWorkouts.length} curated sessions available
            </Text>
            <Pressable onPress={onOpenAddWorkout} style={styles.libraryAddButton}>
              <View style={styles.libraryAddContent}>
                <GoogleMaterialSymbol
                  color={theme.colors.primaryText}
                  fallbackName="add-circle"
                  name="add_circle"
                  size={20}
                />
                <Text style={styles.libraryAddText}>Add workout</Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        {isDarkTheme ? (
          <ScrollView
            contentContainerStyle={styles.categoryTabs}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categoryTabs.map((category) => {
              const isActive = category === selectedCategory;

              return (
                <Pressable
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[styles.categoryChip, isActive ? styles.categoryChipActive : undefined]}
                >
                  <Text
                    style={[styles.categoryChipText, isActive ? styles.categoryChipTextActive : undefined]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
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
              <View style={styles.addButtonContent}>
                <GoogleMaterialSymbol
                  color={theme.colors.primaryText}
                  fallbackName="add"
                  name="add"
                  size={18}
                />
                <Text style={styles.addButtonText}>Add workout</Text>
              </View>
            </Pressable>
          </View>
        )}

        {visibleWorkouts.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;

          return (
            <View key={workout.id} style={styles.card}>
              {isDarkTheme ? (
                <ImageBackground
                  imageStyle={styles.workoutImage}
                  source={{ uri: WORKOUT_HERO_IMAGE_URI }}
                  style={styles.workoutImageCard}
                >
                  <View style={styles.workoutImageOverlay} />
                  <View style={styles.workoutImageBadges}>
                    <View style={styles.heroBadgePrimary}>
                      <Text style={styles.heroBadgePrimaryText}>
                        {workout.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.heroBadgeSecondary}>
                      <Text style={styles.heroBadgeSecondaryText}>
                        {workout.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              ) : null}

              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <Text style={styles.cardDescription}>{workout.description}</Text>
                </View>
                {!isDarkTheme ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{workout.difficulty}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Duration</Text>
                  <Text style={styles.metaValue}>{workout.totalDurationMinutes} mins</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Exercises</Text>
                  <Text style={styles.metaValue}>{workout.exercises.length} drills</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Rest</Text>
                  <Text style={styles.metaValue}>{restSecondsBetweenExercises}s interval</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Last done</Text>
                  <Text style={styles.metaValue}>
                    {workout.lastDoneDate ? workout.lastDoneDate.slice(5).replace("-", " ") : "Not yet"}
                  </Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => onStartWorkout(workout.id)}
                  style={[styles.primaryButton, isDarkTheme ? styles.startButtonDark : undefined]}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>{isDarkTheme ? "START" : "Start workout"}</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => toggleWorkoutContent(workout.id)}
                  style={[styles.ghostButton, isDarkTheme ? styles.viewButtonDark : undefined]}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.ghostButtonText}>
                      {isDarkTheme ? "View" : isExpanded ? "Hide content" : "View content"}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => onOpenEditWorkout(workout.id)}
                  style={[styles.ghostButton, isDarkTheme ? styles.editButtonDark : undefined]}
                >
                  <View style={styles.buttonContent}>
                    <GoogleMaterialSymbol
                      color={isDarkTheme ? theme.colors.textSecondary : theme.colors.textSecondary}
                      fallbackName="edit"
                      name="edit"
                      size={18}
                    />
                    {isDarkTheme ? null : <Text style={styles.ghostButtonText}>Edit workout</Text>}
                  </View>
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
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.appBackground,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
      gap: 16,
    },
    header: {
      gap: 16,
    },
    headerText: {
      gap: 8,
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
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    topActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    libraryHeader: {
      gap: 10,
      marginBottom: 4,
    },
    libraryTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
    },
    librarySubtitle: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
    },
    libraryAddButton: {
      backgroundColor: theme.colors.primary,
      minHeight: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      marginTop: 4,
      elevation: 3,
    },
    libraryAddContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    libraryAddText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    categoryTabs: {
      gap: 10,
      paddingBottom: 10,
    },
    categoryChip: {
      minHeight: 38,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryChipActive: {
      borderColor: theme.colors.primary,
      backgroundColor: "#14272B",
    },
    categoryChipText: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    categoryChipTextActive: {
      color: theme.colors.primary,
    },
    eyebrow: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: isDarkTheme ? -0.8 : 0,
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
      elevation: isDarkTheme ? 3 : 0,
    },
    addButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    addButtonText: {
      color: theme.colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
      letterSpacing: isDarkTheme ? 0.6 : 0,
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
    workoutImageCard: {
      height: 180,
      borderRadius: 16,
      overflow: "hidden",
      justifyContent: "flex-start",
      backgroundColor: theme.colors.cardElevated,
      marginBottom: 2,
    },
    workoutImage: {
      borderRadius: 16,
    },
    workoutImageOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(6, 12, 14, 0.42)",
    },
    workoutImageBadges: {
      flexDirection: "row",
      gap: 8,
      padding: 14,
    },
    heroBadgePrimary: {
      backgroundColor: theme.colors.primary,
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    heroBadgePrimaryText: {
      color: theme.colors.primaryText,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    heroBadgeSecondary: {
      backgroundColor: "rgba(80, 88, 92, 0.9)",
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    heroBadgeSecondaryText: {
      color: theme.colors.textPrimary,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
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
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    cardDescription: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
    },
    badge: {
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? theme.colors.primaryPressed : "transparent",
    },
    badgeText: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    metaRow: {
      flexDirection: "row",
      gap: 12,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metaPill: {
      width: "47%",
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? theme.colors.border : "transparent",
    },
    metaLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    metaValue: {
      color: isDarkTheme ? theme.colors.textPrimary : theme.colors.textPrimary,
      fontSize: isDarkTheme ? 15 : 17,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    actionsRow: {
      flexDirection: isDarkTheme ? "row" : "column",
      gap: 10,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
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
      flex: isDarkTheme ? 1.4 : undefined,
    },
    primaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
      letterSpacing: isDarkTheme ? 0.6 : 0,
    },
    ghostButton: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surface,
    },
    ghostButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      fontWeight: "700",
    },
    startButtonDark: {
      minHeight: 40,
      borderRadius: 12,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    viewButtonDark: {
      minHeight: 40,
      flex: 1,
      borderRadius: 12,
      borderColor: theme.colors.primary,
      backgroundColor: "transparent",
    },
    editButtonDark: {
      minHeight: 40,
      width: 48,
      minWidth: 48,
      flex: 0,
      borderRadius: 10,
      borderWidth: 0,
      backgroundColor: "#3A3A3F",
      paddingHorizontal: 0,
    },
    expandedSection: {
      gap: 12,
      paddingTop: 4,
    },
    exerciseCard: {
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
      borderRadius: 14,
      padding: 14,
      gap: 8,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? theme.colors.border : "transparent",
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
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: 12,
      fontWeight: "600",
    },
  });
}
