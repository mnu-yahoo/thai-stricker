import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import type { AppDataSnapshot, CalendarWorkoutDay } from "../../types/domain";
import "./home-dashboard.css";

const HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

const DARK_WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const LIGHT_WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  result.setHours(12, 0, 0, 0);
  result.setDate(result.getDate() + (day === 0 ? -6 : 1 - day));
  return result;
}

function isSameMonth(value: string, reference: Date) {
  return value.startsWith(`${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, "0")}`);
}

function buildMetrics(data: AppDataSnapshot, reference: Date) {
  const today = formatLocalDate(reference);
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
    const date = formatLocalDate(addDays(reference, index - 6));
    return monthLogs.filter((item) => item.completedDate === date).reduce((sum, item) => sum + item.totalDurationMinutes, 0);
  });
  const maximum = Math.max(...activityTotals, 1);
  const heatmap = Array.from({ length: 4 }, (_, row) => Array.from({ length: 7 }, (_, column) => {
    const date = formatLocalDate(addDays(reference, row * 7 + column - 27));
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

function weekDays(start: Date, data: AppDataSnapshot) {
  const statusByDate = new Map<string, CalendarWorkoutDay["status"]>();
  data.calendarWorkoutDays.forEach((item) => statusByDate.set(item.date, item.status));
  data.workoutLogs.forEach((item) => statusByDate.set(item.completedDate, "completed"));
  data.weeklyWorkoutPlans.flatMap((plan) => plan.plannedDays).forEach((item) => {
    if (!statusByDate.has(item.dayDate)) statusByDate.set(item.dayDate, "planned");
  });
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const key = formatLocalDate(date);
    return { key, number: date.getDate(), status: statusByDate.get(key), isSunday: index === 6 };
  });
}

export function HomeDashboard({ data }: { data: AppDataSnapshot }) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = formatLocalDate(today);
  const [selectedWeek, setSelectedWeek] = useState(() => startOfWeek(today));
  const metrics = useMemo(() => buildMetrics(data, today), [data, today]);
  const days = useMemo(() => weekDays(selectedWeek, data), [selectedWeek, data]);
  const plannedDay = data.weeklyWorkoutPlans.flatMap((plan) => plan.plannedDays).find((item) => item.dayDate === todayKey);
  const plannedWorkout = plannedDay ? data.workouts.find((item) => item.id === plannedDay.workoutId) : undefined;
  const featuredWorkout = plannedWorkout ?? data.workouts[0];
  const coachTip = useMemo(() => data.coachTips[Math.floor(Math.random() * Math.max(data.coachTips.length, 1))], [data.coachTips]);
  const isDark = data.settings.themePreference === "Dark";

  const startWorkout = () => {
    const workout = plannedWorkout ?? data.workouts[Math.floor(Math.random() * Math.max(data.workouts.length, 1))];
    if (workout) navigate(`/session/${workout.id}`);
    else navigate("/workouts/new");
  };

  if (isDark) {
    return <div className="home-dashboard home-dashboard--dark">
      <header className="home-dashboard__topbar">
        <div className="home-dashboard__brand"><span className="home-dashboard__badge"><Icon name="account_circle" size={28} /></span><strong>THAI STRICKER</strong></div>
        <button className="home-dashboard__top-action" aria-label="Notifications"><Icon name="notifications" /></button>
      </header>

      <section className="home-dashboard__intro">
        <p>Private coaching app</p>
        <h1>THAI STRICKER</h1>
        <span>Train sharp. Stay consistent.</span>
      </section>

      <section className="home-dashboard__panel home-dashboard__workout-panel">
        <div className="home-dashboard__panel-heading"><h2>Today's Workout</h2>{featuredWorkout ? <Link to={`/workouts/${featuredWorkout.id}`}>View routine</Link> : <span>View routine</span>}</div>
        {featuredWorkout ? <div className="home-dashboard__dark-hero" style={{ backgroundImage: `linear-gradient(rgba(5,9,12,.32), rgba(5,9,12,.72)), url(${HERO_IMAGE_URI})` }}>
          <div className="home-dashboard__hero-tags"><span>{featuredWorkout.difficulty}</span><small>{featuredWorkout.totalDurationMinutes} mins</small></div>
          <h3>{featuredWorkout.title}</h3>
          <div className="home-dashboard__hero-footer"><p>Focus: {featuredWorkout.description || "Explosive strikes and balance"}</p><button onClick={startWorkout} aria-label="Start workout"><Icon name="play_arrow" /></button></div>
        </div> : <EmptyWorkout onStart={startWorkout} />}
      </section>

      <section className="home-dashboard__panel home-dashboard__activity-panel">
        <div className="home-dashboard__panel-heading"><p>Monthly activity</p><Icon name="trending_up" size={20} /></div>
        <strong className="home-dashboard__calories">{metrics.calories.toLocaleString()} <small>KCAL</small></strong>
        <div className="home-dashboard__bars" aria-label="Last seven days activity">{metrics.activity.map((height, index) => <i key={index} className={height ? "active" : ""} style={{ height: `${22 + height * 28}px` }} />)}</div>
      </section>

      <div className="home-dashboard__mini-grid">
        <article><Icon name="app_badging" /><span>Sessions</span><strong>{metrics.sessions}</strong></article>
        <article><Icon name="schedule" /><span>Hours</span><strong>{metrics.hours}</strong></article>
      </div>

      <section className="home-dashboard__panel home-dashboard__calendar-panel">
        <div className="home-dashboard__calendar-heading"><h2>{addDays(selectedWeek, 6).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2><div><button onClick={() => setSelectedWeek((date) => addDays(date, -7))} aria-label="Previous week"><Icon name="chevron_left" /></button><button onClick={() => setSelectedWeek((date) => addDays(date, 7))} aria-label="Next week"><Icon name="chevron_right" /></button></div></div>
        <div className="home-dashboard__dark-week-labels">{DARK_WEEK_LABELS.map((label, index) => <span className={index === 6 ? "sunday" : ""} key={`${label}-${index}`}>{label}</span>)}</div>
        <div className="home-dashboard__dark-week">{days.map((day) => <div className={day.status ? "active" : ""} key={day.key}><strong className={day.isSunday ? "sunday" : ""}>{day.number}</strong><i /></div>)}</div>
      </section>

      <button className="home-dashboard__dark-coach" onClick={() => navigate("/coach")}>
        <span className="home-dashboard__coach-watermark"><Icon name="psychology" size={108} /></span>
        <span className="home-dashboard__coach-label"><Icon name="bolt" size={19} /> AI Coach Tip Of The Day</span>
        <strong>“{coachTip?.shortTip ?? "Stay balanced, breathe, and keep your guard disciplined."}”</strong>
        <p>{coachTip?.explanation ?? "Focused repetitions turn clean technique into reliable instinct."}</p>
      </button>
    </div>;
  }

  return <div className="home-dashboard home-dashboard--light">
    <header className="home-dashboard__light-topbar"><div><Icon name="sports_martial_arts" size={29} /><strong>THAI STRICKER</strong></div><button aria-label="Notifications"><Icon name="notifications" /></button></header>
    <div className="home-dashboard__light-week">{days.map((day, index) => {
      const current = day.key === todayKey;
      return <div key={day.key}><span>{LIGHT_WEEK_LABELS[index]}</span><i className={`${day.status === "completed" ? "completed" : ""} ${current ? "today" : ""}`}>{day.status === "completed" ? <Icon name="check" /> : current ? <b /> : day.number}</i></div>;
    })}</div>

    <section className="home-dashboard__light-hero">
      <div className="home-dashboard__light-hero-head"><span>Today's Session</span>{featuredWorkout && <small><Icon name="schedule" size={20} /> {featuredWorkout.totalDurationMinutes} min</small>}</div>
      <h1>{featuredWorkout?.title ?? "Recovery Day"}</h1>
      <p>{featuredWorkout?.description ?? "No training is planned today. You can still launch a random workout session."}</p>
      {featuredWorkout && <div className="home-dashboard__light-meta"><span><Icon name="sports_martial_arts" size={18} /> {featuredWorkout.difficulty}</span><span><Icon name="local_fire_department" size={18} /> {featuredWorkout.totalDurationMinutes * 12} kcal</span></div>}
      <button onClick={startWorkout}>Start Workout <Icon name="play_arrow" size={21} /></button>
    </section>

    <section className="home-dashboard__light-activity">
      <h2>{today.toLocaleDateString("en-US", { month: "long" })} Activity</h2>
      <div className="home-dashboard__light-activity-grid"><article><div className="home-dashboard__heatmap">{metrics.heatmap.flatMap((row, rowIndex) => row.map((value, columnIndex) => <i className={`level-${value}`} key={`${rowIndex}-${columnIndex}`} />))}</div><strong>Consistency: {metrics.consistency}%</strong></article><div><article><span>Total Workouts</span><strong>{metrics.sessions}</strong></article><article><span>Total Hours</span><strong>{metrics.hours} <small>hrs</small></strong></article></div></div>
    </section>

    <button className="home-dashboard__light-coach" onClick={() => navigate("/coach")}>
      <span className="home-dashboard__coach-watermark"><Icon name="smart_toy" size={96} /></span>
      <span className="home-dashboard__light-coach-title"><i><Icon name="smart_toy" /></i> AI Coach Tip</span>
      <strong>“{coachTip?.shortTip ?? "Keep your stance calm and your next movement ready."}”</strong>
      <span className="home-dashboard__light-coach-action"><Icon name="chat" /> Chat with AI Coach</span>
    </button>
  </div>;
}

function EmptyWorkout({ onStart }: { onStart: () => void }) {
  return <div className="home-dashboard__empty-workout"><p>No training planned today. Have a rest, or create your first workout.</p><button onClick={onStart}>Start Workout</button></div>;
}
