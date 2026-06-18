import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useState } from "react";

import type { AppTheme } from "../../styles/theme";
import { type MockAvailableExercise } from "./exerciseMocks";

type EditExerciseScreenProps = {
  theme: AppTheme;
  exercise: MockAvailableExercise;
  onBackToAddWorkout: () => void;
  onSaveExercise: (exercise: MockAvailableExercise) => void;
};

function formatExerciseTarget(exercise: MockAvailableExercise) {
  if (exercise.target.type === "duration") {
    return `${exercise.target.seconds} sec`;
  }

  return `${exercise.target.reps} reps`;
}

export function EditExerciseScreen({
  theme,
  exercise,
  onBackToAddWorkout,
  onSaveExercise,
}: EditExerciseScreenProps) {
  const styles = getStyles(theme);
  const [title, setTitle] = useState(exercise.title);
  const [description, setDescription] = useState(exercise.description);
  const [help, setHelp] = useState(exercise.help);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSaveExercise = () => {
    if (!title.trim()) {
      setErrorMessage("Exercise title is required.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage("Exercise description is required.");
      return;
    }

    if (!help.trim()) {
      setErrorMessage("Exercise help is required.");
      return;
    }

    onSaveExercise({
      ...exercise,
      title: title.trim(),
      description: description.trim(),
      help: help.trim(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Exercise library</Text>
          <Text style={styles.title}>Edit exercise</Text>
          <Text style={styles.subtitle}>
            Update the exercise details used by the mocked available exercise list.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Editable details</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter exercise title"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the exercise"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              style={[styles.textInput, styles.multilineInput]}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Help</Text>
            <TextInput
              value={help}
              onChangeText={setHelp}
              placeholder="Add coaching help text"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
              style={[styles.textInput, styles.multilineInput]}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Read-only target</Text>
          <View style={styles.readOnlyValue}>
            <Text style={styles.readOnlyValueText}>{formatExerciseTarget(exercise)}</Text>
          </View>
          <Text style={styles.helperText}>
            Target information is shown for context only and cannot be edited here.
          </Text>
        </View>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Exercise error</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.actionsRow}>
          <Pressable onPress={onBackToAddWorkout} style={styles.ghostButton}>
            <Text style={styles.ghostButtonText}>Back to Add Workout</Text>
          </Pressable>
          <Pressable onPress={handleSaveExercise} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Save exercise</Text>
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
  multilineInput: {
    minHeight: 92,
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
});
}
