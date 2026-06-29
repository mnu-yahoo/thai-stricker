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
  const isDarkTheme = theme.name === "dark";
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
          <Text style={styles.title}>{isDarkTheme ? "EDIT EXERCISE" : "Edit Exercise"}</Text>
          {!isDarkTheme ? (
            <Text style={styles.subtitle}>
              Update the drill details so they stay consistent with the workout library.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Update the exercise details used by the mocked available exercise list.
            </Text>
          )}
        </View>

        <View style={!isDarkTheme ? styles.lightPanelCard : styles.card}>
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

        <View style={!isDarkTheme ? styles.lightPanelCard : styles.card}>
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
            <Text style={styles.ghostButtonText}>{isDarkTheme ? "Back to Add Workout" : "Cancel"}</Text>
          </Pressable>
          <Pressable onPress={handleSaveExercise} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{isDarkTheme ? "Save exercise" : "Save"}</Text>
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
    backgroundColor: isDarkTheme ? theme.colors.appBackground : "#F6F2EF",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    color: isDarkTheme ? theme.colors.accent : "#5F6A7F",
    fontSize: 13,
    fontWeight: isDarkTheme ? "600" : "700",
    textTransform: "uppercase",
    letterSpacing: isDarkTheme ? 0.4 : 0.8,
  },
  title: {
    color: isDarkTheme ? theme.colors.textPrimary : "#2364D0",
    fontSize: 34,
    fontWeight: isDarkTheme ? "800" : "700",
    letterSpacing: isDarkTheme ? 0 : 0.2,
  },
  subtitle: {
    color: isDarkTheme ? theme.colors.textSecondary : "#394B65",
    fontSize: 15,
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
  lightPanelCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#C5D1E5",
  },
  cardTitle: {
    color: isDarkTheme ? theme.colors.textPrimary : "#2364D0",
    fontSize: isDarkTheme ? 20 : 22,
    fontWeight: "700",
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    color: isDarkTheme ? theme.colors.textPrimary : "#5B6D87",
    fontSize: isDarkTheme ? 15 : 12,
    fontWeight: "700",
    textTransform: isDarkTheme ? "none" : "uppercase",
    letterSpacing: isDarkTheme ? 0 : 1.8,
  },
  textInput: {
    minHeight: 48,
    borderRadius: isDarkTheme ? 14 : 10,
    borderWidth: 1,
    borderColor: isDarkTheme ? theme.colors.inputBorder : "#BCC7D9",
    backgroundColor: isDarkTheme ? theme.colors.inputBackground : "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 92,
  },
  readOnlyValue: {
    minHeight: 48,
    borderRadius: isDarkTheme ? 14 : 10,
    borderWidth: 1,
    borderColor: isDarkTheme ? theme.colors.border : "#BCC7D9",
    backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : "#F6F2EF",
    paddingHorizontal: 16,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  readOnlyValueText: {
    color: isDarkTheme ? theme.colors.textPrimary : "#24344D",
    fontSize: 15,
    fontWeight: isDarkTheme ? "700" : "800",
    textTransform: isDarkTheme ? "none" : "uppercase",
    letterSpacing: isDarkTheme ? 0 : 0.6,
  },
  helperText: {
    color: isDarkTheme ? theme.colors.textSecondary : "#516C95",
    fontSize: 13,
    lineHeight: 19,
  },
  errorBox: {
    borderRadius: isDarkTheme ? 14 : 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : "#FFF4F4",
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
    flexDirection: "row",
    gap: 12,
    paddingBottom: 8,
  },
  ghostButton: {
    flex: 1,
    borderRadius: isDarkTheme ? 14 : 12,
    borderWidth: 1,
    borderColor: isDarkTheme ? theme.colors.inputBorder : "#D7E0EF",
    minHeight: isDarkTheme ? 50 : 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: isDarkTheme ? theme.colors.surface : "#FFFFFF",
  },
  ghostButtonText: {
    color: isDarkTheme ? theme.colors.textSecondary : "#24344D",
    fontSize: isDarkTheme ? 15 : 16,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: isDarkTheme ? theme.colors.primary : "#2364D0",
    borderRadius: isDarkTheme ? 14 : 12,
    minHeight: isDarkTheme ? 50 : 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontSize: isDarkTheme ? 15 : 16,
    fontWeight: "700",
  },
});
}
