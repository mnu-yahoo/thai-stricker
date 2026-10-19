import type { WeeklyWorkoutPlan, Workout } from "../../types/domain";

export interface ScheduleRepository {
  saveWeeklyPlan(value: WeeklyWorkoutPlan): Promise<void>;
}

export function getMonday(date: Date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(12, 0, 0, 0);
  return result;
}

export function getWeekNumber(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const start = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil((((utc.getTime() - start.getTime()) / 86400000) + 1) / 7);
}

export function toScheduleDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getWeekDays(weekStart: Date, locale = "en-US") {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    return {
      date: toScheduleDate(date),
      label: new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "short" }).format(date),
    };
  });
}

export function buildWeeklyWorkoutPlan({
  current,
  weekStart,
  dayDate,
  dayLabel,
  workoutId,
  workouts,
  requiredTrainingDays,
  planId = `plan-${Date.now()}`,
}: {
  current?: WeeklyWorkoutPlan;
  weekStart: Date;
  dayDate: string;
  dayLabel: string;
  workoutId: string;
  workouts: Workout[];
  requiredTrainingDays: number;
  planId?: string;
}): WeeklyWorkoutPlan {
  const plannedDays = (current?.plannedDays ?? []).filter((day) => day.dayDate !== dayDate);
  const workout = workouts.find((item) => item.id === workoutId);
  if (workout) plannedDays.push({ dayDate, dayLabel, workoutId: workout.id, workoutTitle: workout.title });

  return {
    id: current?.id ?? planId,
    weekStartDate: toScheduleDate(weekStart),
    weekNumber: getWeekNumber(weekStart),
    year: weekStart.getFullYear(),
    requiredTrainingDays,
    plannedDays,
    source: "web",
  };
}

export async function saveSchedule(
  repository: ScheduleRepository,
  input: Parameters<typeof buildWeeklyWorkoutPlan>[0],
) {
  const plan = buildWeeklyWorkoutPlan(input);
  await repository.saveWeeklyPlan(plan);
}
