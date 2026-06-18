import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

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
import type { AppTheme } from "../../styles/theme";

type EditWorkoutScreenProps = {
  theme: AppTheme;
  availableExercises: MockAvailableExercise[];
  workout: MockWorkout | null;
  maxExercisesPerWorkout: number;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  restSecondsBetweenExercises: number;
  defaultRepsExerciseDurationMinutes: number;
  onBackToWorkouts: () => void;
  onSaveWorkout: (workout: MockWorkout) => void;
};

function OptionGroup<T extends string>({
  options,
  selectedValue,
  onSelect,
  theme,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  theme: AppTheme;
}) {
  const styles = getStyles(theme);
  return (
    <View style={styles.optionGroup}>
      {options.map((option) => {
        const isSelected = option === selectedValue;

        return (
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            style={[styles.optionButton, isSelected ? styles.optionButtonSelected : undefined]}
          >
            <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}>
              {option}
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

  const restTotalSeconds =
    Math.max(exercises.length - 1, 0) * restSecondsBetweenExercises;

  return Math.ceil((exerciseDurationTotalSeconds + restTotalSeconds) / 60);
}

export function EditWorkoutScreen({
  theme,
  availableExercises,
  workout,
  maxExercisesPerWorkout,
  numberOfExercisesPerPage,
  restSecondsBetweenExercises,
  defaultRepsExerciseDurationMinutes,
  onBackToWorkouts,
  onSaveWorkout,
}: EditWorkoutScreenProps) {
  const styles = getStyles(theme);
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
  const availableExercisesStartIndex =
    (availableExercisesPage - 1) * numberOfExercisesPerPage;
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
          <Pressable onPress={onBackToWorkouts} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to workouts</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenAddExercisePlaceholder = () => {
    Alert.alert("Coming soon", "Add Exercise screen is not implemented yet.");
  };

  const handleOpenEditExercisePlaceholder = () => {
    Alert.alert("Coming soon", "Edit Exercise screen is not implemented yet.");
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Workout editing</Text>
          <Text style={styles.title}>Edit workout</Text>
          <Text style={styles.subtitle}>Update a mocked workout for the current session.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workout details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Workout title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter workout title"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldGroup}>
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

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Difficulty</Text>
            <OptionGroup
              options={MOCK_WORKOUT_DIFFICULTIES}
              selectedValue={difficulty}
              onSelect={setDifficulty}
              theme={theme}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <OptionGroup
              options={MOCK_WORKOUT_CATEGORIES}
              selectedValue={category}
              onSelect={setCategory}
              theme={theme}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Calculated total duration</Text>
            <View style={styles.readOnlyValue}>
              <Text style={styles.readOnlyValueText}>{calculatedTotalDurationMinutes} min</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Available exercises</Text>
          <Text style={styles.helperText}>
            Select from the mocked exercise library. Maximum exercises allowed by Settings:{" "}
            {maxExercisesPerWorkout}.
          </Text>

          {selectionErrorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>Selection error</Text>
              <Text style={styles.errorText}>{selectionErrorMessage}</Text>
            </View>
          ) : null}

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
                style={[
                  styles.paginationButton,
                  availableExercisesPage === 1 ? styles.paginationButtonDisabled : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    availableExercisesPage === 1
                      ? styles.paginationButtonTextDisabled
                      : undefined,
                  ]}
                >
                  Previous
                </Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  setAvailableExercisesPage((currentPage) =>
                    Math.min(totalAvailableExercisePages, currentPage + 1),
                  )
                }
                disabled={availableExercisesPage === totalAvailableExercisePages}
                style={[
                  styles.paginationButton,
                  availableExercisesPage === totalAvailableExercisePages
                    ? styles.paginationButtonDisabled
                    : undefined,
                ]}
              >
                <Text
                  style={[
                    styles.paginationButtonText,
                    availableExercisesPage === totalAvailableExercisePages
                      ? styles.paginationButtonTextDisabled
                      : undefined,
                  ]}
                >
                  Next
                </Text>
              </Pressable>
              <Pressable
                onPress={handleOpenAddExercisePlaceholder}
                style={styles.paginationButton}
              >
                <Text style={styles.paginationButtonText}>Add</Text>
              </Pressable>
            </View>
          </View>

          {visibleAvailableExercises.map((exercise) => {
            const isAtLimit = exercises.length >= maxExercisesPerWorkout;

            return (
              <View key={exercise.id} style={styles.availableExerciseCard}>
                <View style={styles.availableExerciseCopy}>
                  <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                  <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                </View>
                <View style={styles.availableExerciseActions}>
                  <Pressable
                    onPress={() => handleAddExercise(exercise)}
                    disabled={isAtLimit}
                    style={[
                      styles.secondaryButton,
                      styles.addExerciseButton,
                      isAtLimit ? styles.secondaryButtonDisabled : undefined,
                    ]}
                  >
                    <Text
                      style={[
                        styles.secondaryButtonText,
                        isAtLimit ? styles.secondaryButtonTextDisabled : undefined,
                      ]}
                    >
                      Add
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleOpenEditExercisePlaceholder}
                    style={[styles.secondaryButton, styles.addExerciseButton]}
                  >
                    <Text style={styles.secondaryButtonText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Workout exercises</Text>
            <Text style={styles.sectionMeta}>
              {exercises.length} / {maxExercisesPerWorkout}
            </Text>
          </View>

          {exercises.length === 0 ? (
            <Text style={styles.helperText}>No exercises added yet.</Text>
          ) : (
            exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseCopy}>
                    <Text style={styles.exerciseOrder}>Exercise {index + 1}</Text>
                    <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                    <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                    <Text style={styles.exerciseHelp}>{exercise.help}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveExercise(exercise.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </Pressable>
                </View>
                <Text style={styles.exerciseTarget}>Target: {formatExerciseTarget(exercise.target)}</Text>
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
          <Pressable onPress={onBackToWorkouts} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Back to workouts</Text>
          </Pressable>
          <Pressable onPress={handleSaveWorkout} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save workout</Text>
          </Pressable>
        </View>
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    color: theme.colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  textInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.inputBackground,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  readOnlyValue: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: 14,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  readOnlyValueText: {
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  multilineInput: {
    minHeight: 92,
  },
  optionGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: theme.colors.primaryText,
  },
  helperText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  errorBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surfaceMuted,
    padding: 14,
    gap: 4,
  },
  errorTitle: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButtonDisabled: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  secondaryButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  paginationText: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  paginationActions: {
    flexDirection: "row",
    gap: 8,
  },
  paginationButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    backgroundColor: theme.colors.surface,
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  paginationButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "700",
  },
  paginationButtonTextDisabled: {
    color: theme.colors.textMuted,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionMeta: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  availableExerciseCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  availableExerciseCopy: {
    gap: 4,
  },
  availableExerciseActions: {
    flexDirection: "row",
    gap: 8,
  },
  addExerciseButton: {
    alignSelf: "flex-start",
    minWidth: 88,
  },
  exerciseHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  exerciseOrder: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  exerciseTitle: {
    color: theme.colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
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
  exerciseTarget: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  removeButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  removeButtonText: {
    color: theme.colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  actionsRow: {
    gap: 10,
    paddingBottom: 8,
  },
  ghostButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  ghostButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontSize: 15,
    fontWeight: "700",
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
