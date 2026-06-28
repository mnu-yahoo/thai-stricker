import { useEffect, useState } from "react";
import {
  Alert,
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
import { AddExerciseScreen } from "../exercises/AddExerciseScreen";
import { EditExerciseScreen } from "../exercises/EditExerciseScreen";
import { type MockAvailableExercise } from "../exercises/exerciseMocks";
import { type NumberOfExercisesPerPageOption } from "../settings/SettingsScreen";
import {
  MOCK_WORKOUT_CATEGORIES,
  MOCK_WORKOUT_DIFFICULTIES,
  type MockExercise,
  type MockExerciseTarget,
  type MockWorkout,
  type MockWorkoutCategory,
  type MockWorkoutDifficulty,
} from "./workoutMocks";

const EXERCISE_THUMB_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

type OptionGroupVariant = "segmented" | "chip";

type EditWorkoutMode =
  | { type: "form" }
  | { type: "addExercise" }
  | { type: "editExercise"; exerciseId: string };

type EditWorkoutScreenProps = {
  theme: AppTheme;
  availableExercises: MockAvailableExercise[];
  workout: MockWorkout | null;
  maxExercisesPerWorkout: number;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  restSecondsBetweenExercises: number;
  defaultRepsExerciseDurationMinutes: number;
  onAddAvailableExercise: (exercise: MockAvailableExercise) => void;
  onUpdateAvailableExercise: (exercise: MockAvailableExercise) => void;
  onBackToWorkouts: () => void;
  onSaveWorkout: (workout: MockWorkout) => void;
};

function OptionGroup<T extends string>({
  options,
  selectedValue,
  onSelect,
  theme,
  variant,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  theme: AppTheme;
  variant: OptionGroupVariant;
}) {
  const styles = getStyles(theme);

  return (
    <View
      style={variant === "segmented" ? styles.segmentedGroup : styles.chipGroup}
    >
      {options.map((option) => {
        const isSelected = option === selectedValue;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[
              variant === "segmented" ? styles.segmentedButton : styles.chipButton,
              isSelected
                ? variant === "segmented"
                  ? styles.segmentedButtonSelected
                  : styles.chipButtonSelected
                : undefined,
            ]}
          >
            <Text
              style={[
                variant === "segmented" ? styles.segmentedButtonText : styles.chipButtonText,
                isSelected
                  ? variant === "segmented"
                    ? styles.segmentedButtonTextSelected
                    : styles.chipButtonTextSelected
                  : undefined,
              ]}
            >
              {variant === "segmented" ? option.slice(0, 3).toUpperCase() : option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function formatExerciseTarget(target: MockExerciseTarget) {
  if (target.type === "duration") {
    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

function calculateWorkoutTotalDurationMinutes(
  exercises: MockExercise[],
  restSecondsBetweenExercises: number,
  defaultRepsExerciseDurationMinutes: number,
) {
  const exerciseDurationTotalSeconds = exercises.reduce((totalSeconds, exercise) => {
    if (exercise.target.type === "duration") {
      return totalSeconds + exercise.target.seconds;
    }

    return totalSeconds + defaultRepsExerciseDurationMinutes * 60;
  }, 0);

  const restTotalSeconds = Math.max(exercises.length - 1, 0) * restSecondsBetweenExercises;

  return Math.ceil((exerciseDurationTotalSeconds + restTotalSeconds) / 60);
}

function formatSelectedExerciseMeta(
  target: MockExerciseTarget,
  difficulty: MockWorkoutDifficulty,
) {
  const repetitionBlocks =
    difficulty === "Advanced" ? 5 : difficulty === "Intermediate" ? 3 : 1;

  if (target.type === "duration") {
    const durationLabel =
      target.seconds >= 60 ? `${Math.round(target.seconds / 60)} min` : `${target.seconds} sec`;

    return `${repetitionBlocks} rounds / ${durationLabel}`;
  }

  return `${repetitionBlocks} sets / ${target.reps} reps`;
}

export function EditWorkoutScreen({
  theme,
  availableExercises,
  workout,
  maxExercisesPerWorkout,
  numberOfExercisesPerPage,
  restSecondsBetweenExercises,
  defaultRepsExerciseDurationMinutes,
  onAddAvailableExercise,
  onUpdateAvailableExercise,
  onBackToWorkouts,
  onSaveWorkout,
}: EditWorkoutScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
  const [title, setTitle] = useState(workout?.title ?? "");
  const [description, setDescription] = useState(workout?.description ?? "");
  const [difficulty, setDifficulty] = useState<MockWorkoutDifficulty>(
    workout?.difficulty ?? "Beginner",
  );
  const [category, setCategory] = useState<MockWorkoutCategory>(
    workout?.category ?? "Fundamentals",
  );
  const [exercises, setExercises] = useState<MockExercise[]>(workout?.exercises ?? []);
  const [availableExercisesPage, setAvailableExercisesPage] = useState(1);
  const [mode, setMode] = useState<EditWorkoutMode>({ type: "form" });
  const [workoutErrorMessage, setWorkoutErrorMessage] = useState<string | null>(null);
  const [selectionErrorMessage, setSelectionErrorMessage] = useState<string | null>(null);
  const calculatedTotalDurationMinutes = calculateWorkoutTotalDurationMinutes(
    exercises,
    restSecondsBetweenExercises,
    defaultRepsExerciseDurationMinutes,
  );
  const totalAvailableExercisePages = Math.max(
    1,
    Math.ceil(availableExercises.length / numberOfExercisesPerPage),
  );
  const availableExercisesStartIndex = (availableExercisesPage - 1) * numberOfExercisesPerPage;
  const visibleAvailableExercises = availableExercises.slice(
    availableExercisesStartIndex,
    availableExercisesStartIndex + numberOfExercisesPerPage,
  );

  useEffect(() => {
    setAvailableExercisesPage((currentPage) => Math.min(currentPage, totalAvailableExercisePages));
  }, [totalAvailableExercisePages]);

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

  const handleOpenAddExercise = () => {
    setMode({ type: "addExercise" });
  };

  const handleOpenEditExercise = (exerciseId: string) => {
    setMode({ type: "editExercise", exerciseId });
  };

  const handleAddExercise = (exercise: MockAvailableExercise) => {
    if (exercises.length >= maxExercisesPerWorkout) {
      setSelectionErrorMessage(`Maximum ${maxExercisesPerWorkout} exercises allowed by Settings.`);
      return;
    }

    setExercises((currentExercises) => [
      ...currentExercises,
      {
        id: `exercise-edit-${Date.now()}-${currentExercises.length}`,
        title: exercise.title,
        description: exercise.description,
        help: exercise.help,
        target: exercise.target,
      },
    ]);
    setSelectionErrorMessage(null);
    setWorkoutErrorMessage(null);
  };

  const handleBackToEditWorkoutForm = () => {
    setMode({ type: "form" });
  };

  const handleSaveAddedExercise = (newExercise: MockAvailableExercise) => {
    onAddAvailableExercise(newExercise);
    const nextExercisesLength = availableExercises.length + 1;
    const finalPage = Math.max(1, Math.ceil(nextExercisesLength / numberOfExercisesPerPage));
    setAvailableExercisesPage(finalPage);
    setMode({ type: "form" });
  };

  const handleSaveEditedExercise = (updatedExercise: MockAvailableExercise) => {
    onUpdateAvailableExercise(updatedExercise);
    setMode({ type: "form" });
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises((currentExercises) =>
      currentExercises.filter((exercise) => exercise.id !== exerciseId),
    );
  };

  const handleSaveWorkout = () => {
    if (!title.trim()) {
      setWorkoutErrorMessage("Workout title is required.");
      return;
    }

    if (!description.trim()) {
      setWorkoutErrorMessage("Workout description is required.");
      return;
    }

    if (exercises.length < 1) {
      setWorkoutErrorMessage("Add at least one exercise before saving.");
      return;
    }

    if (exercises.length > maxExercisesPerWorkout) {
      setWorkoutErrorMessage(`Maximum ${maxExercisesPerWorkout} exercises allowed by Settings.`);
      return;
    }

    onSaveWorkout({
      ...workout,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      category,
      totalDurationMinutes: calculatedTotalDurationMinutes,
      restSecondsBetweenExercises,
      exercises,
    });
  };

  const activeExercise =
    mode.type === "editExercise"
      ? availableExercises.find((exercise) => exercise.id === mode.exerciseId) ?? null
      : null;

  if (mode.type === "addExercise") {
    return (
      <AddExerciseScreen
        theme={theme}
        onBackToAddWorkout={handleBackToEditWorkoutForm}
        onSaveExercise={handleSaveAddedExercise}
      />
    );
  }

  if (mode.type === "editExercise" && activeExercise) {
    return (
      <EditExerciseScreen
        theme={theme}
        exercise={activeExercise}
        onBackToAddWorkout={handleBackToEditWorkoutForm}
        onSaveExercise={handleSaveEditedExercise}
      />
    );
  }

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
            <Text style={styles.lightTopTitle}>Edit Workout</Text>
            <Pressable style={styles.lightIconButton}>
              <GoogleMaterialSymbol
                color="#1560C8"
                fallbackName="settings"
                name="settings"
                size={24}
              />
            </Pressable>
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Private coaching app</Text>
          <Text style={styles.screenTitle}>{isDarkTheme ? "EDIT WORKOUT" : "Edit Workout"}</Text>
          {!isDarkTheme ? (
            <Text style={styles.lightHeaderSupport}>
              Fine-tune your title, structure, and drill selection before saving the session.
            </Text>
          ) : null}
        </View>

        <View style={!isDarkTheme ? styles.lightPanelCard : undefined}>
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Workout title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter workout title"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the goal of this workout"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              style={[styles.textInput, styles.multilineInput]}
            />
          </View>

          {!isDarkTheme ? <View style={styles.lightDivider} /> : null}

          <View style={styles.metricsRow}>
            <View style={styles.metricsColumn}>
              <Text style={styles.fieldLabel}>Difficulty</Text>
              <OptionGroup
                options={MOCK_WORKOUT_DIFFICULTIES}
                selectedValue={difficulty}
                onSelect={setDifficulty}
                theme={theme}
                variant="segmented"
              />
            </View>

            <View style={styles.durationColumn}>
              <Text style={styles.fieldLabel}>Duration</Text>
              <View style={styles.durationDisplay}>
                <Text style={styles.durationDisplayText}>{calculatedTotalDurationMinutes} mins</Text>
              </View>
            </View>
          </View>

          {!isDarkTheme ? <View style={styles.lightDivider} /> : null}

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Category</Text>
            <OptionGroup
              options={MOCK_WORKOUT_CATEGORIES}
              selectedValue={category}
              onSelect={setCategory}
              theme={theme}
              variant="chip"
            />
          </View>
        </View>

        <View style={styles.section}>
          {!isDarkTheme ? (
            <View style={styles.lightSectionTitleRow}>
              <GoogleMaterialSymbol
                color="#1560C8"
                fallbackName="library-books"
                name="library_books"
                size={22}
              />
              <Text style={styles.lightSectionTitle}>Exercise Library</Text>
            </View>
          ) : (
            <Text style={styles.sectionTitle}>Exercise library</Text>
          )}
          <View style={!isDarkTheme ? styles.lightPanelCard : undefined}>
            <View style={styles.sectionToolbar}>
              <Text style={styles.sectionMetaText}>Max exercises allowed: {maxExercisesPerWorkout}</Text>
              <Pressable onPress={handleOpenAddExercise} style={styles.inlineAction}>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="add-circle-outline"
                  name="add_circle"
                  size={16}
                />
                <Text style={styles.inlineActionText}>Add new drill</Text>
              </Pressable>
            </View>

            {selectionErrorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Selection error</Text>
                <Text style={styles.errorText}>{selectionErrorMessage}</Text>
              </View>
            ) : null}

            {!isDarkTheme ? <View style={styles.lightDivider} /> : null}

            <View style={styles.libraryPanel}>
              <View style={styles.libraryHeader}>
                <Text style={styles.libraryPageText}>
                  Page {availableExercisesPage} of {totalAvailableExercisePages}
                </Text>
                <View style={styles.libraryNav}>
                  <Pressable
                    onPress={() =>
                      setAvailableExercisesPage((currentPage) => Math.max(1, currentPage - 1))
                    }
                    disabled={availableExercisesPage === 1}
                    style={[
                      styles.libraryNavButton,
                      availableExercisesPage === 1 ? styles.libraryNavButtonDisabled : undefined,
                    ]}
                  >
                    <GoogleMaterialSymbol
                      color={
                        availableExercisesPage === 1 ? theme.colors.textMuted : theme.colors.textPrimary
                      }
                      fallbackName="chevron-left"
                      name="chevron_left"
                      size={18}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      setAvailableExercisesPage((currentPage) =>
                        Math.min(totalAvailableExercisePages, currentPage + 1),
                      )
                    }
                    disabled={availableExercisesPage === totalAvailableExercisePages}
                    style={[
                      styles.libraryNavButton,
                      availableExercisesPage === totalAvailableExercisePages
                        ? styles.libraryNavButtonDisabled
                        : undefined,
                    ]}
                  >
                    <GoogleMaterialSymbol
                      color={
                        availableExercisesPage === totalAvailableExercisePages
                          ? theme.colors.textMuted
                          : theme.colors.primary
                      }
                      fallbackName="chevron-right"
                      name="chevron_right"
                      size={18}
                    />
                  </Pressable>
                </View>
              </View>

              {visibleAvailableExercises.map((exercise) => {
                const isAtLimit = exercises.length >= maxExercisesPerWorkout;

                return (
                  <View key={exercise.id} style={styles.libraryItem}>
                    <ImageBackground
                      imageStyle={styles.libraryThumbImage}
                      source={{ uri: EXERCISE_THUMB_URI }}
                      style={styles.libraryThumb}
                    >
                      <View style={styles.libraryThumbOverlay} />
                    </ImageBackground>

                    <View style={styles.libraryCopy}>
                      <Text numberOfLines={1} style={styles.libraryItemTitle}>
                        {exercise.title}
                      </Text>
                      <Text numberOfLines={2} style={styles.libraryItemDescription}>
                        {exercise.description}
                      </Text>
                    </View>

                    <View style={styles.libraryActions}>
                      <Pressable
                        onPress={() => handleAddExercise(exercise)}
                        disabled={isAtLimit}
                        style={[
                          styles.libraryAddButton,
                          isAtLimit ? styles.libraryAddButtonDisabled : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.libraryAddButtonText,
                            isAtLimit ? styles.libraryAddButtonTextDisabled : undefined,
                          ]}
                        >
                          Add
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleOpenEditExercise(exercise.id)}
                        style={styles.libraryEditButton}
                      >
                        <Text style={styles.libraryEditButtonText}>Edit</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {!isDarkTheme ? (
            <View style={styles.lightSectionTitleRow}>
              <GoogleMaterialSymbol
                color="#1560C8"
                fallbackName="checklist"
                name="checklist"
                size={22}
              />
              <Text style={styles.lightSectionTitle}>Selected Drills</Text>
            </View>
          ) : null}
          <View style={!isDarkTheme ? styles.lightPanelCard : undefined}>
            <View style={styles.selectedHeader}>
              {isDarkTheme ? <Text style={styles.sectionTitle}>Selected drills</Text> : <View />}
              <View style={styles.selectedCountBadge}>
                <Text style={styles.selectedCountBadgeText}>
                  {exercises.length} / {maxExercisesPerWorkout}
                </Text>
              </View>
            </View>

            {!isDarkTheme ? <View style={styles.lightDivider} /> : null}

            {exercises.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No exercises added yet.</Text>
              </View>
            ) : (
              exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.selectedCard}>
                  <View style={styles.selectedCardTop}>
                    <View style={styles.selectedIndexBadge}>
                      <Text style={styles.selectedIndexBadgeText}>{index + 1}</Text>
                    </View>

                    <View style={styles.selectedCopy}>
                      <Text style={styles.selectedTitle}>{exercise.title}</Text>
                      <Text style={styles.selectedDescription}>{exercise.description}</Text>
                      <View style={styles.selectedMetaRow}>
                        <GoogleMaterialSymbol
                          color={theme.colors.primary}
                          fallbackName="loop"
                          name="autorenew"
                          size={15}
                        />
                        <Text style={styles.selectedMetaText}>
                          {formatSelectedExerciseMeta(exercise.target, difficulty)}
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => handleRemoveExercise(exercise.id)}
                      style={styles.deleteButton}
                    >
                      <GoogleMaterialSymbol
                        color={theme.colors.textPrimary}
                        fallbackName="delete-outline"
                        name="delete"
                        size={20}
                      />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {workoutErrorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Workout error</Text>
            <Text style={styles.errorText}>{workoutErrorMessage}</Text>
          </View>
        ) : null}

        <View style={!isDarkTheme ? styles.lightFooterActions : undefined}>
          <View style={styles.actionsRow}>
            <Pressable onPress={onBackToWorkouts} style={styles.secondaryActionButton}>
              <Text style={styles.secondaryActionButtonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={handleSaveWorkout} style={styles.primaryActionButton}>
              <Text style={styles.primaryActionButtonText}>Save</Text>
            </Pressable>
          </View>
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
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 24,
      gap: 22,
      backgroundColor: isDarkTheme ? "#141416" : theme.colors.appBackground,
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
      marginBottom: 2,
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
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? "#3F4D52" : "transparent",
      backgroundColor: isDarkTheme ? "#2E2E31" : "transparent",
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      gap: 8,
    },
    eyebrow: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    screenTitle: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: isDarkTheme ? -0.8 : 0,
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    lightHeaderSupport: {
      color: "#394B65",
      fontSize: 15,
      lineHeight: 22,
    },
    fieldBlock: {
      gap: 10,
    },
    fieldLabel: {
      color: isDarkTheme ? "#B8D1D5" : "#5B6D87",
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.8,
    },
    textInput: {
      minHeight: 52,
      borderRadius: isDarkTheme ? 4 : 10,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#42565B" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#1F1D20" : theme.colors.inputBackground,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.textPrimary,
      fontSize: 17,
      lineHeight: 25,
    },
    multilineInput: {
      minHeight: 100,
    },
    metricsRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 16,
    },
    metricsColumn: {
      flex: 1.35,
      gap: 10,
    },
    durationColumn: {
      flex: 0.75,
      gap: 10,
    },
    segmentedGroup: {
      flexDirection: "row",
      borderRadius: isDarkTheme ? 4 : 10,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? "#42565B" : theme.colors.inputBorder,
      overflow: "hidden",
      backgroundColor: isDarkTheme ? "#1B1A1D" : "#ECE7E4",
      padding: isDarkTheme ? 0 : 4,
      gap: isDarkTheme ? 0 : 4,
    },
    segmentedButton: {
      flex: 1,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center",
      borderRightWidth: isDarkTheme ? 1 : 0,
      borderRightColor: isDarkTheme ? "#42565B" : theme.colors.inputBorder,
      backgroundColor: "transparent",
      borderRadius: isDarkTheme ? 0 : 8,
    },
    segmentedButtonSelected: {
      backgroundColor: isDarkTheme ? theme.colors.primary : "#FFFFFF",
      borderWidth: isDarkTheme ? 0 : 1,
      borderColor: isDarkTheme ? "transparent" : "#C5D1E5",
      shadowColor: isDarkTheme ? "transparent" : "#000000",
      shadowOpacity: isDarkTheme ? 0 : 0.04,
      shadowRadius: isDarkTheme ? 0 : 4,
      shadowOffset: isDarkTheme ? undefined : { width: 0, height: 2 },
      elevation: isDarkTheme ? 0 : 1,
    },
    segmentedButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: isDarkTheme ? "800" : "600",
      letterSpacing: 0.8,
    },
    segmentedButtonTextSelected: {
      color: isDarkTheme ? theme.colors.primaryText : "#1560C8",
    },
    durationDisplay: {
      minHeight: 44,
      borderRadius: isDarkTheme ? 4 : 10,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDarkTheme ? "#58696E" : theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkTheme ? "#232125" : "#F6F2EF",
      paddingHorizontal: 12,
    },
    durationDisplayText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    chipGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    chipButton: {
      minHeight: isDarkTheme ? 32 : 38,
      paddingHorizontal: 14,
      borderRadius: isDarkTheme ? 14 : 19,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#202023" : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    chipButtonSelected: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: isDarkTheme ? 0.35 : 0,
      shadowRadius: 8,
      backgroundColor: isDarkTheme ? "#162A2D" : "#EAF2FF",
      elevation: isDarkTheme ? 3 : 0,
    },
    chipButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
    chipButtonTextSelected: {
      color: theme.colors.primary,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    lightSectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    lightSectionTitle: {
      color: "#1560C8",
      fontSize: 22,
      fontWeight: "700",
    },
    lightPanelCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#FFFFFF",
      padding: 14,
      gap: 14,
    },
    lightDivider: {
      height: 1,
      backgroundColor: "#D9E0EC",
    },
    sectionToolbar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    sectionMetaText: {
      color: isDarkTheme ? theme.colors.textPrimary : "#394B65",
      fontSize: 12,
      fontWeight: "500",
      textTransform: "none",
      letterSpacing: 1,
    },
    inlineAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    inlineActionText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    errorBox: {
      borderRadius: 6,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      backgroundColor: isDarkTheme ? "#24191C" : theme.colors.surfaceMuted,
      padding: 12,
      gap: 4,
    },
    errorTitle: {
      color: theme.colors.danger,
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 13,
      lineHeight: 18,
    },
    libraryPanel: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#42565B" : theme.colors.border,
      overflow: "hidden",
      backgroundColor: isDarkTheme ? "#1E1D20" : "#FBF9F7",
    },
    libraryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? "#42565B" : theme.colors.border,
    },
    libraryPageText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 1.1,
    },
    libraryNav: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    libraryNavButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    libraryNavButtonDisabled: {
      opacity: 0.5,
    },
    libraryItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? "#35464B" : theme.colors.border,
    },
    libraryThumb: {
      width: 68,
      height: 68,
      borderRadius: 2,
      overflow: "hidden",
      backgroundColor: theme.colors.cardElevated,
    },
    libraryThumbImage: {
      borderRadius: 2,
    },
    libraryThumbOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(4, 10, 12, 0.28)",
    },
    libraryCopy: {
      flex: 1,
      gap: 4,
    },
    libraryItemTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: "800",
    },
    libraryItemDescription: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    libraryActions: {
      gap: 8,
      alignItems: "stretch",
    },
    libraryAddButton: {
      minWidth: 50,
      minHeight: 30,
      borderRadius: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 10,
    },
    libraryAddButtonDisabled: {
      backgroundColor: theme.colors.border,
    },
    libraryAddButtonText: {
      color: theme.colors.primaryText,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    libraryAddButtonTextDisabled: {
      color: theme.colors.textMuted,
    },
    libraryEditButton: {
      minWidth: 50,
      minHeight: 30,
      borderRadius: 2,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.inputBorder,
      backgroundColor: "transparent",
      paddingHorizontal: 10,
    },
    libraryEditButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    selectedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    selectedCountBadge: {
      minWidth: 90,
      minHeight: 42,
      borderRadius: isDarkTheme ? 2 : 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.border,
      backgroundColor: isDarkTheme ? "#2B2B2F" : "#F6F2EF",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
    },
    selectedCountBadgeText: {
      color: theme.colors.primary,
      fontSize: isDarkTheme ? 17 : 15,
      fontWeight: "700",
      letterSpacing: isDarkTheme ? 2.2 : 0.6,
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    emptyState: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#42565B" : theme.colors.border,
      padding: 18,
      backgroundColor: isDarkTheme ? "#1E1D20" : theme.colors.surfaceMuted,
    },
    emptyStateText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    selectedCard: {
      borderRadius: isDarkTheme ? 8 : 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#42565B" : theme.colors.border,
      backgroundColor: isDarkTheme ? "#1E1D20" : "#FBF9F7",
      padding: 16,
    },
    selectedCardTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 14,
    },
    selectedIndexBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: isDarkTheme ? 0.35 : 0,
      shadowRadius: 10,
      elevation: isDarkTheme ? 5 : 0,
    },
    selectedIndexBadgeText: {
      color: theme.colors.primaryText,
      fontSize: 17,
      fontWeight: "800",
    },
    selectedCopy: {
      flex: 1,
      gap: 6,
    },
    selectedTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: "800",
    },
    selectedDescription: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      lineHeight: 21,
      opacity: 0.9,
    },
    selectedMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    selectedMetaText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    deleteButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    actionsRow: {
      flexDirection: "row",
      gap: 16,
      paddingTop: isDarkTheme ? 18 : 0,
      paddingBottom: 4,
    },
    lightFooterActions: {
      paddingTop: 2,
      paddingBottom: 4,
    },
    secondaryActionButton: {
      flex: 1,
      minHeight: isDarkTheme ? 58 : 52,
      borderRadius: isDarkTheme ? 4 : 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#1F1D20" : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionButtonText: {
      color: theme.colors.textPrimary,
      fontSize: isDarkTheme ? 18 : 16,
      fontWeight: "800",
      textTransform: isDarkTheme ? "uppercase" : "none",
      letterSpacing: isDarkTheme ? 2 : 0.3,
    },
    primaryActionButton: {
      flex: 1,
      minHeight: isDarkTheme ? 58 : 52,
      borderRadius: isDarkTheme ? 4 : 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
      paddingHorizontal: 16,
    },
    primaryActionButtonText: {
      color: theme.colors.primaryText,
      fontSize: isDarkTheme ? 18 : 16,
      fontWeight: "800",
      textTransform: isDarkTheme ? "uppercase" : "none",
      letterSpacing: isDarkTheme ? 1.6 : 0.3,
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
