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

import type { TrainingDayOption } from "../settings/SettingsScreen";
import type { MockWorkout } from "../workouts/workoutMocks";
import type { MockPlannedWorkoutDay, MockWeeklyWorkoutPlan } from "./plannedWorkoutMocks";

type ScheduleScreenProps = {
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

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
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

  if (weekStartDate.getMonth() === weekEndDate.getMonth()) {
    return `${weekStartDate.getDate()} ${startMonth} - ${weekEndDate.getDate()} ${endMonth} ${weekEndDate.getFullYear()}`;
  }

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
  trainingDaysPerWeek,
  workouts,
  weeklyWorkoutPlans,
  onSaveWeeklyPlan,
}: ScheduleScreenProps) {
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
                            {workout.category} • {workout.totalDurationMinutes} min
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6",
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
  weekCard: {
    backgroundColor: "#fffaf3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
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
    color: "#231f1a",
    fontSize: 22,
    fontWeight: "800",
  },
  weekRange: {
    color: "#6b5f51",
    fontSize: 15,
    lineHeight: 20,
  },
  progressText: {
    color: "#8b5e34",
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
    borderColor: "#c9b69b",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  weekButtonText: {
    color: "#5f5446",
    fontSize: 14,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: "#1f3c36",
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  summaryTitle: {
    color: "#eef7f1",
    fontSize: 18,
    fontWeight: "700",
  },
  summaryText: {
    color: "#d7e8df",
    fontSize: 14,
    lineHeight: 20,
  },
  dayCard: {
    backgroundColor: "#fffaf3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
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
    backgroundColor: "#f6ebdb",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  dayBadgeLabel: {
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  dayBadgeNumber: {
    color: "#231f1a",
    fontSize: 22,
    fontWeight: "800",
  },
  dayDetails: {
    flex: 1,
    gap: 4,
  },
  dayTitle: {
    color: "#231f1a",
    fontSize: 20,
    fontWeight: "800",
  },
  dayDate: {
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "700",
  },
  daySelectionStatus: {
    color: "#5f5446",
    fontSize: 14,
    lineHeight: 20,
  },
  toggleButton: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#c9b69b",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  toggleButtonSelected: {
    backgroundColor: "#bf5b22",
    borderColor: "#bf5b22",
  },
  toggleButtonDisabled: {
    backgroundColor: "#f2ece3",
    borderColor: "#e0d5c4",
  },
  toggleButtonText: {
    color: "#5f5446",
    fontSize: 14,
    fontWeight: "700",
  },
  toggleButtonTextSelected: {
    color: "#fffaf3",
  },
  toggleButtonTextDisabled: {
    color: "#b2a494",
  },
  workoutPicker: {
    gap: 10,
  },
  workoutPickerTitle: {
    color: "#231f1a",
    fontSize: 15,
    fontWeight: "700",
  },
  workoutOptions: {
    gap: 10,
  },
  workoutOption: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#d9c8b1",
    padding: 14,
    gap: 4,
    backgroundColor: "#fffaf3",
  },
  workoutOptionSelected: {
    borderColor: "#bf5b22",
    backgroundColor: "#f4dfd0",
  },
  workoutOptionTitle: {
    color: "#231f1a",
    fontSize: 15,
    fontWeight: "700",
  },
  workoutOptionTitleSelected: {
    color: "#8a3f14",
  },
  workoutOptionMeta: {
    color: "#6b5f51",
    fontSize: 13,
    lineHeight: 18,
  },
  workoutOptionMetaSelected: {
    color: "#8a3f14",
  },
  saveButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "#bf5b22",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  saveButtonText: {
    color: "#fffaf3",
    fontSize: 16,
    fontWeight: "800",
  },
});
