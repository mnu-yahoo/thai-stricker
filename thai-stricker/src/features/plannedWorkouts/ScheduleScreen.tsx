import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { AppTheme } from "../../styles/theme";
import type { TrainingDayOption } from "../settings/SettingsScreen";
import type { MockWorkout } from "../workouts/workoutMocks";
import type { MockPlannedWorkoutDay, MockWeeklyWorkoutPlan } from "./plannedWorkoutMocks";

type ScheduleScreenProps = {
  theme: AppTheme;
  trainingDaysPerWeek: TrainingDayOption;
  workouts: MockWorkout[];
  weeklyWorkoutPlans: MockWeeklyWorkoutPlan[];
  onSaveWeeklyPlan: (plan: MockWeeklyWorkoutPlan) => void;
};

type WeekDay = {
  dayDate: string;
  dayLabel: string;
  shortLabel: string;
  dayNumber: string;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function startOfWeek(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);

  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diff);

  return normalized;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekNumber(date: Date) {
  const target = startOfWeek(date);
  const thursday = addDays(target, 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const firstWeekStart = startOfWeek(firstThursday);
  const diffInDays = Math.round((thursday.getTime() - firstWeekStart.getTime()) / 86400000);

  return Math.floor(diffInDays / 7) + 1;
}

function formatWeekRange(weekStartDate: Date) {
  const weekEndDate = addDays(weekStartDate, 6);
  const startMonth = MONTH_NAMES[weekStartDate.getMonth()];
  const endMonth = MONTH_NAMES[weekEndDate.getMonth()];

  return `${weekStartDate.getDate()} ${startMonth} - ${weekEndDate.getDate()} ${endMonth} ${weekEndDate.getFullYear()}`;
}

function buildWeekDays(weekStartDate: Date): WeekDay[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStartDate, index);
    const label = DAY_NAMES[date.getDay()];

    return {
      dayDate: formatDateKey(date),
      dayLabel: label,
      shortLabel: label.slice(0, 3),
      dayNumber: String(date.getDate()),
    };
  });
}

function toDraftMap(plan: MockWeeklyWorkoutPlan | undefined) {
  return new Map(plan?.plannedDays.map((day) => [day.dayDate, day]) ?? []);
}

export function ScheduleScreen({
  theme,
  trainingDaysPerWeek,
  workouts,
  weeklyWorkoutPlans,
  onSaveWeeklyPlan,
}: ScheduleScreenProps) {
  const styles = getStyles(theme);
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => startOfWeek(new Date()));
  const selectedWeekKey = formatDateKey(selectedWeekStart);

  const selectedWeekPlan = useMemo(
    () => weeklyWorkoutPlans.find((plan) => plan.weekStartDate === selectedWeekKey),
    [selectedWeekKey, weeklyWorkoutPlans],
  );

  const [draftDays, setDraftDays] = useState<Map<string, MockPlannedWorkoutDay>>(() =>
    toDraftMap(selectedWeekPlan),
  );

  useEffect(() => {
    setDraftDays(toDraftMap(selectedWeekPlan));
  }, [selectedWeekPlan, selectedWeekKey]);

  const weekDays = useMemo(() => buildWeekDays(selectedWeekStart), [selectedWeekStart]);
  const weekNumber = getWeekNumber(selectedWeekStart);
  const plannedCount = draftDays.size;
  const remainingCount = trainingDaysPerWeek - plannedCount;

  const toggleDaySelection = (day: WeekDay) => {
    const isSelected = draftDays.has(day.dayDate);

    if (!isSelected && plannedCount >= trainingDaysPerWeek) {
      Alert.alert("Weekly limit reached", "Clear a planned day before selecting another one.");
      return;
    }

    setDraftDays((currentDraftDays) => {
      const nextDraftDays = new Map(currentDraftDays);

      if (isSelected) {
        nextDraftDays.delete(day.dayDate);
      } else {
        nextDraftDays.set(day.dayDate, {
          dayDate: day.dayDate,
          dayLabel: day.dayLabel,
          workoutId: "",
          workoutTitle: "",
        });
      }

      return nextDraftDays;
    });
  };

  const assignWorkout = (day: WeekDay, workout: MockWorkout) => {
    setDraftDays((currentDraftDays) => {
      const nextDraftDays = new Map(currentDraftDays);
      const existingDay = nextDraftDays.get(day.dayDate);

      if (!existingDay) {
        return currentDraftDays;
      }

      nextDraftDays.set(day.dayDate, {
        ...existingDay,
        workoutId: workout.id,
        workoutTitle: workout.title,
      });

      return nextDraftDays;
    });
  };

  const handleSavePlan = () => {
    if (plannedCount !== trainingDaysPerWeek) {
      Alert.alert(
        "Plan incomplete",
        `Plan ${trainingDaysPerWeek} workout days before saving. ${Math.max(remainingCount, 0)} remaining.`,
      );
      return;
    }

    const plannedDays = Array.from(draftDays.values()).sort((leftDay, rightDay) =>
      leftDay.dayDate.localeCompare(rightDay.dayDate),
    );

    const missingWorkoutAssignments = plannedDays.filter((day) => !day.workoutId);
    if (missingWorkoutAssignments.length > 0) {
      Alert.alert("Workout required", "Assign one workout to every selected training day before saving.");
      return;
    }

    const plan: MockWeeklyWorkoutPlan = {
      id: selectedWeekPlan?.id ?? `weekly-plan-${selectedWeekKey}`,
      weekStartDate: selectedWeekKey,
      weekNumber,
      year: selectedWeekStart.getFullYear(),
      requiredTrainingDays: trainingDaysPerWeek,
      plannedDays,
      source: "mock",
    };

    onSaveWeeklyPlan(plan);
    Alert.alert("Weekly plan saved", `Week ${weekNumber} is saved in mocked app state.`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Planned workout</Text>
          <Text style={styles.title}>Schedule</Text>
          <Text style={styles.subtitle}>Plan your workouts for one week using mocked app state only.</Text>
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <View style={styles.weekMeta}>
              <Text style={styles.weekLabel}>Week {weekNumber}</Text>
              <Text style={styles.weekRange}>{formatWeekRange(selectedWeekStart)}</Text>
            </View>
            <Text style={styles.progressText}>
              {plannedCount} of {trainingDaysPerWeek} workouts planned
            </Text>
          </View>

          <View style={styles.weekActions}>
            <Pressable
              onPress={() => setSelectedWeekStart((currentWeek) => addDays(currentWeek, -7))}
              style={styles.weekButton}
            >
              <Text style={styles.weekButtonText}>Previous week</Text>
            </Pressable>
            <Pressable
              onPress={() => setSelectedWeekStart((currentWeek) => addDays(currentWeek, 7))}
              style={styles.weekButton}
            >
              <Text style={styles.weekButtonText}>Next week</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Planning rules</Text>
          <Text style={styles.summaryText}>
            Use the Settings training-day value to plan exactly {trainingDaysPerWeek} workout days this week.
          </Text>
          <Text style={styles.summaryText}>
            {remainingCount > 0
              ? `${remainingCount} workout ${remainingCount === 1 ? "day is" : "days are"} still required before saving.`
              : "Required workout count reached. Clear a day to choose a different one."}
          </Text>
        </View>

        {weekDays.map((day) => {
          const plannedDay = draftDays.get(day.dayDate);
          const isSelected = Boolean(plannedDay);
          const isDisabled = !isSelected && plannedCount >= trainingDaysPerWeek;

          return (
            <View key={day.dayDate} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <View style={styles.dayMeta}>
                  <View style={styles.dayBadge}>
                    <Text style={styles.dayBadgeLabel}>{day.shortLabel}</Text>
                    <Text style={styles.dayBadgeNumber}>{day.dayNumber}</Text>
                  </View>
                  <View style={styles.dayDetails}>
                    <Text style={styles.dayTitle}>{day.dayLabel}</Text>
                    <Text style={styles.dayDate}>{day.dayDate}</Text>
                    <Text style={styles.daySelectionStatus}>
                      {isSelected
                        ? plannedDay?.workoutTitle
                          ? `Assigned: ${plannedDay.workoutTitle}`
                          : "Selected day, workout still required"
                        : "Not selected for training"}
                    </Text>
                  </View>
                </View>

                <Pressable
                  disabled={isDisabled}
                  onPress={() => toggleDaySelection(day)}
                  style={[
                    styles.toggleButton,
                    isSelected ? styles.toggleButtonSelected : undefined,
                    isDisabled ? styles.toggleButtonDisabled : undefined,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      isSelected ? styles.toggleButtonTextSelected : undefined,
                      isDisabled ? styles.toggleButtonTextDisabled : undefined,
                    ]}
                  >
                    {isSelected ? "Clear day" : "Select day"}
                  </Text>
                </Pressable>
              </View>

              {isSelected ? (
                <View style={styles.workoutPicker}>
                  <Text style={styles.workoutPickerTitle}>Choose one workout</Text>
                  <View style={styles.workoutOptions}>
                    {workouts.map((workout) => {
                      const isWorkoutSelected = plannedDay?.workoutId === workout.id;

                      return (
                        <Pressable
                          key={`${day.dayDate}-${workout.id}`}
                          onPress={() => assignWorkout(day, workout)}
                          style={[
                            styles.workoutOption,
                            isWorkoutSelected ? styles.workoutOptionSelected : undefined,
                          ]}
                        >
                          <Text
                            style={[
                              styles.workoutOptionTitle,
                              isWorkoutSelected ? styles.workoutOptionTitleSelected : undefined,
                            ]}
                          >
                            {workout.title}
                          </Text>
                          <Text
                            style={[
                              styles.workoutOptionMeta,
                              isWorkoutSelected ? styles.workoutOptionMetaSelected : undefined,
                            ]}
                          >
                            {`${workout.category} • ${workout.totalDurationMinutes} min`}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          );
        })}

        <Pressable onPress={handleSavePlan} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save weekly plan</Text>
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
      paddingBottom: 24,
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
    weekCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 18,
      gap: 14,
    },
    weekHeader: {
      gap: 12,
    },
    weekMeta: {
      gap: 4,
    },
    weekLabel: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
    },
    weekRange: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 20,
    },
    progressText: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: "700",
    },
    weekActions: {
      flexDirection: "row",
      gap: 10,
    },
    weekButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    weekButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    summaryCard: {
      backgroundColor: theme.colors.cardElevated,
      borderRadius: 18,
      padding: 18,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    summaryTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
    },
    summaryText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    dayCard: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      gap: 14,
    },
    dayHeader: {
      gap: 14,
    },
    dayMeta: {
      flexDirection: "row",
      gap: 14,
    },
    dayBadge: {
      width: 64,
      minHeight: 72,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    dayBadgeLabel: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    dayBadgeNumber: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
    },
    dayDetails: {
      flex: 1,
      gap: 4,
    },
    dayTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
    },
    dayDate: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
    },
    daySelectionStatus: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    toggleButton: {
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
    },
    toggleButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    toggleButtonDisabled: {
      backgroundColor: theme.colors.surfaceMuted,
      borderColor: theme.colors.border,
    },
    toggleButtonText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    toggleButtonTextSelected: {
      color: theme.colors.primaryText,
    },
    toggleButtonTextDisabled: {
      color: theme.colors.textMuted,
    },
    workoutPicker: {
      gap: 10,
    },
    workoutPickerTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
    workoutOptions: {
      gap: 10,
    },
    workoutOption: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 14,
      gap: 4,
      backgroundColor: theme.colors.surface,
    },
    workoutOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceMuted,
    },
    workoutOptionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
    workoutOptionTitleSelected: {
      color: theme.colors.accent,
    },
    workoutOptionMeta: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 18,
    },
    workoutOptionMetaSelected: {
      color: theme.colors.accent,
    },
    saveButton: {
      minHeight: 54,
      borderRadius: 16,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    saveButtonText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: "800",
    },
  });
}
