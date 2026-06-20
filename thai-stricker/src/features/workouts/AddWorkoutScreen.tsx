import { useEffect, useState } from "react";
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

type AddWorkoutScreenProps = {
  theme: AppTheme;
  availableExercises: MockAvailableExercise[];
  maxExercisesPerWorkout: number;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  restSecondsBetweenExercises: number;
  defaultRepsExerciseDurationMinutes: number;
  onAddAvailableExercise: (exercise: MockAvailableExercise) => void;
  onUpdateAvailableExercise: (exercise: MockAvailableExercise) => void;
  onBackToWorkouts: () => void;
  onAddWorkout: (workout: MockWorkout) => void;
};

type AddWorkoutMode =
  | { type: "form" }
  | { type: "addExercise" }
  | { type: "editExercise"; exerciseId: string };

type OptionGroupVariant = "segmented" | "chip";

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
    <View style={variant === "segmented" ? styles.segmentedGroup : styles.chipGroup}>
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
              {variant === "segmented" ? option.toUpperCase() : option}
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
  const setCount = difficulty === "Advanced" ? 5 : difficulty === "Intermediate" ? 3 : 1;

  if (target.type === "duration") {
    const durationLabel =
      target.seconds >= 60 ? `${Math.round(target.seconds / 60)} mins` : `${target.seconds} sec`;

    return `${setCount} rounds / ${durationLabel}`;
  }

  return `${setCount} sets / ${target.reps} reps`;
}

export function AddWorkoutScreen({
  theme,
  availableExercises,
  maxExercisesPerWorkout,
  numberOfExercisesPerPage,
  restSecondsBetweenExercises,
  defaultRepsExerciseDurationMinutes,
  onAddAvailableExercise,
  onUpdateAvailableExercise,
  onBackToWorkouts,
  onAddWorkout,
}: AddWorkoutScreenProps) {
  const styles = getStyles(theme);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<MockWorkoutDifficulty>("Beginner");
  const [category, setCategory] = useState<MockWorkoutCategory>("Fundamentals");
  const [exercises, setExercises] = useState<MockExercise[]>([]);
  const [availableExercisesPage, setAvailableExercisesPage] = useState(1);
  const [mode, setMode] = useState<AddWorkoutMode>({ type: "form" });
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

  const handleOpenAddExercise = () => {
    setMode({ type: "addExercise" });
  };

  const handleAddExercise = (exercise: MockAvailableExercise) => {
    if (exercises.length >= maxExercisesPerWorkout) {
      setSelectionErrorMessage(`Maximum ${maxExercisesPerWorkout} exercises allowed by Settings.`);
      return;
    }

    setExercises((currentExercises) => [
      ...currentExercises,
      {
        id: `exercise-draft-${Date.now()}-${currentExercises.length}`,
        title: exercise.title,
        description: exercise.description,
        help: exercise.help,
        target: exercise.target,
      },
    ]);
    setSelectionErrorMessage(null);
    setWorkoutErrorMessage(null);
  };

  const handleOpenEditExercise = (exerciseId: string) => {
    setMode({ type: "editExercise", exerciseId });
  };

  const handleBackToAddWorkoutForm = () => {
    setMode({ type: "form" });
  };

  const handleSaveEditedExercise = (updatedExercise: MockAvailableExercise) => {
    onUpdateAvailableExercise(updatedExercise);
    setMode({ type: "form" });
  };

  const handleSaveAddedExercise = (newExercise: MockAvailableExercise) => {
    onAddAvailableExercise(newExercise);
    const nextExercisesLength = availableExercises.length + 1;
    const finalPage = Math.max(1, Math.ceil(nextExercisesLength / numberOfExercisesPerPage));
    setAvailableExercisesPage(finalPage);
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

    const timestamp = Date.now();
    const workout: MockWorkout = {
      id: `workout-${timestamp}`,
      title: title.trim(),
      description: description.trim(),
      difficulty,
      category,
      totalDurationMinutes: calculatedTotalDurationMinutes,
      restSecondsBetweenExercises,
      exercises: exercises.map((exercise, index) => ({
        ...exercise,
        id: `exercise-${timestamp}-${index}`,
      })),
      lastDoneDate: undefined,
    };

    setTitle("");
    setDescription("");
    setDifficulty("Beginner");
    setCategory("Fundamentals");
    setExercises([]);
    setWorkoutErrorMessage(null);
    setSelectionErrorMessage(null);
    onAddWorkout(workout);
  };

  const activeExercise =
    mode.type === "editExercise"
      ? availableExercises.find((exercise) => exercise.id === mode.exerciseId) ?? null
      : null;

  if (mode.type === "addExercise") {
    return (
      <AddExerciseScreen
        theme={theme}
        onBackToAddWorkout={handleBackToAddWorkoutForm}
        onSaveExercise={handleSaveAddedExercise}
      />
    );
  }

  if (mode.type === "editExercise" && activeExercise) {
    return (
      <EditExerciseScreen
        theme={theme}
        exercise={activeExercise}
        onBackToAddWorkout={handleBackToAddWorkoutForm}
        onSaveExercise={handleSaveEditedExercise}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={onBackToWorkouts} style={styles.backButton}>
            <GoogleMaterialSymbol
              color={theme.colors.textPrimary}
              fallbackName="arrow-back"
              name="arrow_back"
              size={22}
            />
          </Pressable>
          <Text style={styles.pageTitle}>Add Workout</Text>
          <View style={styles.boltBadge}>
            <GoogleMaterialSymbol
              color={theme.colors.primary}
              fallbackName="bolt"
              name="bolt"
              size={18}
            />
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Workout title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Heavy Bag Power Drills"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.textInput}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Focus on hip rotation and maximum impact..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            textAlignVertical="top"
            style={[styles.textInput, styles.multilineInput]}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Difficulty</Text>
          <OptionGroup
            options={MOCK_WORKOUT_DIFFICULTIES}
            selectedValue={difficulty}
            onSelect={setDifficulty}
            theme={theme}
            variant="segmented"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Duration</Text>
          <View style={styles.durationDisplay}>
            <Text style={styles.durationValue}>{calculatedTotalDurationMinutes} mins</Text>
            <Text style={styles.durationMeta}>(Calculated)</Text>
          </View>
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Categories</Text>
          <OptionGroup
            options={MOCK_WORKOUT_CATEGORIES}
            selectedValue={category}
            onSelect={setCategory}
            theme={theme}
            variant="chip"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exercise Library</Text>
          <View style={styles.sectionToolbar}>
            <Text style={styles.helperText}>Select drills from our curated library.</Text>
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

          <View style={styles.libraryPanel}>
            <View style={styles.paginationRow}>
              <Text style={styles.paginationText}>
                Page {availableExercisesPage} of {totalAvailableExercisePages}
              </Text>
              <View style={styles.paginationActions}>
                <Pressable
                  onPress={() =>
                    setAvailableExercisesPage((currentPage) => Math.max(1, currentPage - 1))
                  }
                  disabled={availableExercisesPage === 1}
                  style={styles.navIconButton}
                >
                  <GoogleMaterialSymbol
                    color={availableExercisesPage === 1 ? theme.colors.textMuted : theme.colors.textSecondary}
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
                  style={styles.navIconButton}
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

            <Text style={styles.libraryFooterText}>Max exercises allowed: {maxExercisesPerWorkout}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.selectedHeader}>
            <Text style={styles.sectionTitle}>Selected drills</Text>
            <View style={styles.selectedCountBadge}>
              <Text style={styles.selectedCountBadgeText}>
                {exercises.length} / {maxExercisesPerWorkout}
              </Text>
            </View>
          </View>

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
                    <Text style={styles.selectedMetaText}>
                      {formatSelectedExerciseMeta(exercise.target, difficulty).toUpperCase()}
                    </Text>
                  </View>

                  <Pressable onPress={() => handleRemoveExercise(exercise.id)} style={styles.deleteButton}>
                    <GoogleMaterialSymbol
                      color={theme.colors.textMuted}
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

        {workoutErrorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Workout error</Text>
            <Text style={styles.errorText}>{workoutErrorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable onPress={onBackToWorkouts} style={styles.secondaryActionButton}>
            <Text style={styles.secondaryActionButtonText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={handleSaveWorkout} style={styles.primaryActionButton}>
            <Text style={styles.primaryActionButtonText}>Save</Text>
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
      paddingHorizontal: 14,
      paddingTop: 16,
      paddingBottom: 16,
      gap: 20,
      backgroundColor: isDarkTheme ? "#141416" : theme.colors.appBackground,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? "#34363A" : theme.colors.border,
      paddingBottom: 14,
      marginBottom: 4,
    },
    backButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    pageTitle: {
      color: theme.colors.textPrimary,
      fontSize: 26,
      fontWeight: "800",
      textTransform: "uppercase",
      flex: 1,
      marginLeft: 12,
    },
    boltBadge: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    fieldBlock: {
      gap: 10,
    },
    fieldLabel: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.8,
    },
    textInput: {
      minHeight: 48,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#46575C" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#19181B" : theme.colors.inputBackground,
      paddingHorizontal: 16,
      paddingVertical: 14,
      color: theme.colors.textPrimary,
      fontSize: 17,
      lineHeight: 24,
    },
    multilineInput: {
      minHeight: 92,
    },
    segmentedGroup: {
      flexDirection: "row",
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#46575C" : theme.colors.inputBorder,
      overflow: "hidden",
      backgroundColor: isDarkTheme ? "#1E1E21" : theme.colors.surface,
    },
    segmentedButton: {
      flex: 1,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      borderRightWidth: 1,
      borderRightColor: isDarkTheme ? "#46575C" : theme.colors.inputBorder,
      paddingHorizontal: 8,
    },
    segmentedButtonSelected: {
      backgroundColor: isDarkTheme ? "#3B3B40" : theme.colors.surfaceMuted,
    },
    segmentedButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.9,
    },
    segmentedButtonTextSelected: {
      color: theme.colors.textPrimary,
    },
    durationDisplay: {
      minHeight: 98,
      borderRadius: 8,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: isDarkTheme ? "#56656A" : theme.colors.border,
      backgroundColor: isDarkTheme ? "#221F21" : theme.colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    durationValue: {
      color: theme.colors.primary,
      fontSize: 22,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    durationMeta: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      opacity: 0.8,
    },
    chipGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    chipButton: {
      minHeight: 30,
      paddingHorizontal: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#202023" : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    chipButtonSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: isDarkTheme ? "#102226" : theme.colors.surface,
      shadowColor: theme.colors.primary,
      shadowOpacity: isDarkTheme ? 0.3 : 0,
      shadowRadius: 8,
      elevation: isDarkTheme ? 3 : 0,
    },
    chipButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
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
    sectionToolbar: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    helperText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },
    inlineAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingTop: 2,
    },
    inlineActionText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    errorBox: {
      borderRadius: 8,
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
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#47585D" : theme.colors.border,
      backgroundColor: isDarkTheme ? "#1F1E21" : theme.colors.card,
      overflow: "hidden",
      paddingBottom: 10,
    },
    paginationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? "#34363A" : theme.colors.border,
    },
    paginationText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.1,
    },
    paginationActions: {
      flexDirection: "row",
      gap: 10,
    },
    navIconButton: {
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    libraryItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    libraryThumb: {
      width: 70,
      height: 70,
      borderRadius: 6,
      overflow: "hidden",
      backgroundColor: theme.colors.cardElevated,
    },
    libraryThumbImage: {
      borderRadius: 6,
    },
    libraryThumbOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(0, 0, 0, 0.35)",
    },
    libraryCopy: {
      flex: 1,
      gap: 4,
    },
    libraryItemTitle: {
      color: theme.colors.textPrimary,
      fontSize: 17,
      fontWeight: "700",
    },
    libraryItemDescription: {
      color: theme.colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
    },
    libraryActions: {
      gap: 8,
      alignItems: "stretch",
    },
    libraryAddButton: {
      minWidth: 54,
      minHeight: 30,
      borderRadius: 4,
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
      minWidth: 54,
      minHeight: 30,
      borderRadius: 4,
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
    libraryFooterText: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
      marginTop: 4,
    },
    selectedHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? "#2A2B2E" : theme.colors.border,
    },
    selectedCountBadge: {
      minWidth: 72,
      minHeight: 28,
      borderRadius: 6,
      backgroundColor: isDarkTheme ? "#34363A" : theme.colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    selectedCountBadgeText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    emptyState: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#47585D" : theme.colors.border,
      padding: 16,
      backgroundColor: isDarkTheme ? "#1F1E21" : theme.colors.surfaceMuted,
    },
    emptyStateText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
    },
    selectedCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#47585D" : theme.colors.border,
      backgroundColor: isDarkTheme ? "#1C1D20" : theme.colors.card,
      padding: 14,
    },
    selectedCardTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    selectedIndexBadge: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: isDarkTheme ? 0.28 : 0,
      shadowRadius: 10,
      elevation: isDarkTheme ? 4 : 0,
    },
    selectedIndexBadgeText: {
      color: theme.colors.primaryText,
      fontSize: 18,
      fontWeight: "800",
    },
    selectedCopy: {
      flex: 1,
      gap: 6,
    },
    selectedTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    selectedMetaText: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    deleteButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    actionsRow: {
      flexDirection: "row",
      gap: 14,
      paddingTop: 6,
    },
    secondaryActionButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: isDarkTheme ? "#56656A" : theme.colors.inputBorder,
      backgroundColor: isDarkTheme ? "#19181B" : theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryActionButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    primaryActionButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    primaryActionButtonText: {
      color: theme.colors.primaryText,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.9,
    },
  });
}
