import type { AppDataSnapshot, CalendarWorkoutDay, Workout } from "../../types/domain";

export type HomeDashboardMetrics = {
  calories: number;
  sessions: number;
  hours: string;
  consistency: number;
  activity: number[];
  heatmap: number[][];
};

export type HomeWeekDay = {
  key: string;
  number: number;
  status?: CalendarWorkoutDay["status"];
  isSunday: boolean;
};

export function formatHomeDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addHomeDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function getHomeWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
}

function isSameMonth(value: string, reference: Date) {
  return value.startsWith(`${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, "0")}`);
}

export function buildHomeDashboardMetrics(data: AppDataSnapshot, reference: Date): HomeDashboardMetrics {
  const today = formatHomeDate(reference);
  const monthLogs = data.workoutLogs.filter((item) => isSameMonth(item.completedDate, reference));
  const duration = monthLogs.reduce((sum, item) => sum + item.totalDurationMinutes, 0);
  const completedDates = new Set(monthLogs.map((item) => item.completedDate));
  const plannedDates = new Set(
    data.weeklyWorkoutPlans.flatMap((plan) => plan.plannedDays).filter((item) => isSameMonth(item.dayDate, reference)).map((item) => item.dayDate),
  );
  const missedDates = new Set(data.calendarWorkoutDays.filter((item) => item.status === "missed" && isSameMonth(item.date, reference)).map((item) => item.date));
  const elapsedDates = new Set([...plannedDates, ...missedDates, ...completedDates].filter((date) => date <= today));
  const consistency = elapsedDates.size ? Math.round((completedDates.size / elapsedDates.size) * 100) : completedDates.size ? 100 : 0;
  const activityTotals = Array.from({ length: 7 }, (_, index) => {
    const date = formatHomeDate(addHomeDays(reference, index - 6));
    return monthLogs.filter((item) => item.completedDate === date).reduce((sum, item) => sum + item.totalDurationMinutes, 0);
  });
  const maximum = Math.max(...activityTotals, 1);
  const heatmap = Array.from({ length: 4 }, (_, row) => Array.from({ length: 7 }, (_, column) => {
    const date = formatHomeDate(addHomeDays(reference, row * 7 + column - 27));
    const minutes = data.workoutLogs.filter((item) => item.completedDate === date).reduce((sum, item) => sum + item.totalDurationMinutes, 0);
    const status = data.calendarWorkoutDays.find((item) => item.date === date)?.status;
    if (minutes >= 45) return 3;
    if (minutes > 0) return 2;
    if (status === "planned" || status === "missed" || plannedDates.has(date)) return 1;
    return 0;
  }));
  return {
    calories: duration * 12,
    sessions: monthLogs.length || data.monthlySummary.completedWorkouts,
    hours: (duration / 60).toFixed(1),
    consistency,
    activity: activityTotals.map((value) => value / maximum),
    heatmap,
  };
}

export function getHomeWeekDays(start: Date, data: AppDataSnapshot): HomeWeekDay[] {
  const statusByDate = new Map<string, CalendarWorkoutDay["status"]>();
  data.calendarWorkoutDays.forEach((item) => statusByDate.set(item.date, item.status));
  data.workoutLogs.forEach((item) => statusByDate.set(item.completedDate, "completed"));
  data.weeklyWorkoutPlans.flatMap((plan) => plan.plannedDays).forEach((item) => {
    if (!statusByDate.has(item.dayDate)) statusByDate.set(item.dayDate, "planned");
  });
  return Array.from({ length: 7 }, (_, index) => {
    const date = addHomeDays(start, index);
    const key = formatHomeDate(date);
    return { key, number: date.getDate(), status: statusByDate.get(key), isSunday: index === 6 };
  });
}

export function getTodayWorkout(data: AppDataSnapshot, today: Date): Workout | undefined {
  const todayKey = formatHomeDate(today);
  const plannedDay = data.weeklyWorkoutPlans.flatMap((plan) => plan.plannedDays).find((item) => item.dayDate === todayKey);
  return plannedDay ? data.workouts.find((item) => item.id === plannedDay.workoutId) : undefined;
}

export function selectWorkoutToStart(data: AppDataSnapshot, today: Date): Workout | undefined {
  return getTodayWorkout(data, today) ?? data.workouts[Math.floor(Math.random() * Math.max(data.workouts.length, 1))];
}

