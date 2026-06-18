import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../../styles/theme";

type WorkoutFinishedRecapScreenProps = {
  theme: AppTheme;
  workoutTitle: string;
  totalExercises: number;
  completedExerciseCount: number;
  skippedExerciseCount: number;
  completionDate: string;
  onBackToHome: () => void;
};

export function WorkoutFinishedRecapScreen({
  theme,
  workoutTitle,
  totalExercises,
  completedExerciseCount,
  skippedExerciseCount,
  completionDate,
  onBackToHome,
}: WorkoutFinishedRecapScreenProps) {
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Mocked recap</Text>
          <Text style={styles.title}>Workout complete</Text>
          <Text style={styles.workoutTitle}>{workoutTitle}</Text>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Exercises completed or skipped</Text>
            <Text style={styles.summaryValue}>
              {completedExerciseCount + skippedExerciseCount} / {totalExercises}
            </Text>
            <Text style={styles.summaryMeta}>Completed: {completedExerciseCount}</Text>
            <Text style={styles.summaryMeta}>Skipped: {skippedExerciseCount}</Text>
            <Text style={styles.summaryMeta}>Date: {completionDate}</Text>
          </View>

          <Pressable onPress={onBackToHome} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </View>
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
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    padding: 22,
    gap: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  workoutTitle: {
    color: theme.colors.textSecondary,
    fontSize: 17,
    lineHeight: 23,
  },
  summaryCard: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  summaryLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: theme.colors.textPrimary,
    fontSize: 28,
    fontWeight: "800",
  },
  summaryMeta: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: theme.colors.primaryText,
    fontSize: 16,
    fontWeight: "700",
  },
});
}
