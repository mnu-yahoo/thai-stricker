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

type AddWorkoutScreenProps = {
  availableExercises: MockAvailableExercise[];
  maxExercisesPerWorkout: number;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  restSecondsBetweenExercises: number;
  defaultRepsExerciseDurationMinutes: number;
  onBackToWorkouts: () => void;
  onAddWorkout: (workout: MockWorkout) => void;
};

function OptionGroup<T extends string>({
  options,
  selectedValue,
  onSelect,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
}) {
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

export function AddWorkoutScreen({
  availableExercises,
  maxExercisesPerWorkout,
  numberOfExercisesPerPage,
  restSecondsBetweenExercises,
  defaultRepsExerciseDurationMinutes,
  onBackToWorkouts,
  onAddWorkout,
}: AddWorkoutScreenProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<MockWorkoutDifficulty>("Beginner");
  const [category, setCategory] = useState<MockWorkoutCategory>("Fundamentals");
  const [exercises, setExercises] = useState<MockExercise[]>([]);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Workout creation</Text>
          <Text style={styles.title}>Add workout</Text>
          <Text style={styles.subtitle}>Create a custom workout for your training.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Workout details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Workout title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter workout title"
              placeholderTextColor="#9f907b"
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the goal of this workout"
              placeholderTextColor="#9f907b"
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
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <OptionGroup
              options={MOCK_WORKOUT_CATEGORIES}
              selectedValue={category}
              onSelect={setCategory}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Calculated total duration</Text>
            <View style={styles.readOnlyValue}>
              <Text style={styles.readOnlyValueText}>
                {calculatedTotalDurationMinutes} min
              </Text>
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
            <Text style={styles.cardTitle}>Selected exercises</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6",
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
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    color: "#1f1f1f",
    fontSize: 34,
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
  cardTitle: {
    color: "#231f1a",
    fontSize: 20,
    fontWeight: "700",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: "#231f1a",
    fontSize: 15,
    fontWeight: "700",
  },
  textInput: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#c9b69b",
    backgroundColor: "#fffdf9",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#231f1a",
    fontSize: 14,
  },
  readOnlyValue: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d8cab3",
    backgroundColor: "#f8efe2",
    paddingHorizontal: 14,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  readOnlyValueText: {
    color: "#231f1a",
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
    borderColor: "#c9b69b",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  optionButtonSelected: {
    backgroundColor: "#bf5b22",
    borderColor: "#bf5b22",
  },
  optionText: {
    color: "#5f5446",
    fontSize: 14,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#fffaf3",
  },
  helperText: {
    color: "#6b5f51",
    fontSize: 13,
    lineHeight: 19,
  },
  errorBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d65a41",
    backgroundColor: "#fff1ec",
    padding: 14,
    gap: 4,
  },
  errorTitle: {
    color: "#9b2c1c",
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#9b2c1c",
    fontSize: 13,
    lineHeight: 19,
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bf5b22",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff7f1",
  },
  secondaryButtonText: {
    color: "#bf5b22",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButtonDisabled: {
    borderColor: "#d8cab3",
    backgroundColor: "#f3eadc",
  },
  secondaryButtonTextDisabled: {
    color: "#a99983",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  paginationText: {
    color: "#8b5e34",
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
    borderColor: "#c9b69b",
    backgroundColor: "#fffaf3",
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationButtonDisabled: {
    borderColor: "#d8cab3",
    backgroundColor: "#f3eadc",
  },
  paginationButtonText: {
    color: "#5f5446",
    fontSize: 14,
    fontWeight: "700",
  },
  paginationButtonTextDisabled: {
    color: "#a99983",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionMeta: {
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "700",
  },
  exerciseCard: {
    backgroundColor: "#f8efe2",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  availableExerciseCard: {
    backgroundColor: "#f8efe2",
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
    color: "#8b5e34",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  exerciseTitle: {
    color: "#231f1a",
    fontSize: 17,
    fontWeight: "700",
  },
  exerciseDescription: {
    color: "#4f4538",
    fontSize: 14,
    lineHeight: 20,
  },
  exerciseHelp: {
    color: "#6b5f51",
    fontSize: 13,
    lineHeight: 19,
  },
  exerciseTarget: {
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "700",
  },
  removeButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c9825f",
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff7f1",
  },
  removeButtonText: {
    color: "#a34b1b",
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
    borderColor: "#c9b69b",
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  ghostButtonText: {
    color: "#5f5446",
    fontSize: 15,
    fontWeight: "700",
  },
  primaryButton: {
    backgroundColor: "#bf5b22",
    borderRadius: 14,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fffaf3",
    fontSize: 15,
    fontWeight: "700",
  },
});
