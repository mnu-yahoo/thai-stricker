import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

type WorkoutFinishedRecapScreenProps = {
  workoutTitle: string;
  totalExercises: number;
  completedExerciseCount: number;
  skippedExerciseCount: number;
  completionDate: string;
  onBackToHome: () => void;
};

export function WorkoutFinishedRecapScreen({
  workoutTitle,
  totalExercises,
  completedExerciseCount,
  skippedExerciseCount,
  completionDate,
  onBackToHome,
}: WorkoutFinishedRecapScreenProps) {
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fffaf3",
    borderRadius: 22,
    padding: 22,
    gap: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  eyebrow: {
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    color: "#231f1a",
    fontSize: 34,
    fontWeight: "800",
  },
  workoutTitle: {
    color: "#4f4538",
    fontSize: 17,
    lineHeight: 23,
  },
  summaryCard: {
    backgroundColor: "#f8efe2",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  summaryLabel: {
    color: "#8b7355",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#231f1a",
    fontSize: 28,
    fontWeight: "800",
  },
  summaryMeta: {
    color: "#5f5446",
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: "#bf5b22",
    borderRadius: 14,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fffaf3",
    fontSize: 16,
    fontWeight: "700",
  },
});
