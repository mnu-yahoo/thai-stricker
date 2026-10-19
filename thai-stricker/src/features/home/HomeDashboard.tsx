import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "../../components/Icon";
import { addHomeDays, buildHomeDashboardMetrics, formatHomeDate, getHomeWeekDays, getHomeWeekStart, getTodayWorkout, selectCoachTip, selectWorkoutToStart } from "../../application/useCases/homeUseCases";
import type { AppDataSnapshot } from "../../types/domain";
import "./home-dashboard.css";

const HERO_IMAGE_URI =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3C5SDrHOXybW_s5ltu_w7y9f3GD1p4EqUBQ1pc2of6ewG7U9wEwWsJae_KVvSFfNSOmta4dlvbm6MWYCTC6UyJO0B4q4RFm4H-UAcHu4Iqi-pu4QJrrvt3UfWBVGTYlAb-Zv6S6YEQ2ruDMSFxRQXYeyJAkgojkw17GI1XVaentlU4Dcg6A9GwlEQZXareWGIu361fNtyrcNyoyhCNyA1cOVVMkyoT6NC-lXpHr1V2tCdBrPHbgrkaJykY4vvt972cISslWZNFg0";

const DARK_WEEK_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
const LIGHT_WEEK_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function HomeDashboard({ data }: { data: AppDataSnapshot }) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = formatHomeDate(today);
  const [selectedWeek, setSelectedWeek] = useState(() => getHomeWeekStart(today));
  const metrics = useMemo(() => buildHomeDashboardMetrics(data, today), [data, today]);
  const days = useMemo(() => getHomeWeekDays(selectedWeek, data), [selectedWeek, data]);
  const plannedWorkout = getTodayWorkout(data, today);
  const featuredWorkout = plannedWorkout ?? data.workouts[0];
  const coachTip = useMemo(() => selectCoachTip(data), [data.coachTips]);
  const isDark = data.settings.themePreference === "Dark";

  const startWorkout = () => {
    const workout = selectWorkoutToStart(data, today);
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
        <div className="home-dashboard__calendar-heading"><h2>{addHomeDays(selectedWeek, 6).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2><div><button onClick={() => setSelectedWeek((date) => addHomeDays(date, -7))} aria-label="Previous week"><Icon name="chevron_left" /></button><button onClick={() => setSelectedWeek((date) => addHomeDays(date, 7))} aria-label="Next week"><Icon name="chevron_right" /></button></div></div>
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
