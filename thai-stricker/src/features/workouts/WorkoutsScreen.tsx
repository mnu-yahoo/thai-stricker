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
import type { MockWorkout, MockWorkoutDifficulty } from "./workoutMocks";

type WorkoutsScreenProps = {
  theme: AppTheme;
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  workouts: MockWorkout[];
  onStartWorkout: (workoutId: string) => void;
  onOpenAddWorkout: () => void;
  onOpenEditWorkout: (workoutId: string) => void;
  onDeleteWorkout: (workoutId: string) => void;
};

const WORKOUT_HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

const LIGHT_ALL_FILTER = "All Drills";
const LIGHT_DIFFICULTY_FILTERS: Array<typeof LIGHT_ALL_FILTER | MockWorkoutDifficulty> = [
  LIGHT_ALL_FILTER,
  "Beginner",
  "Intermediate",
  "Advanced",
];

function formatTarget(target: MockWorkout["exercises"][number]["target"]) {
  if (target.type === "duration") {
    const minutes = Math.floor(target.seconds / 60);

    if (minutes > 0 && target.seconds % 60 === 0) {
      return `${minutes} min`;
    }

    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

function formatExerciseMeta(
  difficulty: MockWorkout["difficulty"],
  target: MockWorkout["exercises"][number]["target"],
) {
  const setCount = difficulty === "Advanced" ? 5 : difficulty === "Intermediate" ? 4 : 3;

  return `${setCount} rounds of ${formatTarget(target)}`;
}

function formatLastDoneDate(lastDoneDate?: string) {
  if (!lastDoneDate) {
    return "LAST: --";
  }

  const parsedDate = new Date(lastDoneDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return `LAST: ${lastDoneDate}`;
  }

  return `LAST: ${parsedDate
    .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    .toUpperCase()}`;
}

function buildQuickDescription(description: string) {
  return description.length > 44 ? `${description.slice(0, 44).trimEnd()}...` : description;
}

export function WorkoutsScreen({
  theme,
  workouts,
  onStartWorkout,
  onOpenAddWorkout,
  onOpenEditWorkout,
  onDeleteWorkout,
}: WorkoutsScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
  const [libraryWorkouts, setLibraryWorkouts] = useState(workouts);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<
    typeof LIGHT_ALL_FILTER | MockWorkoutDifficulty
  >(LIGHT_ALL_FILTER);
  const workoutCategories = useMemo(
    () => Array.from(new Set(workouts.map((workout) => workout.category))),
    [workouts],
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLibraryWorkouts(workouts);
    setExpandedWorkoutId(null);
  }, [workouts]);

  const visibleWorkouts = useMemo(() => {
    return libraryWorkouts.filter((workout) => {
      const matchesSearch =
        searchQuery.trim().length === 0 ||
        workout.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        workout.description.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        workout.exercises.some((exercise) =>
          exercise.title.toLowerCase().includes(searchQuery.trim().toLowerCase()),
        );
      const matchesDifficulty =
        selectedDifficulty === LIGHT_ALL_FILTER || workout.difficulty === selectedDifficulty;
      const matchesCategory =
        selectedCategory === "All" || workout.category === selectedCategory;

      return matchesSearch && matchesDifficulty && matchesCategory;
    });
  }, [libraryWorkouts, searchQuery, selectedDifficulty, selectedCategory]);

  const toggleWorkoutContent = (workoutId: string) => {
    setExpandedWorkoutId((currentId) => (currentId === workoutId ? null : workoutId));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty(LIGHT_ALL_FILTER);
    setSelectedCategory("All");
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
        ) : (
          <View style={styles.lightTopBar}>
            <View style={styles.lightTitleRow}>
              <GoogleMaterialSymbol
                color="#1560C8"
                fallbackName="sports-kabaddi"
                name="sports_martial_arts"
                size={22}
              />
              <Text style={styles.lightScreenTitle}>WORKOUT LIBRARY</Text>
            </View>
            <Pressable style={styles.lightNotificationButton}>
              <GoogleMaterialSymbol
                color="#405A86"
                fallbackName="notifications-none"
                name="notifications"
                size={22}
              />
            </Pressable>
          </View>
        )}

        {isDarkTheme ? (
          <>
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

            <ScrollView
              contentContainerStyle={styles.categoryTabs}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {["All workouts", ...workoutCategories].map((category) => {
                const isActive = category === selectedCategory;

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category === "All workouts" ? "All workouts" : category)}
                    style={[styles.categoryChip, isActive ? styles.categoryChipActive : undefined]}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isActive ? styles.categoryChipTextActive : undefined,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        ) : (
          <View style={styles.lightHeaderBlock}>
            <View style={styles.lightSectionHeader}>
              <Text style={styles.lightLibraryHeading}>Your Workouts</Text>
              <Pressable onPress={onOpenAddWorkout} style={styles.lightAddButton}>
                <GoogleMaterialSymbol
                  color="#FFFFFF"
                  fallbackName="add"
                  name="add"
                  size={24}
                />
              </Pressable>
            </View>

            <View style={styles.lightSearchBox}>
              <GoogleMaterialSymbol
                color="#6C7381"
                fallbackName="search"
                name="search"
                size={22}
              />
              <TextInput
                onChangeText={setSearchQuery}
                placeholder="Search drills..."
                placeholderTextColor="#6C7381"
                style={styles.lightSearchInput}
                value={searchQuery}
              />
              {searchQuery.length > 0 ? (
                <Pressable onPress={() => setSearchQuery("")}>
                  <GoogleMaterialSymbol
                    color="#6C7381"
                    fallbackName="cancel"
                    name="cancel"
                    size={22}
                  />
                </Pressable>
              ) : (
                <GoogleMaterialSymbol
                  color="#6C7381"
                  fallbackName="cancel"
                  name="cancel"
                  size={22}
                />
              )}
            </View>

            <View style={styles.lightFilterHeadingRow}>
              <View style={styles.lightFilterLabelRow}>
                <GoogleMaterialSymbol
                  color="#6C7381"
                  fallbackName="filter-list"
                  name="filter_list"
                  size={16}
                />
                <Text style={styles.lightFilterLabel}>FILTER LIBRARY</Text>
              </View>
              <Pressable onPress={resetFilters}>
                <Text style={styles.lightResetText}>Reset Filters</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.lightChipRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {LIGHT_DIFFICULTY_FILTERS.map((filter) => {
                const isActive = filter === selectedDifficulty;

                return (
                  <Pressable
                    key={filter}
                    onPress={() => setSelectedDifficulty(filter)}
                    style={[
                      styles.lightFilterChip,
                      isActive ? styles.lightFilterChipActive : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.lightFilterChipText,
                        isActive ? styles.lightFilterChipTextActive : undefined,
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <ScrollView
              contentContainerStyle={styles.lightChipRow}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {["All", ...workoutCategories].map((category) => {
                const isActive = category === selectedCategory;

                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={[
                      styles.lightCategoryChip,
                      isActive ? styles.lightCategoryChipActive : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.lightCategoryChipText,
                        isActive ? styles.lightCategoryChipTextActive : undefined,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {visibleWorkouts.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;

          return (
            <View
              key={workout.id}
              style={[styles.card, !isDarkTheme ? styles.lightWorkoutCard : undefined]}
            >
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
              ) : (
                <View style={styles.lightWorkoutTop}>
                  <View style={styles.lightBadgeRow}>
                    <View style={styles.lightMiniBadgeWarm}>
                      <Text style={styles.lightMiniBadgeWarmText}>
                        {workout.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.lightMiniBadgeCool}>
                      <Text style={styles.lightMiniBadgeCoolText}>
                        {workout.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => toggleWorkoutContent(workout.id)}>
                    <GoogleMaterialSymbol
                      color="#6C7381"
                      fallbackName={isExpanded ? "expand-less" : "expand-more"}
                      name={isExpanded ? "expand_less" : "expand_more"}
                      size={22}
                    />
                  </Pressable>
                </View>
              )}

              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <Text style={styles.cardDescription}>
                    {isDarkTheme ? workout.description : buildQuickDescription(workout.description)}
                  </Text>
                </View>
                {!isDarkTheme ? null : null}
              </View>

              {!isDarkTheme ? (
                <View style={styles.lightMetaRow}>
                  <View style={styles.lightInlineMeta}>
                    <GoogleMaterialSymbol
                      color="#516C95"
                      fallbackName="schedule"
                      name="schedule"
                      size={18}
                    />
                    <Text style={styles.lightInlineMetaText}>{workout.totalDurationMinutes} min</Text>
                  </View>
                  <View style={styles.lightInlineMeta}>
                    <GoogleMaterialSymbol
                      color="#516C95"
                      fallbackName="sports-kabaddi"
                      name="sports_martial_arts"
                      size={18}
                    />
                    <Text style={styles.lightInlineMetaText}>
                      {workout.exercises.length} exercises
                    </Text>
                  </View>
                  {isExpanded ? (
                    <Text style={styles.lightLastDoneText}>{formatLastDoneDate(workout.lastDoneDate)}</Text>
                  ) : null}
                </View>
              ) : (
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
                    <Text style={styles.metaValue}>{workout.restSecondsBetweenExercises}s interval</Text>
                  </View>
                  <View style={styles.metaPill}>
                    <Text style={styles.metaLabel}>Last done</Text>
                    <Text style={[styles.metaValue, styles.metaValueAccent]}>
                      {workout.lastDoneDate ? workout.lastDoneDate.slice(5).replace("-", " ") : "Not yet"}
                    </Text>
                  </View>
                </View>
              )}

              {isExpanded ? (
                <View style={[styles.expandedSection, !isDarkTheme ? styles.lightExpandedSection : undefined]}>
                  {!isDarkTheme ? <View style={styles.lightDivider} /> : null}
                  {workout.exercises.map((exercise, index) => (
                    <View
                      key={exercise.id}
                      style={[styles.exerciseCard, !isDarkTheme ? styles.lightExerciseCard : undefined]}
                    >
                      {isDarkTheme ? (
                        <>
                          <View style={styles.exerciseMedia}>
                            <ImageBackground
                              imageStyle={styles.exerciseThumbImage}
                              source={{ uri: WORKOUT_HERO_IMAGE_URI }}
                              style={styles.exerciseThumb}
                            >
                              <View style={styles.exerciseThumbOverlay} />
                            </ImageBackground>
                          </View>
                          <View style={styles.exerciseBody}>
                            <View style={styles.exerciseHeader}>
                              <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                            </View>
                            <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                            <Text style={styles.exerciseTarget}>
                              {formatExerciseMeta(workout.difficulty, exercise.target)}
                            </Text>
                          </View>
                          <View style={styles.exerciseAction}>
                            <GoogleMaterialSymbol
                              color={theme.colors.primary}
                              fallbackName="play-circle"
                              name="play_arrow"
                              size={20}
                            />
                          </View>
                        </>
                      ) : (
                        <>
                          <Text style={styles.lightExerciseIndex}>{`${index + 1}`.padStart(2, "0")}</Text>
                          <View style={styles.lightExerciseBody}>
                            <Text style={styles.lightExerciseTitle}>{exercise.title}</Text>
                            <Text style={styles.lightExerciseDescription}>
                              {formatExerciseMeta(workout.difficulty, exercise.target)} • {exercise.description}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  ))}
                </View>
              ) : null}

              {isDarkTheme ? (
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={() => onStartWorkout(workout.id)}
                    style={[styles.primaryButton, styles.startButtonDark]}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.primaryButtonText}>START</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => toggleWorkoutContent(workout.id)}
                    style={[styles.ghostButton, styles.viewButtonDark]}
                  >
                    <View style={styles.buttonContent}>
                      <Text style={styles.ghostButtonText}>{isExpanded ? "HIDE" : "VIEW"}</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => onOpenEditWorkout(workout.id)}
                    style={[styles.ghostButton, styles.editButtonDark]}
                  >
                    <View style={styles.buttonContent}>
                      <GoogleMaterialSymbol
                        color={theme.colors.textSecondary}
                        fallbackName="edit"
                        name="edit"
                        size={18}
                      />
                    </View>
                  </Pressable>
                </View>
              ) : isExpanded ? (
                <View style={styles.lightActionsRow}>
                  <Pressable
                    onPress={() => onStartWorkout(workout.id)}
                    style={styles.lightStartButton}
                  >
                    <View style={styles.buttonContent}>
                      <GoogleMaterialSymbol
                        color="#FFFFFF"
                        fallbackName="play-arrow"
                        name="play_arrow"
                        size={18}
                      />
                      <Text style={styles.lightStartButtonText}>START WORKOUT</Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => onOpenEditWorkout(workout.id)}
                    style={styles.lightIconAction}
                  >
                    <GoogleMaterialSymbol
                      color="#526B95"
                      fallbackName="edit"
                      name="edit"
                      size={18}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => onDeleteWorkout(workout.id)}
                    style={styles.lightIconAction}
                  >
                    <GoogleMaterialSymbol
                      color="#2A2A2A"
                      fallbackName="delete-outline"
                      name="delete"
                      size={18}
                    />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.lightCollapsedFooter}>
                  <View style={styles.lightInlineMeta}>
                    <GoogleMaterialSymbol
                      color="#516C95"
                      fallbackName="history"
                      name="history"
                      size={18}
                    />
                    <Text style={styles.lightInlineMetaText}>
                      {formatLastDoneDate(workout.lastDoneDate)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => onStartWorkout(workout.id)}
                    style={styles.lightQuickStartButton}
                  >
                    <Text style={styles.lightQuickStartText}>QUICK START</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}

        {!isDarkTheme && visibleWorkouts.length === 0 ? (
          <View style={styles.lightEmptyState}>
            <GoogleMaterialSymbol
              color="#D7DBE5"
              fallbackName="fitness-center"
              name="fitness_center"
              size={54}
            />
            <Text style={styles.lightEmptyTitle}>No workouts found</Text>
            <Text style={styles.lightEmptyDescription}>
              Adjust your filters or create a new custom workout to begin your training session.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? theme.colors.appBackground : "#F6F2EF",
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
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
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 10,
      marginBottom: 2,
    },
    lightTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    lightScreenTitle: {
      color: "#1560C8",
      fontSize: 22,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    lightNotificationButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
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
    lightHeaderBlock: {
      gap: 14,
    },
    lightSectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    lightLibraryHeading: {
      color: "#2364D0",
      fontSize: 26,
      fontWeight: "700",
    },
    lightAddButton: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: "#2B73E2",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#2B73E2",
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    lightSearchBox: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: "#BCC7D9",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      gap: 8,
    },
    lightSearchInput: {
      flex: 1,
      color: "#2B2B2B",
      fontSize: 15,
      paddingVertical: 0,
    },
    lightFilterHeadingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    lightFilterLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lightFilterLabel: {
      color: "#5F6A7F",
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    lightResetText: {
      color: "#206BE0",
      fontSize: 12,
      fontWeight: "700",
    },
    lightChipRow: {
      gap: 10,
      paddingRight: 20,
    },
    lightFilterChip: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#BCC7D9",
      backgroundColor: "#F6F2EF",
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    lightFilterChipActive: {
      backgroundColor: "#2364D0",
      borderColor: "#2364D0",
    },
    lightFilterChipText: {
      color: "#585F70",
      fontSize: 12,
      fontWeight: "700",
    },
    lightFilterChipTextActive: {
      color: "#FFFFFF",
    },
    lightCategoryChip: {
      minHeight: 36,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#BCC7D9",
      backgroundColor: "#F6F2EF",
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    lightCategoryChipActive: {
      backgroundColor: "#EAF1FF",
      borderColor: "#2364D0",
    },
    lightCategoryChipText: {
      color: "#585F70",
      fontSize: 12,
      fontWeight: "700",
    },
    lightCategoryChipTextActive: {
      color: "#2364D0",
    },
    card: {
      backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : "#FFFFFF",
      borderRadius: isDarkTheme ? 18 : 12,
      padding: isDarkTheme ? 18 : 20,
      gap: 14,
      borderWidth: 1,
      borderColor: isDarkTheme ? theme.colors.border : "#C5D1E5",
      elevation: isDarkTheme ? 2 : 0,
    },
    lightWorkoutCard: {
      gap: 12,
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
    lightWorkoutTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    lightBadgeRow: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
    },
    lightMiniBadgeWarm: {
      backgroundColor: "#F7D89A",
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    lightMiniBadgeWarmText: {
      color: "#3D3322",
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    lightMiniBadgeCool: {
      backgroundColor: "#D4E3FB",
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    lightMiniBadgeCoolText: {
      color: "#405A86",
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
      fontSize: isDarkTheme ? 24 : 22,
      fontWeight: "800",
      textTransform: isDarkTheme ? "uppercase" : "none",
      lineHeight: isDarkTheme ? undefined : 31,
    },
    cardDescription: {
      color: theme.colors.textSecondary,
      fontSize: isDarkTheme ? 15 : 16,
      lineHeight: isDarkTheme ? 21 : 22,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    metaPill: {
      width: "47%",
      backgroundColor: "#1A191C",
      borderRadius: 0,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 4,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.03)",
    },
    metaLabel: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    metaValue: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    metaValueAccent: {
      color: theme.colors.primary,
    },
    lightMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      flexWrap: "wrap",
    },
    lightInlineMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lightInlineMetaText: {
      color: "#516C95",
      fontSize: 14,
      fontWeight: "600",
    },
    lightLastDoneText: {
      marginLeft: "auto",
      color: "#7B8190",
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    expandedSection: {
      gap: 12,
      paddingTop: 4,
    },
    lightExpandedSection: {
      paddingTop: 0,
    },
    lightDivider: {
      height: 1,
      backgroundColor: "#D8E0ED",
      marginBottom: 2,
    },
    exerciseCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#1A191C",
      borderRadius: 10,
      padding: 14,
      gap: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.03)",
    },
    lightExerciseCard: {
      backgroundColor: "#F5F2EF",
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#E1DCD5",
      paddingHorizontal: 14,
      paddingVertical: 14,
      alignItems: "flex-start",
    },
    exerciseMedia: {
      width: 38,
      height: 38,
    },
    exerciseThumb: {
      width: 38,
      height: 38,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: theme.colors.cardElevated,
    },
    exerciseThumbImage: {
      borderRadius: 6,
    },
    exerciseThumbOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(6, 12, 14, 0.35)",
    },
    exerciseBody: {
      flex: 1,
      gap: 4,
    },
    exerciseHeader: {
      gap: 6,
    },
    exerciseTitle: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    exerciseTarget: {
      color: theme.colors.textPrimary,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    exerciseDescription: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      lineHeight: 15,
    },
    exerciseAction: {
      width: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    lightExerciseIndex: {
      color: "#206BE0",
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 34,
      minWidth: 34,
    },
    lightExerciseBody: {
      flex: 1,
      gap: 2,
    },
    lightExerciseTitle: {
      color: "#2B2B2B",
      fontSize: 17,
      fontWeight: "700",
    },
    lightExerciseDescription: {
      color: "#515764",
      fontSize: 14,
      lineHeight: 20,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    lightActionsRow: {
      flexDirection: "row",
      gap: 10,
      paddingTop: 4,
    },
    buttonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      flex: 1.4,
    },
    primaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 15,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    ghostButton: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.cardElevated,
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
    lightStartButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 4,
      backgroundColor: "#206BE0",
      alignItems: "center",
      justifyContent: "center",
    },
    lightStartButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
      letterSpacing: 0.4,
    },
    lightIconAction: {
      width: 50,
      minWidth: 50,
      minHeight: 48,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#BFCBE0",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    lightCollapsedFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingTop: 4,
    },
    lightQuickStartButton: {
      minHeight: 38,
      borderRadius: 4,
      backgroundColor: "#EAF1FF",
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    lightQuickStartText: {
      color: "#206BE0",
      fontSize: 14,
      fontWeight: "800",
    },
    lightEmptyState: {
      alignItems: "center",
      gap: 12,
      paddingTop: 44,
      paddingBottom: 36,
    },
    lightEmptyTitle: {
      color: "#A0A0A6",
      fontSize: 20,
      fontWeight: "700",
      textTransform: "none",
    },
    lightEmptyDescription: {
      maxWidth: 260,
      color: "#A0A0A6",
      fontSize: 14,
      lineHeight: 24,
      textAlign: "center",
    },
  });
}
