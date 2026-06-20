import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
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
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
const LIGHT_HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

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
  return `${MONTH_NAMES[weekStartDate.getMonth()]} ${weekStartDate.getDate()} — ${weekEndDate.getDate()}`;
}

function formatLongWeekRange(weekStartDate: Date) {
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
      shortLabel: label.slice(0, 1),
      dayNumber: String(date.getDate()),
    };
  });
}

function toDraftMap(plan: MockWeeklyWorkoutPlan | undefined) {
  return new Map(plan?.plannedDays.map((day) => [day.dayDate, day]) ?? []);
}

function formatLongSelectedDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function getMonthLabel(weekStartDate: Date) {
  return `${MONTH_NAMES[weekStartDate.getMonth()].toUpperCase()} ${weekStartDate.getFullYear()}`;
}

function findWorkout(workouts: MockWorkout[], workoutId: string) {
  return workouts.find((workout) => workout.id === workoutId) ?? null;
}

export function ScheduleScreen({
  theme,
  trainingDaysPerWeek,
  workouts,
  weeklyWorkoutPlans,
  onSaveWeeklyPlan,
}: ScheduleScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => startOfWeek(new Date()));
  const selectedWeekKey = formatDateKey(selectedWeekStart);

  const selectedWeekPlan = useMemo(
    () => weeklyWorkoutPlans.find((plan) => plan.weekStartDate === selectedWeekKey),
    [selectedWeekKey, weeklyWorkoutPlans],
  );

  const [draftDays, setDraftDays] = useState<Map<string, MockPlannedWorkoutDay>>(() =>
    toDraftMap(selectedWeekPlan),
  );
  const [selectedDayDate, setSelectedDayDate] = useState(() => formatDateKey(new Date()));

  useEffect(() => {
    const weekStartKey = formatDateKey(selectedWeekStart);
    const todayKey = formatDateKey(new Date());
    const nextDraftDays = toDraftMap(selectedWeekPlan);

    setDraftDays(nextDraftDays);

    const weekDays = buildWeekDays(selectedWeekStart);
    const currentSelectionInWeek = weekDays.some((day) => day.dayDate === selectedDayDate);
    if (currentSelectionInWeek) {
      return;
    }

    const firstPlannedDay = Array.from(nextDraftDays.keys())[0];
    const nextSelectedDay =
      weekStartKey === formatDateKey(startOfWeek(new Date()))
        ? todayKey
        : firstPlannedDay ?? weekDays[0]?.dayDate ?? todayKey;

    setSelectedDayDate(nextSelectedDay);
  }, [selectedWeekPlan, selectedWeekStart, selectedDayDate]);

  const weekDays = useMemo(() => buildWeekDays(selectedWeekStart), [selectedWeekStart]);
  const weekNumber = getWeekNumber(selectedWeekStart);
  const plannedCount = draftDays.size;
  const remainingCount = trainingDaysPerWeek - plannedCount;
  const selectedDay = weekDays.find((day) => day.dayDate === selectedDayDate) ?? weekDays[0];
  const selectedPlannedDay = selectedDay ? draftDays.get(selectedDay.dayDate) : undefined;
  const selectedWorkout = selectedPlannedDay
    ? findWorkout(workouts, selectedPlannedDay.workoutId)
    : null;
  const todayKey = formatDateKey(new Date());

  const ensureSelectedDaySlot = (day: WeekDay) => {
    const existingDay = draftDays.get(day.dayDate);

    if (existingDay) {
      return true;
    }

    if (plannedCount >= trainingDaysPerWeek) {
      Alert.alert("Weekly limit reached", "Clear a planned day before selecting another one.");
      return false;
    }

    setDraftDays((currentDraftDays) => {
      const nextDraftDays = new Map(currentDraftDays);
      nextDraftDays.set(day.dayDate, {
        dayDate: day.dayDate,
        dayLabel: day.dayLabel,
        workoutId: "",
        workoutTitle: "",
      });
      return nextDraftDays;
    });

    return true;
  };

  const assignWorkout = (day: WeekDay, workout: MockWorkout) => {
    if (!ensureSelectedDaySlot(day)) {
      return;
    }

    setDraftDays((currentDraftDays) => {
      const nextDraftDays = new Map(currentDraftDays);
      nextDraftDays.set(day.dayDate, {
        dayDate: day.dayDate,
        dayLabel: day.dayLabel,
        workoutId: workout.id,
        workoutTitle: workout.title,
      });

      return nextDraftDays;
    });
  };

  const clearSelectedDay = () => {
    if (!selectedDay) {
      return;
    }

    setDraftDays((currentDraftDays) => {
      const nextDraftDays = new Map(currentDraftDays);
      nextDraftDays.delete(selectedDay.dayDate);
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
      Alert.alert(
        "Workout required",
        "Assign one workout to every selected training day before saving.",
      );
      return;
    }

    const plan: MockWeeklyWorkoutPlan = {
      id: selectedWeekPlan?.id ?? `weekly-plan-${selectedWeekKey}`,
      weekStartDate: selectedWeekKey,
      weekNumber,
      year: selectedWeekStart.getFullYear(),
      requiredTrainingDays: trainingDaysPerWeek,
      plannedDays,
      source: "sqlite",
    };

    onSaveWeeklyPlan(plan);
    Alert.alert("Weekly plan saved", `Week ${weekNumber} has been saved locally.`);
  };

  const handleInspectWorkout = (workout: MockWorkout) => {
    Alert.alert(workout.title, workout.description);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <>
            <View style={styles.topBar}>
              <Text style={styles.eyebrow}>Planned workout</Text>
              <Text style={styles.title}>Schedule</Text>
              <Text style={styles.subtitle}>
                Plan exactly one week of training and save it locally.
              </Text>
            </View>

            <View style={styles.weekCard}>
              <View style={styles.weekHeader}>
                <View style={styles.weekMeta}>
                  <Text style={styles.weekLabel}>Week {weekNumber}</Text>
                  <Text style={styles.weekRange}>{formatLongWeekRange(selectedWeekStart)}</Text>
                </View>
                <View style={styles.progressBadge}>
                  <Text style={styles.progressBadgeText}>
                    {plannedCount} / {trainingDaysPerWeek}
                  </Text>
                </View>
              </View>

              <View style={styles.weekActions}>
                <Pressable
                  onPress={() => setSelectedWeekStart((currentWeek) => addDays(currentWeek, -7))}
                  style={styles.weekButton}
                >
                  <GoogleMaterialSymbol
                    color={theme.colors.textPrimary}
                    fallbackName="chevron-left"
                    name="chevron_left"
                    size={18}
                  />
                </Pressable>
                <Pressable
                  onPress={() => setSelectedWeekStart((currentWeek) => addDays(currentWeek, 7))}
                  style={styles.weekButton}
                >
                  <GoogleMaterialSymbol
                    color={theme.colors.primary}
                    fallbackName="chevron-right"
                    name="chevron_right"
                    size={18}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Planning rules</Text>
              <Text style={styles.summaryText}>
                Select exactly {trainingDaysPerWeek} training day
                {trainingDaysPerWeek === 1 ? "" : "s"} this week.
              </Text>
              <Text style={styles.summaryText}>
                {remainingCount > 0
                  ? `${remainingCount} workout ${remainingCount === 1 ? "day is" : "days are"} still required before saving.`
                  : "Required workout count reached. Clear a selected day to change your plan."}
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
                      <View style={[styles.dayBadge, isSelected ? styles.dayBadgeSelected : undefined]}>
                        <Text
                          style={[
                            styles.dayBadgeLabel,
                            isSelected ? styles.dayBadgeLabelSelected : undefined,
                          ]}
                        >
                          {day.shortLabel}
                        </Text>
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
                      onPress={() => {
                        if (isSelected) {
                          setDraftDays((currentDraftDays) => {
                            const nextDraftDays = new Map(currentDraftDays);
                            nextDraftDays.delete(day.dayDate);
                            return nextDraftDays;
                          });
                          return;
                        }

                        ensureSelectedDaySlot(day);
                      }}
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
                        {isSelected ? "Clear" : "Select"}
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
                                {`${workout.category.toUpperCase()} • ${workout.totalDurationMinutes} MIN`}
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
              <Text style={styles.saveButtonText}>Save plan</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.lightTopBar}>
              <View style={styles.lightTitleRow}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="sports-kabaddi"
                  name="sports_martial_arts"
                  size={22}
                />
                <Text style={styles.lightScreenTitle}>WORKOUT SCHEDULE</Text>
              </View>
              <Pressable style={styles.lightNotificationButton}>
                <GoogleMaterialSymbol
                  color="#2B3950"
                  fallbackName="notifications-none"
                  name="notifications"
                  size={22}
                />
              </Pressable>
            </View>

            <View style={styles.lightCalendarCard}>
              <View style={styles.lightCalendarHeader}>
                <View style={styles.lightCalendarCopy}>
                  <Text style={styles.lightCalendarMonth}>{getMonthLabel(selectedWeekStart)}</Text>
                </View>
                <View style={styles.lightCalendarActions}>
                  <Pressable
                    onPress={() => {
                      const today = new Date();
                      setSelectedWeekStart(startOfWeek(today));
                      setSelectedDayDate(formatDateKey(today));
                    }}
                    style={styles.lightTodayButton}
                  >
                    <Text style={styles.lightTodayButtonText}>Today</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedWeekStart((currentWeek) => addDays(currentWeek, -7))}
                    style={styles.lightNavButton}
                  >
                    <GoogleMaterialSymbol
                      color="#202B3E"
                      fallbackName="chevron-left"
                      name="chevron_left"
                      size={20}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedWeekStart((currentWeek) => addDays(currentWeek, 7))}
                    style={styles.lightNavButton}
                  >
                    <GoogleMaterialSymbol
                      color="#202B3E"
                      fallbackName="chevron-right"
                      name="chevron_right"
                      size={20}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.lightWeekHeaderRow}>
                {weekDays.map((day) => (
                  <Text key={`${day.dayDate}-label`} style={styles.lightWeekHeaderLabel}>
                    {day.shortLabel}
                  </Text>
                ))}
              </View>

              <View style={styles.lightWeekDaysRow}>
                {weekDays.map((day) => {
                  const isSelected = day.dayDate === selectedDayDate;
                  const isPlanned = draftDays.has(day.dayDate);
                  const isToday = day.dayDate === todayKey;

                  return (
                    <Pressable
                      key={day.dayDate}
                      onPress={() => setSelectedDayDate(day.dayDate)}
                      style={[
                        styles.lightDayTile,
                        isSelected ? styles.lightDayTileSelected : undefined,
                      ]}
                    >
                      <Text
                        style={[
                          styles.lightDayTileNumber,
                          isSelected ? styles.lightDayTileNumberSelected : undefined,
                        ]}
                      >
                        {day.dayNumber}
                      </Text>
                      {isPlanned || isToday ? (
                        <View
                          style={[
                            styles.lightDayDot,
                            isSelected ? styles.lightDayDotSelected : undefined,
                          ]}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text style={styles.lightSelectedDateTitle}>
              {selectedDay ? formatLongSelectedDate(selectedDay.dayDate) : ""}
            </Text>

            <View style={styles.lightSelectedCard}>
              {selectedWorkout ? (
                <>
                  <View style={styles.lightSelectedBadgeRow}>
                    <View style={styles.lightDifficultyBadge}>
                      <Text style={styles.lightDifficultyBadgeText}>
                        {selectedWorkout.difficulty.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.lightCategoryBadge}>
                      <Text style={styles.lightCategoryBadgeText}>
                        {selectedWorkout.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.lightSelectedWorkoutTitle}>{selectedWorkout.title}</Text>
                  <Text style={styles.lightSelectedWorkoutDescription}>
                    {selectedWorkout.description}
                  </Text>

                  <View style={styles.lightSelectedMetaRow}>
                    <View style={styles.lightSelectedMetaItem}>
                      <GoogleMaterialSymbol
                        color="#24344D"
                        fallbackName="schedule"
                        name="schedule"
                        size={20}
                      />
                      <Text style={styles.lightSelectedMetaText}>
                        {selectedWorkout.totalDurationMinutes} min
                      </Text>
                    </View>
                    <View style={styles.lightSelectedMetaItem}>
                      <GoogleMaterialSymbol
                        color="#24344D"
                        fallbackName="sports-kabaddi"
                        name="sports_martial_arts"
                        size={20}
                      />
                      <Text style={styles.lightSelectedMetaText}>
                        {selectedWorkout.exercises.length} drills
                      </Text>
                    </View>
                  </View>

                  <View style={styles.lightSelectedActions}>
                    <Pressable onPress={handleSavePlan} style={styles.lightPrimaryAction}>
                      <GoogleMaterialSymbol
                        color="#FFFFFF"
                        fallbackName="play-circle-outline"
                        name="play_circle"
                        size={20}
                      />
                      <Text style={styles.lightPrimaryActionText}>START</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleInspectWorkout(selectedWorkout)}
                      style={styles.lightSecondaryAction}
                    >
                      <GoogleMaterialSymbol
                        color="#415471"
                        fallbackName="edit"
                        name="edit"
                        size={20}
                      />
                    </Pressable>
                    <Pressable onPress={clearSelectedDay} style={styles.lightDeleteAction}>
                      <GoogleMaterialSymbol
                        color="#D40000"
                        fallbackName="delete-outline"
                        name="delete"
                        size={20}
                      />
                    </Pressable>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.lightEmptySelectionTitle}>No workout scheduled</Text>
                  <Text style={styles.lightEmptySelectionText}>
                    Select this day and schedule one of the available drills below.
                  </Text>
                  <Pressable
                    onPress={() => selectedDay && ensureSelectedDaySlot(selectedDay)}
                    style={styles.lightPrimaryAction}
                  >
                    <Text style={styles.lightPrimaryActionText}>SELECT DAY</Text>
                  </Pressable>
                </>
              )}
            </View>

            <View style={styles.lightAvailableHeader}>
              <Text style={styles.lightAvailableTitle}>Available Drills</Text>
              <Pressable>
                <Text style={styles.lightSeeAllText}>See All</Text>
              </Pressable>
            </View>

            {workouts.map((workout) => (
              <View key={workout.id} style={styles.lightWorkoutCard}>
                <ImageBackground
                  imageStyle={styles.lightWorkoutThumbImage}
                  source={{ uri: LIGHT_HERO_IMAGE_URI }}
                  style={styles.lightWorkoutThumb}
                />
                <View style={styles.lightWorkoutBody}>
                  <View style={styles.lightWorkoutTitleRow}>
                    <Text style={styles.lightWorkoutCardTitle}>{workout.title}</Text>
                    <Pressable onPress={() => handleInspectWorkout(workout)}>
                      <GoogleMaterialSymbol
                        color="#2B3950"
                        fallbackName="info-outline"
                        name="info"
                        size={24}
                      />
                    </Pressable>
                  </View>
                  <Text style={styles.lightWorkoutCardDescription}>{workout.description}</Text>
                  <View style={styles.lightWorkoutFooter}>
                    <Text style={styles.lightWorkoutFooterMeta}>
                      {workout.totalDurationMinutes} min   {workout.exercises.length} drills
                    </Text>
                    <Pressable
                      onPress={() => selectedDay && assignWorkout(selectedDay, workout)}
                      style={styles.lightScheduleButton}
                    >
                      <Text style={styles.lightScheduleButtonText}>SCHEDULE</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
    },
    content: {
      paddingHorizontal: isDarkTheme ? 14 : 16,
      paddingTop: 16,
      paddingBottom: 24,
      gap: 16,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
    },
    topBar: {
      gap: 8,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#34363A",
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.6,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    weekCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#46575C",
      backgroundColor: "#1E1D20",
      padding: 16,
      gap: 14,
    },
    weekHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
    },
    weekMeta: {
      gap: 4,
      flex: 1,
    },
    weekLabel: {
      color: theme.colors.textPrimary,
      fontSize: 22,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    weekRange: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
    },
    progressBadge: {
      minWidth: 72,
      minHeight: 32,
      borderRadius: 8,
      backgroundColor: "#34363A",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    progressBadgeText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    weekActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 10,
    },
    weekButton: {
      width: 38,
      height: 38,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#56656A",
      backgroundColor: "#19181B",
      alignItems: "center",
      justifyContent: "center",
    },
    summaryCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: "#46575C",
      backgroundColor: "#1A191C",
      padding: 16,
      gap: 8,
    },
    summaryTitle: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    summaryText: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    dayCard: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#46575C",
      backgroundColor: "#1D1D20",
      padding: 14,
      gap: 14,
    },
    dayHeader: {
      gap: 12,
    },
    dayMeta: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
    },
    dayBadge: {
      width: 58,
      minHeight: 68,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      backgroundColor: "#26262A",
    },
    dayBadgeSelected: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 4,
    },
    dayBadgeLabel: {
      color: theme.colors.primary,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    dayBadgeLabelSelected: {
      color: theme.colors.primaryText,
    },
    dayBadgeNumber: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "800",
    },
    dayDetails: {
      flex: 1,
      gap: 4,
    },
    dayTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "800",
    },
    dayDate: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    daySelectionStatus: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    toggleButton: {
      minHeight: 38,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#56656A",
      backgroundColor: "#19181B",
      alignItems: "center",
      justifyContent: "center",
    },
    toggleButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    toggleButtonDisabled: {
      backgroundColor: "#242427",
      borderColor: theme.colors.border,
    },
    toggleButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
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
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    workoutOptions: {
      gap: 10,
    },
    workoutOption: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#3F4D52",
      backgroundColor: "#16171A",
      padding: 12,
      gap: 4,
    },
    workoutOptionSelected: {
      borderColor: theme.colors.primary,
      backgroundColor: "#102226",
    },
    workoutOptionTitle: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: "700",
    },
    workoutOptionTitleSelected: {
      color: theme.colors.primary,
    },
    workoutOptionMeta: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    workoutOptionMetaSelected: {
      color: theme.colors.primary,
    },
    saveButton: {
      minHeight: 50,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 6,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 5,
    },
    saveButtonText: {
      color: theme.colors.primaryText,
      fontSize: 15,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
      marginBottom: 8,
    },
    lightTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    lightScreenTitle: {
      color: "#1560C8",
      fontSize: 24,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    lightNotificationButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightCalendarCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      padding: 18,
      gap: 18,
    },
    lightCalendarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
    },
    lightCalendarCopy: {
      flex: 1,
      gap: 2,
    },
    lightCalendarMonth: {
      color: "#1558BF",
      fontSize: 16,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2.2,
    },
    lightCalendarActions: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    lightTodayButton: {
      minWidth: 104,
      minHeight: 48,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: "#2364D0",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    lightTodayButtonText: {
      color: "#2364D0",
      fontSize: 18,
      fontWeight: "700",
    },
    lightNavButton: {
      width: 48,
      height: 48,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    lightWeekHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 4,
    },
    lightWeekHeaderLabel: {
      flex: 1,
      color: "#24344D",
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
    },
    lightWeekDaysRow: {
      flexDirection: "row",
      gap: 10,
    },
    lightDayTile: {
      flex: 1,
      minHeight: 62,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#E1DCD8",
      backgroundColor: "#F6F2EF",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    lightDayTileSelected: {
      backgroundColor: "#1560C8",
      borderColor: "#1560C8",
      shadowColor: "#1560C8",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    lightDayTileNumber: {
      color: "#111111",
      fontSize: 16,
      fontWeight: "700",
    },
    lightDayTileNumberSelected: {
      color: "#FFFFFF",
    },
    lightDayDot: {
      width: 6,
      height: 6,
      borderRadius: 999,
      backgroundColor: "#1560C8",
    },
    lightDayDotSelected: {
      backgroundColor: "#FFFFFF",
    },
    lightSelectedDateTitle: {
      color: "#111111",
      fontSize: 26,
      fontWeight: "800",
      marginTop: 6,
    },
    lightSelectedCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      padding: 20,
      gap: 16,
    },
    lightSelectedBadgeRow: {
      flexDirection: "row",
      gap: 10,
    },
    lightDifficultyBadge: {
      backgroundColor: "#F7D89A",
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    lightDifficultyBadgeText: {
      color: "#342915",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    lightCategoryBadge: {
      backgroundColor: "#C7D9F8",
      borderRadius: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    lightCategoryBadgeText: {
      color: "#405A86",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    lightSelectedWorkoutTitle: {
      color: "#151515",
      fontSize: 24,
      fontWeight: "800",
      lineHeight: 33,
    },
    lightSelectedWorkoutDescription: {
      color: "#2F4B73",
      fontSize: 16,
      lineHeight: 24,
    },
    lightSelectedMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 22,
      flexWrap: "wrap",
    },
    lightSelectedMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    lightSelectedMetaText: {
      color: "#24344D",
      fontSize: 15,
      fontWeight: "500",
    },
    lightSelectedActions: {
      flexDirection: "row",
      gap: 14,
      paddingTop: 4,
    },
    lightPrimaryAction: {
      flex: 1,
      minHeight: 70,
      borderRadius: 6,
      backgroundColor: "#1560C8",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 10,
    },
    lightPrimaryActionText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.8,
    },
    lightSecondaryAction: {
      width: 132,
      minHeight: 78,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    lightDeleteAction: {
      width: 132,
      minHeight: 78,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#E42313",
      backgroundColor: "#FFFFFF",
      alignItems: "center",
      justifyContent: "center",
    },
    lightEmptySelectionTitle: {
      color: "#151515",
      fontSize: 22,
      fontWeight: "800",
    },
    lightEmptySelectionText: {
      color: "#51627E",
      fontSize: 15,
      lineHeight: 22,
    },
    lightAvailableHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
    },
    lightAvailableTitle: {
      color: "#111111",
      fontSize: 22,
      fontWeight: "800",
    },
    lightSeeAllText: {
      color: "#1560C8",
      fontSize: 16,
      fontWeight: "700",
    },
    lightWorkoutCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      padding: 16,
      flexDirection: "row",
      gap: 14,
      alignItems: "center",
    },
    lightWorkoutThumb: {
      width: 88,
      height: 88,
      borderRadius: 8,
      overflow: "hidden",
      backgroundColor: "#D9E3F4",
    },
    lightWorkoutThumbImage: {
      borderRadius: 8,
    },
    lightWorkoutBody: {
      flex: 1,
      gap: 8,
    },
    lightWorkoutTitleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    lightWorkoutCardTitle: {
      flex: 1,
      color: "#151515",
      fontSize: 18,
      fontWeight: "700",
    },
    lightWorkoutCardDescription: {
      color: "#394B65",
      fontSize: 14,
      lineHeight: 21,
    },
    lightWorkoutFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    lightWorkoutFooterMeta: {
      color: "#24344D",
      fontSize: 14,
      fontWeight: "500",
    },
    lightScheduleButton: {
      minHeight: 42,
      borderRadius: 999,
      backgroundColor: "#2C73E1",
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    lightScheduleButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },
  });
}
