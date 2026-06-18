import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
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
import {
  mockCalendarWorkoutDays,
  mockMonthlySummary,
  type MockWorkoutStatus,
} from "./homeMocks";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

type CalendarDay = {
  key: string;
  dayNumber: number;
  date: string;
  status?: MockWorkoutStatus;
  isSunday: boolean;
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

function buildWorkoutStatusByDate(workoutLogs: MockWorkoutLogEntry[]) {
  const workoutStatusByDate = new Map<string, MockWorkoutStatus>();

  mockCalendarWorkoutDays.forEach((entry) => {
    workoutStatusByDate.set(entry.date, entry.status);
  });

  workoutLogs.forEach((entry) => {
    workoutStatusByDate.set(entry.completedDate, "completed");
  });

  return workoutStatusByDate;
}

function buildWeekDays(weekStartDate: Date, workoutLogs: MockWorkoutLogEntry[]): CalendarDay[] {
  const workoutStatusByDate = buildWorkoutStatusByDate(workoutLogs);

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
  const isDarkTheme = theme.name === "dark";
  const [selectedWeekStartDate, setSelectedWeekStartDate] = useState(() =>
    getStartOfWeekMonday(new Date()),
  );
  const weekDays = buildWeekDays(selectedWeekStartDate, workoutLogs);
  const displayedMonthLabel = formatMonthYear(addDays(selectedWeekStartDate, 6));
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
  const featuredWorkout = todayPlannedWorkout ?? workouts[0] ?? null;
  const monthlyCalories = mockMonthlySummary.completedWorkouts * 350;
  const dashboardSessions = 18;
  const dashboardHours = 24.5;

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
        ) : null}

        <View style={styles.header}>
          <Text style={styles.eyebrow}>Private coaching app</Text>
          <Text style={styles.title}>{isDarkTheme ? "THAI STRICKER" : "Thai Stricker"}</Text>
          <Text style={styles.subtitle}>Train sharp. Stay consistent.</Text>
        </View>

        {isDarkTheme ? (
          <>
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
                {[0.24, 0.38, 0.9, 0.3, 0.46, 1, 0.42].map((height, index) => (
                  <View
                    key={`activity-${index}`}
                    style={[
                      styles.activityBar,
                      index === 2 || index === 5 ? styles.activityBarActive : undefined,
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
          </>
        ) : (
          <>
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
          </>
        )}

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
                style={[styles.weekdayLabel, index === 6 ? styles.weekdayLabelSunday : undefined]}
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
                {day.status ? (
                  <View style={styles.weekDayDot} />
                ) : (
                  <View style={styles.weekDayDotSpacer} />
                )}
              </View>
            ))}
          </View>
        </View>

        <Pressable onPress={onOpenAiCoach} style={styles.coachCard}>
          {isDarkTheme ? (
            <GoogleMaterialSymbol
              size={108}
              color="rgba(0, 240, 255, 0.12)"
              fallbackName="psychology"
              name="psychology"
            />
          ) : null}
          <View style={styles.coachHeader}>
            {isDarkTheme ? (
              <View style={styles.coachTagRow}>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="bolt"
                  name="bolt"
                  size={18}
                />
                <Text style={styles.coachTag}>AI Coach Tip Of The Day</Text>
              </View>
            ) : (
              <Text style={styles.coachTag}>Local tips</Text>
            )}
          </View>
          <Text style={styles.coachMessage}>
            {isDarkTheme ? `"${randomCoachTip.shortTip}"` : randomCoachTip.shortTip}
          </Text>
          <Text style={styles.coachSupportText}>{randomCoachTip.explanation}</Text>
          {isDarkTheme ? null : (
            <Pressable onPress={onOpenAiCoach} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Open coach</Text>
            </Pressable>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.appBackground,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 18,
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
    eyebrow: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: isDarkTheme ? -0.8 : 0,
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    card: {
      backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : theme.colors.card,
      borderRadius: 18,
      padding: 18,
      gap: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: isDarkTheme ? 2 : 0,
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
      fontSize: isDarkTheme ? 24 : 20,
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
      backgroundColor: isDarkTheme ? "#2A2A2C" : theme.colors.surfaceMuted,
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
    difficultyBadge: {
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? theme.colors.primaryPressed : "transparent",
    },
    difficultyText: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: 12,
      fontWeight: "700",
    },
    workoutName: {
      color: theme.colors.textPrimary,
      fontSize: 24,
      fontWeight: "800",
      textTransform: isDarkTheme ? "uppercase" : "none",
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
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
      borderRadius: 14,
      padding: 12,
      gap: 4,
      minWidth: "30%",
      flexGrow: 1,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? theme.colors.border : "transparent",
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
      elevation: isDarkTheme ? 3 : 0,
    },
    primaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 16,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
      letterSpacing: isDarkTheme ? 0.8 : 0,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: 10,
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
      backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : theme.colors.card,
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
    summaryTile: {
      flex: 1,
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 10,
      alignItems: "center",
      gap: 6,
      borderWidth: isDarkTheme ? 1 : 0,
      borderColor: isDarkTheme ? theme.colors.border : "transparent",
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
      borderRadius: isDarkTheme ? 8 : 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surface,
      gap: 8,
      paddingVertical: 10,
    },
    weekDayColumnActive: {
      borderColor: isDarkTheme ? "#0EA5B7" : theme.colors.border,
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
      backgroundColor: isDarkTheme ? "#1DE7FF" : theme.colors.primary,
    },
    weekDayDotSpacer: {
      width: 10,
      height: 10,
    },
    coachCard: {
      backgroundColor: isDarkTheme ? theme.colors.surfaceMuted : theme.colors.cardElevated,
      borderRadius: 18,
      padding: 18,
      gap: 12,
      borderWidth: 1,
      borderColor: isDarkTheme ? theme.colors.primary : theme.colors.border,
      elevation: isDarkTheme ? 2 : 0,
      overflow: "hidden",
      position: "relative",
      paddingLeft: isDarkTheme ? 22 : 18,
    },
    coachCornerIcon: {
      position: "absolute",
      right: -8,
      top: -18,
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
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
      fontSize: isDarkTheme ? 14 : 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: isDarkTheme ? 0.8 : 0,
    },
    coachMessage: {
      color: theme.colors.textPrimary,
      fontSize: isDarkTheme ? 27 : 15,
      lineHeight: isDarkTheme ? 39 : 22,
      fontStyle: isDarkTheme ? "italic" : "normal",
      fontWeight: isDarkTheme ? "700" : "400",
      position: "relative",
      zIndex: 1,
    },
    coachSupportText: {
      color: theme.colors.textSecondary,
      fontSize: isDarkTheme ? 18 : 14,
      lineHeight: isDarkTheme ? 37 : 21,
      position: "relative",
      zIndex: 1,
    },
    secondaryButton: {
      alignSelf: "flex-start",
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: isDarkTheme ? theme.colors.cardElevated : theme.colors.surfaceMuted,
    },
    secondaryButtonText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
    },
  });
}
