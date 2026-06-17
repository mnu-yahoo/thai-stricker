import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useEffect, useState } from "react";

import type { MockWorkout } from "../workouts/workoutMocks";

type WorkoutFlowStep = "exercise" | "rest";

type StartWorkoutScreenProps = {
  workout: MockWorkout;
  currentExerciseIndex: number;
  currentStep: WorkoutFlowStep;
  restSecondsBetweenExercises: 15 | 30 | 45 | 60 | 90 | 120;
  onFinishExercise: () => void;
  onSkipExercise: () => void;
  onFinishRest: () => void;
};

function formatTarget(target: MockWorkout["exercises"][number]["target"]) {
  if (target.type === "duration") {
    return `${target.seconds} sec`;
  }

  return `${target.reps} reps`;
}

export function StartWorkoutScreen({
  workout,
  currentExerciseIndex,
  currentStep,
  restSecondsBetweenExercises,
  onFinishExercise,
  onSkipExercise,
  onFinishRest,
}: StartWorkoutScreenProps) {
  const exercise = workout.exercises[currentExerciseIndex];
  const nextExercise = workout.exercises[currentExerciseIndex + 1];
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (currentStep === "exercise" && exercise.target.type === "duration") {
      setRemainingSeconds(exercise.target.seconds);
      return;
    }

    if (currentStep === "rest") {
      setRemainingSeconds(restSecondsBetweenExercises);
      return;
    }

    setRemainingSeconds(null);
  }, [currentStep, currentExerciseIndex, exercise.target, restSecondsBetweenExercises]);

  useEffect(() => {
    if (remainingSeconds === null || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null) {
          return current;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  useEffect(() => {
    if (
      currentStep === "exercise" &&
      exercise.target.type === "duration" &&
      remainingSeconds === 0
    ) {
      onFinishExercise();
    }
  }, [currentStep, exercise.target, remainingSeconds, onFinishExercise]);

  useEffect(() => {
    if (currentStep === "rest" && remainingSeconds === 0) {
      onFinishRest();
    }
  }, [currentStep, remainingSeconds, onFinishRest]);

  if (currentStep === "rest") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.eyebrow}>Recovery step</Text>
            <Text style={styles.restTitle}>Rest</Text>
            <Text style={styles.timerValue}>{remainingSeconds ?? 0}</Text>
            <Text style={styles.timerLabel}>seconds remaining</Text>
            <Text style={styles.nextExercise}>Next: {nextExercise?.title}</Text>

            <Pressable onPress={onFinishRest} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Skip rest</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{workout.title}</Text>
          <Text style={styles.progressText}>
            Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
          </Text>
          <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          <Text style={styles.exerciseDescription}>{exercise.description}</Text>
          <Text style={styles.exerciseHelp}>{exercise.help}</Text>

          <View style={styles.targetCard}>
            <Text style={styles.targetLabel}>Target</Text>
            <Text style={styles.targetValue}>{formatTarget(exercise.target)}</Text>
          </View>

          {exercise.target.type === "duration" ? (
            <View style={styles.timerCard}>
              <Text style={styles.timerValue}>{remainingSeconds ?? 0}</Text>
              <Text style={styles.timerLabel}>seconds remaining</Text>
            </View>
          ) : (
            <Pressable onPress={onFinishExercise} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Finish exercise</Text>
            </Pressable>
          )}

          <Pressable onPress={onSkipExercise} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Skip exercise</Text>
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
    gap: 16,
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
  progressText: {
    color: "#6b5f51",
    fontSize: 14,
    fontWeight: "700",
  },
  exerciseTitle: {
    color: "#231f1a",
    fontSize: 30,
    fontWeight: "800",
  },
  exerciseDescription: {
    color: "#4f4538",
    fontSize: 16,
    lineHeight: 23,
  },
  exerciseHelp: {
    color: "#6b5f51",
    fontSize: 14,
    lineHeight: 21,
  },
  targetCard: {
    backgroundColor: "#f8efe2",
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  targetLabel: {
    color: "#8b7355",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  targetValue: {
    color: "#231f1a",
    fontSize: 22,
    fontWeight: "800",
  },
  timerCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1f3c36",
    borderRadius: 18,
    paddingVertical: 22,
    gap: 6,
  },
  timerValue: {
    color: "#eef7f1",
    fontSize: 52,
    fontWeight: "800",
    textAlign: "center",
  },
  timerLabel: {
    color: "#d7e8df",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  restTitle: {
    color: "#231f1a",
    fontSize: 34,
    fontWeight: "800",
  },
  nextExercise: {
    color: "#4f4538",
    fontSize: 16,
    lineHeight: 22,
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
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#c9b69b",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  secondaryButtonText: {
    color: "#5f5446",
    fontSize: 15,
    fontWeight: "700",
  },
});
