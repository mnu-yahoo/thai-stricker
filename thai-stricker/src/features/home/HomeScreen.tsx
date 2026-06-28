import { MaterialIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
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

import type { MockCoachTip } from "../aiCoach/coachTipsMocks";
import type { MockWeeklyWorkoutPlan } from "../plannedWorkouts/plannedWorkoutMocks";
import type { MockWorkoutLogEntry } from "../workoutLogging/workoutLogMocks";
import type { MockWorkout } from "../workouts/workoutMocks";
import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
import type { AppTheme } from "../../styles/theme";
import type {
  MockCalendarWorkoutDay,
  MockMonthlySummary,
  MockWorkoutStatus,
} from "./homeMocks";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const LIGHT_WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";
type CalendarDay = {
  key: string;
  dayNumber: number;
  date: string;
  status?: MockWorkoutStatus;
  isSunday: boolean;
};

type MonthlyDashboardMetrics = {
  summary: MockMonthlySummary;
  totalDurationMinutes: number;
  totalCompletedExercises: number;
  totalCalories: number;
  consistencyRate: number;
  activityBarHeights: number[];
  heatmapValues: number[][];
};

type HomeScreenProps = {
  theme: AppTheme;
  randomCoachTip: MockCoachTip;
  workoutLogs: MockWorkoutLogEntry[];
  weeklyWorkoutPlans: MockWeeklyWorkoutPlan[];
  workouts: MockWorkout[];
  calendarWorkoutDays: MockCalendarWorkoutDay[];
  monthlySummary: MockMonthlySummary;
  onStartWorkout: (workoutId: string) => void;
  onOpenAiCoach: () => void;
};

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getStartOfWeekMonday(date: Date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + diff);
  return start;
}

function formatMonthYear(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatMonthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
  });
}

function isSameMonth(dateString: string, referenceDate: Date) {
  const monthKey = `${referenceDate.getFullYear()}-${`${referenceDate.getMonth() + 1}`.padStart(2, "0")}`;
  return dateString.startsWith(monthKey);
}

function buildMonthlyDashboardMetrics(
  referenceDate: Date,
  workoutLogs: MockWorkoutLogEntry[],
  weeklyWorkoutPlans: MockWeeklyWorkoutPlan[],
  calendarWorkoutDays: MockCalendarWorkoutDay[],
): MonthlyDashboardMetrics {
  const todayDate = formatLocalDate(referenceDate);
  const monthLogs = workoutLogs.filter((entry) => isSameMonth(entry.completedDate, referenceDate));
  const totalDurationMinutes = monthLogs.reduce(
    (total, entry) => total + entry.totalDurationMinutes,
    0,
  );
  const totalCompletedExercises = monthLogs.reduce(
    (total, entry) => total + entry.completedExerciseCount,
    0,
  );
  const totalCalories = monthLogs.reduce(
    (total, entry) => total + entry.totalDurationMinutes * 12,
    0,
  );

  const completedDates = new Set(monthLogs.map((entry) => entry.completedDate));
  const plannedDates = new Set(
    weeklyWorkoutPlans
      .flatMap((plan) => plan.plannedDays)
      .filter((plannedDay) => isSameMonth(plannedDay.dayDate, referenceDate))
      .map((plannedDay) => plannedDay.dayDate),
  );
  const explicitPlannedDates = new Set(
    calendarWorkoutDays
      .filter((entry) => entry.status === "planned" && isSameMonth(entry.date, referenceDate))
      .map((entry) => entry.date),
  );
  const missedDates = new Set(
    calendarWorkoutDays
      .filter((entry) => entry.status === "missed" && isSameMonth(entry.date, referenceDate))
      .map((entry) => entry.date),
  );

  const futurePlannedDates = new Set(
    [...plannedDates, ...explicitPlannedDates].filter(
      (date) => !completedDates.has(date) && !missedDates.has(date),
    ),
  );

  const elapsedScheduledDates = new Set(
    [...plannedDates, ...missedDates, ...completedDates].filter((date) => date <= todayDate),
  );
  const consistencyRate =
    elapsedScheduledDates.size > 0
      ? Math.round((completedDates.size / elapsedScheduledDates.size) * 100)
      : completedDates.size > 0
        ? 100
        : 0;

  const activityBarTotals = Array.from({ length: 7 }, (_, index) => {
    const dayDate = formatLocalDate(addDays(referenceDate, index - 6));
    return workoutLogs
      .filter((entry) => entry.completedDate === dayDate)
      .reduce((total, entry) => total + entry.totalDurationMinutes, 0);
  });
  const maxActivityBarTotal = Math.max(...activityBarTotals, 1);
  const activityBarHeights = activityBarTotals.map((total) => total / maxActivityBarTotal);

  const heatmapValues = Array.from({ length: 4 }, (_, rowIndex) =>
    Array.from({ length: 7 }, (_, columnIndex) => {
      const dayOffset = rowIndex * 7 + columnIndex;
      const dayDate = formatLocalDate(addDays(referenceDate, dayOffset - 27));
      const dayDurationMinutes = workoutLogs
        .filter((entry) => entry.completedDate === dayDate)
        .reduce((total, entry) => total + entry.totalDurationMinutes, 0);
      const dayStatus = calendarWorkoutDays.find((entry) => entry.date === dayDate)?.status;

      if (dayDurationMinutes >= 45) {
        return 3;
      }

      if (dayDurationMinutes > 0) {
        return 2;
      }

      if (dayStatus === "planned" || dayStatus === "missed" || plannedDates.has(dayDate)) {
        return 1;
      }

      return 0;
    }),
  );

  return {
    summary: {
      completedWorkouts: monthLogs.length,
      plannedWorkouts: futurePlannedDates.size,
      missedWorkouts: missedDates.size,
    },
    totalDurationMinutes,
    totalCompletedExercises,
    totalCalories,
    consistencyRate,
    activityBarHeights,
    heatmapValues,
  };
}

function buildWorkoutStatusByDate(
  workoutLogs: MockWorkoutLogEntry[],
  calendarWorkoutDays: MockCalendarWorkoutDay[],
) {
  const workoutStatusByDate = new Map<string, MockWorkoutStatus>();

  calendarWorkoutDays.forEach((entry) => {
    workoutStatusByDate.set(entry.date, entry.status);
  });

  workoutLogs.forEach((entry) => {
    workoutStatusByDate.set(entry.completedDate, "completed");
  });

  return workoutStatusByDate;
}

function buildWeekDays(
  weekStartDate: Date,
  workoutLogs: MockWorkoutLogEntry[],
  calendarWorkoutDays: MockCalendarWorkoutDay[],
): CalendarDay[] {
  const workoutStatusByDate = buildWorkoutStatusByDate(workoutLogs, calendarWorkoutDays);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStartDate, index);
    const dayDate = formatLocalDate(date);

    return {
      key: dayDate,
      dayNumber: date.getDate(),
      date: dayDate,
      status: workoutStatusByDate.get(dayDate),
      isSunday: index === 6,
    };
  });
}

function getDayStyle(theme: AppTheme, status?: MockWorkoutStatus) {
  if (!status) {
    return {
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    };
  }

  if (theme.name === "dark") {
    return {
      backgroundColor: "#12333A",
      borderColor: "#0EA5B7",
    };
  }

  const statusColors = getWorkoutStatusColors(theme);

  return {
    backgroundColor: `${statusColors[status]}1A`,
    borderColor: statusColors[status],
  };
}

function getWorkoutStatusColors(theme: AppTheme): Record<MockWorkoutStatus, string> {
  return {
    completed: theme.colors.success,
    planned: theme.colors.warning,
    missed: theme.colors.danger,
  };
}

function getLightDayVariant(status?: MockWorkoutStatus, isToday?: boolean) {
  if (isToday) {
    return {
      backgroundColor: "#FFFFFF",
      borderColor: "#1560C8",
      numberColor: "#1560C8",
      indicator: "dot" as const,
    };
  }

  if (status === "completed") {
    return {
      backgroundColor: "#1560C8",
      borderColor: "#1560C8",
      numberColor: "#FFFFFF",
      indicator: "check" as const,
    };
  }

  return {
    backgroundColor: "#F1EEEC",
    borderColor: "#F1EEEC",
    numberColor: "#4A6793",
    indicator: "number" as const,
  };
}

export function HomeScreen({
  theme,
  randomCoachTip,
  workoutLogs,
  weeklyWorkoutPlans,
  workouts,
  calendarWorkoutDays,
  monthlySummary,
  onStartWorkout,
  onOpenAiCoach,
}: HomeScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState(() =>
    getStartOfWeekMonday(new Date()),
  );
  const today = new Date();
  const weekDays = buildWeekDays(selectedWeekStartDate, workoutLogs, calendarWorkoutDays);
  const displayedMonthLabel = formatMonthYear(addDays(selectedWeekStartDate, 6));
  const activityMonthLabel = formatMonthLabel(today);
  const todayDate = formatLocalDate(today);
  const todayPlannedDay = weeklyWorkoutPlans
    .flatMap((plan) => plan.plannedDays)
    .find((plannedDay) => plannedDay.dayDate === todayDate);
  const todayPlannedWorkout = todayPlannedDay
    ? workouts.find((workout) => workout.id === todayPlannedDay.workoutId) ?? null
    : null;
  const featuredWorkout = todayPlannedWorkout ?? workouts[0] ?? null;
  const dashboardMetrics = useMemo(
    () =>
      buildMonthlyDashboardMetrics(today, workoutLogs, weeklyWorkoutPlans, calendarWorkoutDays),
    [calendarWorkoutDays, todayDate, weeklyWorkoutPlans, workoutLogs],
  );
  const effectiveMonthlySummary =
    dashboardMetrics.summary.completedWorkouts > 0 ||
    dashboardMetrics.summary.plannedWorkouts > 0 ||
    dashboardMetrics.summary.missedWorkouts > 0
      ? dashboardMetrics.summary
      : monthlySummary;
  const monthlyCalories = dashboardMetrics.totalCalories;
  const dashboardSessions = effectiveMonthlySummary.completedWorkouts;
  const dashboardHours = (dashboardMetrics.totalDurationMinutes / 60).toFixed(1);
  const lightSessionCalories = featuredWorkout ? featuredWorkout.totalDurationMinutes * 12 : 0;
  const lightConsistency = dashboardMetrics.consistencyRate;
  const lightTotalWorkouts = effectiveMonthlySummary.completedWorkouts;
  const lightTotalHours = (dashboardMetrics.totalDurationMinutes / 60).toFixed(1);

  const handleStartPlannedOrRandomWorkout = () => {
    if (todayPlannedWorkout) {
      onStartWorkout(todayPlannedWorkout.id);
      return;
    }

    if (workouts.length === 0) {
      Alert.alert("No workouts", "No workouts are available right now.");
      return;
    }

    const randomWorkout = workouts[Math.floor(Math.random() * workouts.length)];
    onStartWorkout(randomWorkout.id);
  };

  const handleShowPreviousWeek = () => {
    setSelectedWeekStartDate((currentDate) => addDays(currentDate, -7));
  };

  const handleShowNextWeek = () => {
    setSelectedWeekStartDate((currentDate) => addDays(currentDate, 7));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <>
            <View style={styles.darkTopBar}>
              <View style={styles.brandRow}>
                <View style={styles.brandBadge}>
                  <GoogleMaterialSymbol
                    color={theme.colors.primary}
                    fallbackName="account-circle"
                    name="account_circle"
                    size={28}
                  />
                </View>
                <Text style={styles.darkHubTitle}>Training Hub</Text>
              </View>
              <Pressable style={styles.iconButton}>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="notifications-none"
                  name="notifications"
                  size={22}
                />
              </Pressable>
            </View>

            <View style={styles.header}>
              <Text style={styles.eyebrow}>Private coaching app</Text>
              <Text style={styles.title}>THAI STRICKER</Text>
              <Text style={styles.subtitle}>Train sharp. Stay consistent.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Today's Workout</Text>
                <Text style={styles.linkText}>View routine</Text>
              </View>

              {featuredWorkout ? (
                <ImageBackground
                  imageStyle={styles.heroImage}
                  source={{ uri: HERO_IMAGE_URI }}
                  style={styles.heroCard}
                >
                  <View style={styles.heroOverlay} />
                  <View style={styles.heroContent}>
                    <View style={styles.heroTagRow}>
                      <View style={styles.heroBadge}>
                        <Text style={styles.heroBadgeText}>{featuredWorkout.difficulty}</Text>
                      </View>
                      <Text style={styles.heroMetaText}>
                        {featuredWorkout.totalDurationMinutes} mins
                      </Text>
                    </View>
                    <Text style={styles.heroTitle}>{featuredWorkout.title}</Text>
                    <View style={styles.heroFooter}>
                      <Text style={styles.heroDescription}>
                        Focus: {featuredWorkout.description || "Explosive strikes and balance"}
                      </Text>
                      <Pressable
                        onPress={handleStartPlannedOrRandomWorkout}
                        style={styles.heroPlayButton}
                      >
                        <GoogleMaterialSymbol
                          color={theme.colors.primaryText}
                          fallbackName="play-arrow"
                          name="play_arrow"
                          size={18}
                        />
                      </Pressable>
                    </View>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.heroFallback}>
                  <Text style={styles.workoutFocus}>
                    No training planned today. Have a rest. Or start a random workout.
                  </Text>
                  <Pressable
                    onPress={handleStartPlannedOrRandomWorkout}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Start random workout</Text>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.sectionEyebrow}>Monthly activity</Text>
                <MaterialIcons name="trending-up" size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.monthlyHighlight}>
                {monthlyCalories.toLocaleString()} <Text style={styles.monthlyUnit}>KCAL</Text>
              </Text>
              <View style={styles.activityBars}>
                {dashboardMetrics.activityBarHeights.map((height, index) => (
                  <View
                    key={`activity-${index}`}
                    style={[
                      styles.activityBar,
                      height > 0 ? styles.activityBarActive : undefined,
                      { height: 22 + height * 26 },
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.miniCardGrid}>
              <View style={styles.miniCard}>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="badge"
                  name="app_badging"
                  size={24}
                />
                <Text style={styles.miniLabel}>Sessions</Text>
                <Text style={styles.miniValue}>{dashboardSessions}</Text>
              </View>
              <View style={styles.miniCard}>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="schedule"
                  name="schedule"
                  size={24}
                />
                <Text style={styles.miniLabel}>Hours</Text>
                <Text style={styles.miniValue}>{dashboardHours}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>{displayedMonthLabel}</Text>
                <View style={styles.calendarNavRow}>
                  <Pressable onPress={handleShowPreviousWeek} style={styles.calendarNavButton}>
                    <GoogleMaterialSymbol
                      color={theme.colors.textPrimary}
                      fallbackName="chevron-left"
                      name="chevron_left"
                      size={24}
                    />
                  </Pressable>
                  <Pressable onPress={handleShowNextWeek} style={styles.calendarNavButton}>
                    <GoogleMaterialSymbol
                      color={theme.colors.textPrimary}
                      fallbackName="chevron-right"
                      name="chevron_right"
                      size={24}
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.weekdayRow}>
                {WEEKDAY_LABELS.map((label, index) => (
                  <Text
                    key={`${label}-${index}`}
                    style={[
                      styles.weekdayLabel,
                      index === 6 ? styles.weekdayLabelSunday : undefined,
                    ]}
                  >
                    {label}
                  </Text>
                ))}
              </View>

              <View style={styles.weekStrip}>
                {weekDays.map((day) => (
                  <View
                    key={day.key}
                    style={[
                      styles.weekDayColumn,
                      day.status ? styles.weekDayColumnActive : undefined,
                      getDayStyle(theme, day.status),
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekDayNumber,
                        day.status ? styles.weekDayNumberActive : undefined,
                        day.isSunday ? styles.weekDayNumberSunday : undefined,
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                    {day.status ? <View style={styles.weekDayDot} /> : <View style={styles.weekDayDotSpacer} />}
                  </View>
                ))}
              </View>
            </View>

            <Pressable onPress={onOpenAiCoach} style={styles.coachCard}>
              <GoogleMaterialSymbol
                size={108}
                color="rgba(0, 240, 255, 0.12)"
                fallbackName="psychology"
                name="psychology"
              />
              <View style={styles.coachHeader}>
                <View style={styles.coachTagRow}>
                  <GoogleMaterialSymbol
                    color={theme.colors.primary}
                    fallbackName="bolt"
                    name="bolt"
                    size={18}
                  />
                  <Text style={styles.coachTag}>AI Coach Tip Of The Day</Text>
                </View>
              </View>
              <Text style={styles.coachMessage}>"{randomCoachTip.shortTip}"</Text>
              <Text style={styles.coachSupportText}>{randomCoachTip.explanation}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.lightTopBar}>
              <View style={styles.lightBrandRow}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="sports-kabaddi"
                  name="sports_martial_arts"
                  size={28}
                />
                <Text style={styles.lightBrandTitle}>MUAY THAI PRO</Text>
              </View>
              <Pressable style={styles.lightTopIconButton}>
                <GoogleMaterialSymbol
                  color="#395A88"
                  fallbackName="notifications-none"
                  name="notifications"
                  size={24}
                />
              </Pressable>
            </View>

            <View style={styles.lightWeekRow}>
              {weekDays.map((day, index) => {
                const isToday = day.date === todayDate;
                const dayVariant = getLightDayVariant(day.status, isToday);

                return (
                  <View key={day.key} style={styles.lightWeekDay}>
                    <Text style={styles.lightWeekLabel}>{LIGHT_WEEKDAY_LABELS[index]}</Text>
                    <View
                      style={[
                        styles.lightWeekPill,
                        {
                          backgroundColor: dayVariant.backgroundColor,
                          borderColor: dayVariant.borderColor,
                        },
                      ]}
                    >
                      {dayVariant.indicator === "check" ? (
                        <GoogleMaterialSymbol
                          color="#FFFFFF"
                          fallbackName="check"
                          name="check"
                          size={24}
                        />
                      ) : dayVariant.indicator === "dot" ? (
                        <View style={styles.lightWeekCurrentDot} />
                      ) : (
                        <Text style={[styles.lightWeekNumber, { color: dayVariant.numberColor }]}>
                          {day.dayNumber}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.lightHeroCard}>
              {featuredWorkout ? (
                <>
                  <View style={styles.lightHeroHeader}>
                    <View style={styles.lightHeroBadge}>
                      <Text style={styles.lightHeroBadgeText}>TODAY&apos;S SESSION</Text>
                    </View>
                    <View style={styles.lightHeroDurationRow}>
                      <GoogleMaterialSymbol
                        color="#4A6793"
                        fallbackName="schedule"
                        name="schedule"
                        size={20}
                      />
                      <Text style={styles.lightHeroDurationText}>
                        {featuredWorkout.totalDurationMinutes} min
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.lightHeroTitle}>{featuredWorkout.title}</Text>
                  <Text style={styles.lightHeroDescription}>
                    {featuredWorkout.description || "No workout description available."}
                  </Text>
                  <View style={styles.lightHeroMetaRow}>
                    <View style={styles.lightMetaItem}>
                      <GoogleMaterialSymbol
                        color="#1560C8"
                        fallbackName="sports-kabaddi"
                        name="sports_martial_arts"
                        size={18}
                      />
                      <Text style={styles.lightMetaText}>{featuredWorkout.difficulty}</Text>
                    </View>
                    <View style={styles.lightMetaItem}>
                      <GoogleMaterialSymbol
                        color="#D91E18"
                        fallbackName="local-fire-department"
                        name="local_fire_department"
                        size={18}
                      />
                      <Text style={styles.lightMetaText}>{lightSessionCalories} kcal</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={handleStartPlannedOrRandomWorkout}
                    style={styles.lightPrimaryButton}
                  >
                    <Text style={styles.lightPrimaryButtonText}>Start Workout</Text>
                    <GoogleMaterialSymbol
                      color="#FFFFFF"
                      fallbackName="play-arrow"
                      name="play_arrow"
                      size={20}
                    />
                  </Pressable>
                </>
              ) : (
                <>
                  <View style={styles.lightHeroHeader}>
                    <View style={styles.lightHeroBadge}>
                      <Text style={styles.lightHeroBadgeText}>TODAY&apos;S SESSION</Text>
                    </View>
                  </View>
                  <Text style={styles.lightHeroTitle}>Recovery Day</Text>
                  <Text style={styles.lightHeroDescription}>
                    No training is planned today. You can still launch a random workout session.
                  </Text>
                  <Pressable
                    onPress={handleStartPlannedOrRandomWorkout}
                    style={styles.lightPrimaryButton}
                  >
                    <Text style={styles.lightPrimaryButtonText}>Start Workout</Text>
                    <GoogleMaterialSymbol
                      color="#FFFFFF"
                      fallbackName="play-arrow"
                      name="play_arrow"
                      size={20}
                    />
                  </Pressable>
                </>
              )}
            </View>

            <View style={styles.lightSection}>
              <Text style={styles.lightSectionTitle}>{activityMonthLabel} Activity</Text>
              <View style={styles.lightActivityRow}>
                <View style={styles.lightConsistencyCard}>
                  <View style={styles.lightHeatmapGrid}>
                    {dashboardMetrics.heatmapValues.map((row, rowIndex) =>
                      row.map((value, columnIndex) => (
                        <View
                          key={`heat-${rowIndex}-${columnIndex}`}
                          style={[
                            styles.lightHeatmapCell,
                            value === 3
                              ? styles.lightHeatmapCellStrong
                              : value === 2
                                ? styles.lightHeatmapCellMedium
                                : value === 1
                                  ? styles.lightHeatmapCellSoft
                                  : styles.lightHeatmapCellEmpty,
                          ]}
                        />
                      )),
                    )}
                  </View>
                  <Text style={styles.lightConsistencyText}>Consistency: {lightConsistency}%</Text>
                </View>

                <View style={styles.lightStatsColumn}>
                  <View style={styles.lightStatCard}>
                    <Text style={styles.lightStatLabel}>Total Workouts</Text>
                    <Text style={styles.lightStatValue}>{lightTotalWorkouts}</Text>
                  </View>
                  <View style={styles.lightStatCard}>
                    <Text style={styles.lightStatLabel}>Total Hours</Text>
                    <Text style={styles.lightStatValue}>
                      {lightTotalHours} <Text style={styles.lightStatUnit}>hrs</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <Pressable onPress={onOpenAiCoach} style={styles.lightCoachCard}>
              <View style={styles.lightCoachWatermark}>
                <GoogleMaterialSymbol
                  color="rgba(134, 161, 207, 0.18)"
                  fallbackName="smart-toy"
                  name="smart_toy"
                  size={96}
                />
              </View>
              <View style={styles.lightCoachIdentity}>
                <View style={styles.lightCoachIconTile}>
                  <GoogleMaterialSymbol
                    color="#FFFFFF"
                    fallbackName="smart-toy"
                    name="smart_toy"
                    size={24}
                  />
                </View>
                <Text style={styles.lightCoachName}>AI Coach Tip</Text>
              </View>
              <Text style={styles.lightCoachMessage}>"{randomCoachTip.shortTip}"</Text>
              <Pressable onPress={onOpenAiCoach} style={styles.lightCoachButton}>
                <GoogleMaterialSymbol
                  color="#0A2348"
                  fallbackName="chat-bubble-outline"
                  name="chat"
                  size={20}
                />
                <Text style={styles.lightCoachButtonText}>Chat with AI Coach</Text>
              </Pressable>
            </Pressable>
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
      backgroundColor: isDarkTheme ? theme.colors.appBackground : "#F7F3F0",
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 28,
      gap: 16,
    },
    header: {
      paddingTop: 8,
      gap: 8,
    },
    darkTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    brandBadge: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    darkHubTitle: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
      marginBottom: 10,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
    },
    lightBrandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    lightBrandTitle: {
      flexShrink: 1,
      color: "#1558BF",
      fontSize: 24,
      fontWeight: "800",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    lightTopIconButton: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: -0.8,
      textTransform: "uppercase",
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    card: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 18,
      padding: 18,
      gap: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: 2,
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
    linkText: {
      color: theme.colors.primary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    sectionEyebrow: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    calendarHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    calendarTitle: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
    },
    calendarNavRow: {
      flexDirection: "row",
      gap: 12,
    },
    calendarNavButton: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor: "#2A2A2C",
      alignItems: "center",
      justifyContent: "center",
    },
    heroCard: {
      minHeight: 138,
      borderRadius: 8,
      overflow: "hidden",
      justifyContent: "flex-end",
      backgroundColor: theme.colors.cardElevated,
    },
    heroImage: {
      borderRadius: 8,
    },
    heroOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: "rgba(5, 9, 12, 0.42)",
    },
    heroContent: {
      padding: 14,
      gap: 8,
    },
    heroTagRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    heroBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      alignSelf: "flex-start",
    },
    heroBadgeText: {
      color: theme.colors.primaryText,
      fontSize: 10,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    heroMetaText: {
      color: "#E5E1E4",
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    heroTitle: {
      color: "#FFFFFF",
      fontSize: 27,
      fontStyle: "italic",
      fontWeight: "800",
      textTransform: "uppercase",
    },
    heroFooter: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 12,
    },
    heroDescription: {
      flex: 1,
      color: "#E5E1E4",
      fontSize: 14,
      lineHeight: 18,
    },
    heroPlayButton: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    heroFallback: {
      gap: 14,
    },
    workoutFocus: {
      color: theme.colors.textSecondary,
      fontSize: 15,
      lineHeight: 21,
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 14,
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      elevation: 3,
    },
    primaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    monthlyHighlight: {
      color: theme.colors.primary,
      fontSize: 38,
      fontWeight: "800",
    },
    monthlyUnit: {
      color: theme.colors.textSecondary,
      fontSize: 18,
      fontWeight: "700",
    },
    activityBars: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: 6,
      minHeight: 48,
      marginTop: 2,
    },
    activityBar: {
      flex: 1,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      opacity: 0.9,
    },
    activityBarActive: {
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    miniCardGrid: {
      flexDirection: "row",
      gap: 12,
    },
    miniCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 6,
    },
    miniLabel: {
      color: theme.colors.textSecondary,
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
    },
    miniValue: {
      color: theme.colors.textPrimary,
      fontSize: 32,
      fontWeight: "800",
    },
    weekdayRow: {
      flexDirection: "row",
      marginBottom: 18,
    },
    weekdayLabel: {
      flex: 1,
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textAlign: "center",
      textTransform: "uppercase",
    },
    weekdayLabelSunday: {
      color: theme.colors.primary,
    },
    weekStrip: {
      flexDirection: "row",
      gap: 8,
    },
    weekDayColumn: {
      flex: 1,
      minHeight: 72,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.cardElevated,
      gap: 8,
      paddingVertical: 10,
    },
    weekDayColumnActive: {
      borderColor: "#0EA5B7",
    },
    weekDayNumber: {
      color: theme.colors.textMuted,
      fontSize: 18,
      fontWeight: "500",
    },
    weekDayNumberActive: {
      color: theme.colors.textPrimary,
      fontWeight: "800",
    },
    weekDayNumberSunday: {
      color: theme.colors.primary,
    },
    weekDayDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      backgroundColor: "#1DE7FF",
    },
    weekDayDotSpacer: {
      width: 10,
      height: 10,
    },
    coachCard: {
      backgroundColor: theme.colors.surfaceMuted,
      borderRadius: 18,
      padding: 18,
      gap: 12,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      elevation: 2,
      overflow: "hidden",
      position: "relative",
      paddingLeft: 22,
    },
    coachHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      position: "relative",
      zIndex: 1,
    },
    coachTagRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    coachTag: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    coachMessage: {
      color: theme.colors.textPrimary,
      fontSize: 27,
      lineHeight: 39,
      fontStyle: "italic",
      fontWeight: "700",
      position: "relative",
      zIndex: 1,
    },
    coachSupportText: {
      color: theme.colors.textSecondary,
      fontSize: 18,
      lineHeight: 37,
      position: "relative",
      zIndex: 1,
    },
    lightWeekRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 14,
    },
    lightWeekDay: {
      flex: 1,
      alignItems: "center",
      gap: 10,
    },
    lightWeekLabel: {
      color: "#3D5E8C",
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.1,
    },
    lightWeekPill: {
      width: "100%",
      aspectRatio: 1,
      maxWidth: 54,
      borderRadius: 16,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    lightWeekCurrentDot: {
      width: 12,
      height: 12,
      borderRadius: 999,
      backgroundColor: "#1560C8",
    },
    lightWeekNumber: {
      fontSize: 16,
      fontWeight: "700",
    },
    lightHeroCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      padding: 22,
      gap: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      shadowColor: "#395A88",
      shadowOpacity: 0.07,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    lightHeroHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    lightHeroBadge: {
      backgroundColor: "#E8EEF8",
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    lightHeroBadgeText: {
      color: "#1558BF",
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    lightHeroDurationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lightHeroDurationText: {
      color: "#22324C",
      fontSize: 14,
      fontWeight: "500",
    },
    lightHeroTitle: {
      color: "#151515",
      fontSize: 28,
      lineHeight: 37,
      fontWeight: "800",
    },
    lightHeroDescription: {
      color: "#2F4B73",
      fontSize: 16,
      lineHeight: 24,
    },
    lightHeroMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 20,
      flexWrap: "wrap",
    },
    lightMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lightMetaText: {
      color: "#243B5E",
      fontSize: 15,
      fontWeight: "500",
    },
    lightPrimaryButton: {
      minHeight: 72,
      backgroundColor: "#1560C8",
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: "#1560C8",
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    lightPrimaryButtonText: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },
    lightSection: {
      gap: 16,
      marginTop: 10,
    },
    lightSectionTitle: {
      color: "#111111",
      fontSize: 22,
      fontWeight: "800",
    },
    lightActivityRow: {
      flexDirection: "row",
      gap: 12,
      alignItems: "stretch",
    },
    lightConsistencyCard: {
      flex: 1,
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E1DBD6",
      padding: 14,
      gap: 12,
      shadowColor: "#395A88",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    lightHeatmapGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    lightHeatmapCell: {
      width: 19,
      height: 19,
      borderRadius: 3,
    },
    lightHeatmapCellStrong: {
      backgroundColor: "#1560C8",
    },
    lightHeatmapCellMedium: {
      backgroundColor: "#7FA7DD",
    },
    lightHeatmapCellSoft: {
      backgroundColor: "#D8E6F7",
    },
    lightHeatmapCellEmpty: {
      backgroundColor: "#E9E3DE",
    },
    lightConsistencyText: {
      color: "#1560C8",
      fontSize: 15,
      fontWeight: "700",
    },
    lightStatsColumn: {
      flex: 1,
      gap: 12,
    },
    lightStatCard: {
      flex: 1,
      minHeight: 86,
      backgroundColor: "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#E1DBD6",
      paddingHorizontal: 18,
      paddingVertical: 16,
      gap: 10,
      shadowColor: "#395A88",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 1,
    },
    lightStatLabel: {
      color: "#4A6793",
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 17,
    },
    lightStatValue: {
      color: "#111111",
      fontSize: 26,
      fontWeight: "800",
    },
    lightStatUnit: {
      color: "#111111",
      fontSize: 14,
      fontWeight: "500",
    },
    lightCoachCard: {
      backgroundColor: "#082349",
      borderRadius: 14,
      padding: 22,
      gap: 14,
      borderWidth: 1,
      borderColor: "#0E376F",
      marginTop: 10,
      overflow: "hidden",
      position: "relative",
    },
    lightCoachIdentity: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      position: "relative",
      zIndex: 1,
    },
    lightCoachIconTile: {
      width: 54,
      height: 54,
      borderRadius: 14,
      backgroundColor: "#1560C8",
      alignItems: "center",
      justifyContent: "center",
    },
    lightCoachName: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "800",
    },
    lightCoachWatermark: {
      position: "absolute",
      right: 18,
      top: 22,
    },
    lightCoachMessage: {
      color: "#E8EDF7",
      fontSize: 16,
      lineHeight: 25,
      fontStyle: "italic",
      fontWeight: "500",
      position: "relative",
      zIndex: 1,
    },
    lightCoachButton: {
      minHeight: 58,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "#E6ECF5",
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      alignSelf: "flex-start",
      paddingHorizontal: 18,
      position: "relative",
      zIndex: 1,
    },
    lightCoachButtonText: {
      color: "#0A2348",
      fontSize: 15,
      fontWeight: "700",
    },
  });
}
