import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  mockCalendarWorkoutDays,
  mockMonthlySummary,
  type MockWorkoutStatus,
} from "./homeMocks";
import type { AppTheme } from "../../styles/theme";
import type { MockCoachTip } from "../aiCoach/coachTipsMocks";
import type { MockWorkoutLogEntry } from "../workoutLogging/workoutLogMocks";
import type { MockWeeklyWorkoutPlan } from "../plannedWorkouts/plannedWorkoutMocks";
import type { MockWorkout } from "../workouts/workoutMocks";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABEL = "June 2026";

const colors: Record<MockWorkoutStatus, string> = {
  completed: "#2f855a",
  planned: "#d69e2e",
  missed: "#c53030",
};

type CalendarCell = {
  key: string;
  dayNumber?: number;
  status?: MockWorkoutStatus;
};

type HomeScreenProps = {
  theme: AppTheme;
  randomCoachTip: MockCoachTip;
  workoutLogs: MockWorkoutLogEntry[];
  weeklyWorkoutPlans: MockWeeklyWorkoutPlan[];
  workouts: MockWorkout[];
  onStartWorkout: (workoutId: string) => void;
  onOpenAiCoach: () => void;
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildCalendarCells(workoutLogs: MockWorkoutLogEntry[]): CalendarCell[] {
  const firstDay = new Date(2026, 5, 1).getDay();
  const daysInMonth = new Date(2026, 6, 0).getDate();
  const workoutStatusByDay = new Map<number, MockWorkoutStatus>();

  mockCalendarWorkoutDays.forEach((entry) => {
    workoutStatusByDay.set(Number.parseInt(entry.date.slice(-2), 10), entry.status);
  });

  workoutLogs.forEach((entry) => {
    const completedDate = new Date(entry.completedDate);
    const isCurrentMonth = completedDate.getFullYear() === 2026 && completedDate.getMonth() === 5;

    if (!isCurrentMonth) {
      return;
    }

    workoutStatusByDay.set(completedDate.getDate(), "completed");
  });

  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({ key: `empty-${index}` });
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    cells.push({
      key: `day-${dayNumber}`,
      dayNumber,
      status: workoutStatusByDay.get(dayNumber),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ key: `tail-${cells.length}` });
  }

  return cells;
}

function getDayStyle(theme: AppTheme, status?: MockWorkoutStatus) {
  if (!status) {
    return {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    };
  }

  return {
    backgroundColor: `${colors[status]}1A`,
    borderColor: colors[status],
  };
}

export function HomeScreen({
  theme,
  randomCoachTip,
  workoutLogs,
  weeklyWorkoutPlans,
  workouts,
  onStartWorkout,
  onOpenAiCoach,
}: HomeScreenProps) {
  const styles = getStyles(theme);
  const calendarCells = buildCalendarCells(workoutLogs);
  const completedWorkoutsThisMonth = workoutLogs.filter((entry) => {
    const completedDate = new Date(entry.completedDate);
    return completedDate.getFullYear() === 2026 && completedDate.getMonth() === 5;
  }).length;

  const todayDate = formatLocalDate(new Date());
  const todayPlannedDay = weeklyWorkoutPlans
    .flatMap((plan) => plan.plannedDays)
    .find((plannedDay) => plannedDay.dayDate === todayDate);
  const todayPlannedWorkout = todayPlannedDay
    ? workouts.find((workout) => workout.id === todayPlannedDay.workoutId) ?? null
    : null;

  const handleStartPlannedOrRandomWorkout = () => {
    if (todayPlannedWorkout) {
      onStartWorkout(todayPlannedWorkout.id);
      return;
    }

    if (workouts.length === 0) {
      Alert.alert("No workouts", "No mocked workouts are available right now.");
      return;
    }

    const randomWorkout = workouts[Math.floor(Math.random() * workouts.length)];
    onStartWorkout(randomWorkout.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Private coaching app</Text>
          <Text style={styles.title}>Thai Stricker</Text>
          <Text style={styles.subtitle}>Train sharp. Stay consistent.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Planned workout</Text>
            {todayPlannedWorkout ? (
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{todayPlannedWorkout.difficulty}</Text>
              </View>
            ) : null}
          </View>

          {todayPlannedWorkout ? (
            <>
              <Text style={styles.workoutName}>{todayPlannedWorkout.title}</Text>
              <Text style={styles.workoutFocus}>
                {todayPlannedWorkout.description || "No workout description available."}
              </Text>

              <View style={styles.metricsRow}>
                <View style={styles.metricPill}>
                  <Text style={styles.metricLabel}>Category</Text>
                  <Text style={styles.metricValue}>{todayPlannedWorkout.category}</Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricLabel}>Duration</Text>
                  <Text style={styles.metricValue}>
                    {todayPlannedWorkout.totalDurationMinutes} min
                  </Text>
                </View>
                <View style={styles.metricPill}>
                  <Text style={styles.metricLabel}>Exercises</Text>
                  <Text style={styles.metricValue}>{todayPlannedWorkout.exercises.length}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.workoutFocus}>
              No training planned today. Have a rest. Or start a random Workout
            </Text>
          )}

          <Pressable onPress={handleStartPlannedOrRandomWorkout} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {todayPlannedWorkout ? "Start workout" : "Start random workout"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly activity</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{completedWorkoutsThisMonth}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{mockMonthlySummary.plannedWorkouts}</Text>
              <Text style={styles.summaryLabel}>Planned</Text>
            </View>
            <View style={styles.summaryTile}>
              <Text style={styles.summaryValue}>{mockMonthlySummary.missedWorkouts}</Text>
              <Text style={styles.summaryLabel}>Missed</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Calendar preview</Text>
            <Text style={styles.cardMeta}>{MONTH_LABEL}</Text>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarCells.map((cell) => (
              <View key={cell.key} style={[styles.calendarDay, getDayStyle(theme, cell.status)]}>
                {cell.dayNumber ? (
                  <Text
                    style={[
                      styles.calendarDayText,
                      cell.status ? styles.calendarDayTextActive : undefined,
                    ]}
                  >
                    {cell.dayNumber}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.legend}>
            {(["completed", "planned", "missed"] as MockWorkoutStatus[]).map((status) => (
              <View key={status} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: colors[status] }]} />
                <Text style={styles.legendLabel}>{status}</Text>
              </View>
            ))}
          </View>
        </View>

        <Pressable onPress={onOpenAiCoach} style={styles.coachCard}>
          <View style={styles.coachHeader}>
            <Text style={styles.cardTitle}>AI Coach</Text>
            <Text style={styles.coachTag}>Local tips</Text>
          </View>
          <Text style={styles.coachMessage}>{randomCoachTip.shortTip}</Text>
          <Pressable onPress={onOpenAiCoach} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Open coach</Text>
          </Pressable>
        </Pressable>
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
      paddingTop: 8,
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
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
    },
    cardMeta: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    difficultyBadge: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    difficultyText: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    workoutName: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
    },
    workoutFocus: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
    },
    metricsRow: {
      flexDirection: "row",
      gap: 12,
      flexWrap: "wrap",
    },
    metricPill: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      padding: 12,
      gap: 4,
      minWidth: "30%",
      flexGrow: 1,
    },
    metricLabel: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
    },
    metricValue: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
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
    summaryGrid: {
      flexDirection: "row",
      gap: 10,
    },
    summaryTile: {
      flex: 1,
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 6,
    },
    summaryValue: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
    },
    summaryLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },
    weekdayRow: {
      flexDirection: "row",
    },
    weekdayLabel: {
      flex: 1,
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
    },
    calendarGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    calendarDay: {
      width: "12.9%",
      aspectRatio: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    calendarDayText: {
      color: theme.colors.textMuted,
      fontSize: 14,
      fontWeight: "600",
    },
    calendarDayTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: "800",
    },
    legend: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    legendSwatch: {
      width: 10,
      height: 10,
      borderRadius: 999,
    },
    legendLabel: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    coachCard: {
      backgroundColor: theme.colors.cardElevated,
      borderRadius: 18,
      padding: 18,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    coachHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    coachTag: {
      color: theme.colors.accent,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    coachMessage: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      lineHeight: 22,
    },
    secondaryButton: {
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: theme.colors.surfaceMuted,
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}
