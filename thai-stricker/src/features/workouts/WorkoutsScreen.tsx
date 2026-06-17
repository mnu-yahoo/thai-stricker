import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

import type { MockWorkout } from "./workoutMocks";

type WorkoutsScreenProps = {
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  workouts: MockWorkout[];
  onStartWorkout: (workoutId: string) => void;
  onOpenAddWorkout: () => void;
};

function formatTarget(target: MockWorkout["exercises"][number]["target"]) {
  if (target.type === "duration") {
    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

export function WorkoutsScreen({
  restSecondsBetweenExercises,
  workouts,
  onStartWorkout,
  onOpenAddWorkout,
}: WorkoutsScreenProps) {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const handleEditWorkout = () => {
    Alert.alert("Edit workout", "Edit Workout screen is not implemented yet.");
  };

  const toggleWorkoutContent = (workoutId: string) => {
    setExpandedWorkoutId((currentId) => (currentId === workoutId ? null : workoutId));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
            <Text style={styles.addButtonText}>Add workout</Text>
          </Pressable>
        </View>

        {workouts.map((workout) => {
          const isExpanded = expandedWorkoutId === workout.id;

          return (
            <View key={workout.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerCopy}>
                  <Text style={styles.cardTitle}>{workout.title}</Text>
                  <Text style={styles.cardDescription}>{workout.description}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{workout.difficulty}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Category</Text>
                  <Text style={styles.metaValue}>{workout.category}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Duration</Text>
                  <Text style={styles.metaValue}>{workout.totalDurationMinutes} min</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Exercises</Text>
                  <Text style={styles.metaValue}>{workout.exercises.length}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaLabel}>Rest</Text>
                  <Text style={styles.metaValue}>{restSecondsBetweenExercises} s</Text>
                </View>
              </View>

              <Text style={styles.lastDoneText}>
                {workout.lastDoneDate ? `Last done: ${workout.lastDoneDate}` : "Not completed yet"}
              </Text>

              <View style={styles.actionsRow}>
                <Pressable
                  onPress={() => toggleWorkoutContent(workout.id)}
                  style={styles.ghostButton}
                >
                  <Text style={styles.ghostButtonText}>
                    {isExpanded ? "Hide content" : "View content"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onStartWorkout(workout.id)}
                  style={styles.primaryButton}
                >
                  <Text style={styles.primaryButtonText}>Start workout</Text>
                </Pressable>
                <Pressable onPress={handleEditWorkout} style={styles.ghostButton}>
                  <Text style={styles.ghostButtonText}>Edit workout</Text>
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
    gap: 16,
  },
  headerText: {
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
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#bf5b22",
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fffaf3",
    fontSize: 15,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#fffaf3",
    borderRadius: 18,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "#eadfce",
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
    color: "#231f1a",
    fontSize: 24,
    fontWeight: "800",
  },
  cardDescription: {
    color: "#5f5446",
    fontSize: 15,
    lineHeight: 21,
  },
  badge: {
    backgroundColor: "#f0dfc8",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#7c4f1f",
    fontSize: 12,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaPill: {
    flex: 1,
    backgroundColor: "#f8efe2",
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  metaLabel: {
    color: "#8b7355",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  metaValue: {
    color: "#231f1a",
    fontSize: 17,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "column",
    gap: 10,
  },
  lastDoneText: {
    color: "#6b5f51",
    fontSize: 13,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#bf5b22",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fffaf3",
    fontSize: 15,
    fontWeight: "700",
  },
  ghostButton: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#c9b69b",
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  ghostButtonText: {
    color: "#5f5446",
    fontSize: 15,
    fontWeight: "700",
  },
  expandedSection: {
    gap: 12,
    paddingTop: 4,
  },
  exerciseCard: {
    backgroundColor: "#f8efe2",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  exerciseTitle: {
    flex: 1,
    color: "#231f1a",
    fontSize: 17,
    fontWeight: "700",
  },
  exerciseTarget: {
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
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
  restNote: {
    color: "#8b5e34",
    fontSize: 12,
    fontWeight: "600",
  },
});
