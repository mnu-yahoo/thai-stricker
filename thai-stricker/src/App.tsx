import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Icon } from "./components/Icon";
import { HomeDashboard } from "./features/home/HomeDashboard";
import { buildSectionArchive, readSectionImports } from "./persistence/backupArchive";
import { appRepository, calculateWorkoutDuration, DATA_SECTION_NAMES, resolveWorkoutExercises, SECTION_FILE_NAMES, STORAGE_KEY } from "./persistence/appRepository";
import type { AppDataSnapshot, DataSectionName, Exercise, NamedSectionImport, PersistedSettings, Technique, WeeklyWorkoutPlan, Workout, WorkoutCategory, WorkoutDifficulty, WorkoutImportPayload, WorkoutLogEntry } from "./types/domain";
import { WORKOUT_CATEGORIES, WORKOUT_DIFFICULTIES } from "./types/domain";

type AppContextValue = {
  data: AppDataSnapshot;
  refresh: () => Promise<void>;
  act: (operation: () => Promise<void>, success?: string) => Promise<boolean>;
  notify: (message: string, tone?: "success" | "error") => void;
};

const AppContext = createContext<AppContextValue | null>(null);
const useApp = () => {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider is missing");
  return value;
};

function isoDate(date = new Date()) { return date.toISOString().slice(0, 10); }
function uid(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Never"; }
function detailLabel(exercise: Exercise | Workout["exercises"][number]) { return exercise.detail.type === "duration" ? `${exercise.detail.seconds} sec` : `${exercise.detail.reps} reps`; }
function mondayOf(date: Date) { const result = new Date(date); const day = (result.getDay() + 6) % 7; result.setDate(result.getDate() - day); result.setHours(12, 0, 0, 0); return result; }
function weekNumber(date: Date) { const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); const day = utc.getUTCDay() || 7; utc.setUTCDate(utc.getUTCDate() + 4 - day); const start = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1)); return Math.ceil((((utc.getTime() - start.getTime()) / 86400000) + 1) / 7); }
function downloadBlob(value: Blob, filename: string) { const url = URL.createObjectURL(value); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
function backupTimestamp() { return new Date().toISOString().replace(/[:.]/g, "-"); }

function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppDataSnapshot | null>(null);
  const [notice, setNotice] = useState<{ message: string; tone: "success" | "error" } | null>(null);
  const refresh = async () => setData(await appRepository.loadAppData());
  useEffect(() => { void refresh().catch((error) => setNotice({ message: error.message, tone: "error" })); }, []);
  useEffect(() => {
    const listener = (event: StorageEvent) => { if (event.key === STORAGE_KEY) void refresh(); };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);
  useEffect(() => { if (data) document.documentElement.dataset.theme = data.settings.themePreference.toLowerCase(); }, [data?.settings.themePreference]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(null), 4200); return () => window.clearTimeout(timer); }, [notice]);
  const notify = (message: string, tone: "success" | "error" = "success") => setNotice({ message, tone });
  const act = async (operation: () => Promise<void>, success?: string) => {
    try { await operation(); await refresh(); if (success) notify(success); return true; }
    catch (error) { notify(error instanceof Error ? error.message : "An error occurred.", "error"); return false; }
  };
  if (!data) return <div className="splash"><div className="brand-mark">TS</div><p>Loading…</p></div>;
  return <AppContext.Provider value={{ data, refresh, act, notify }}>{children}{notice && <div className={`toast ${notice.tone}`} role="status">{notice.message}</div>}</AppContext.Provider>;
}

function Layout() {
  const location = useLocation();
  const immersive = location.pathname.startsWith("/session/");
  return <div className="app-shell"><main className={immersive ? "content immersive" : "content"}><Routes>
    <Route path="/" element={<HomeDashboardRoute />} />
    <Route path="/workouts" element={<Workouts />} />
    <Route path="/workouts/new" element={<WorkoutForm />} />
    <Route path="/workouts/:id" element={<WorkoutDetail />} />
    <Route path="/workouts/:id/edit" element={<WorkoutForm />} />
    <Route path="/exercises" element={<ExercisesLibrary />} />
    <Route path="/exercises/new" element={<ExerciseForm />} />
    <Route path="/exercises/:id/edit" element={<ExerciseForm />} />
    <Route path="/techniques" element={<TechniquesLibrary />} />
    <Route path="/techniques/new" element={<TechniqueForm />} />
    <Route path="/schedule" element={<Schedule />} />
    <Route path="/coach" element={<Coach />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/session/:workoutId" element={<WorkoutSession />} />
    <Route path="/session/:workoutId/recap" element={<WorkoutRecap />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main>{!immersive && <BottomNav />}</div>;
}

function Header({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  const { data } = useApp();
  const isDark = data.settings.themePreference === "Dark";
  const heading = back ? title : "THAI STRICKER";
  const brandIcon = isDark ? "account_circle" : "sports_martial_arts";
  return <header className={`page-header ${back ? "" : "page-header--brand"}`}>{back ? <Link className="icon-button" to={back} aria-label="Back"><Icon name="arrow_back" /></Link> : <span className="page-header__brand-icon"><Icon name={brandIcon} size={29} /></span>}<h1>{heading}</h1>{action ?? <span className="header-spacer" />}</header>;
}

function Empty({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return <section className="empty"><Icon name={icon} size={42} /><h2>{title}</h2><p>{text}</p>{action}</section>;
}

function WorkoutLibraryNav() {
  const location = useLocation();
  return <nav className="library-nav" aria-label="Workout library navigation">
    <Link to="/workouts" className={location.pathname === "/workouts" ? "active" : ""}>Workouts</Link>
    <Link to="/exercises" className={location.pathname.startsWith("/exercises") ? "active" : ""}>Exercises</Link>
    <Link to="/techniques" className={location.pathname.startsWith("/techniques") ? "active" : ""}>Techniques</Link>
  </nav>;
}

function HomeDashboardRoute() {
  const { data } = useApp();
  return <HomeDashboard data={data} />;
}

function Workouts() {
  const { data, act } = useApp();
  const [remove, setRemove] = useState<Workout | null>(null);
  return <><Header title="Workouts" back="/" action={<Link className="icon-button" to="/workouts/new" aria-label="New workout"><Icon name="add" /></Link>} /><WorkoutLibraryNav />{data.workouts.length ? <div className="stack">{data.workouts.map((workout) => <article className="workout-card" key={workout.id}><div className="card-top"><span className="pill">{workout.category}</span><span className="muted">{workout.difficulty}</span></div><h2>{workout.title}</h2><p>{workout.description}</p><div className="meta"><span><Icon name="schedule" /> {workout.totalDurationMinutes} min</span><span><Icon name="fitness_center" /> {workout.exercises.length}</span><span><Icon name="history" /> {formatDate(workout.lastDoneDate)}</span></div><div className="actions"><Link className="button primary" to={`/session/${workout.id}`}><Icon name="play_arrow" /> Start</Link><Link className="button secondary" to={`/workouts/${workout.id}`}>Details</Link><Link className="icon-button" to={`/workouts/${workout.id}/edit`} aria-label={`Edit ${workout.title}`}><Icon name="edit" /></Link><button className="icon-button danger" onClick={() => setRemove(workout)} aria-label={`Delete ${workout.title}`}><Icon name="delete" /></button></div></article>)}</div> : <Empty icon="fitness_center" title="No workouts yet" text="Create a workout from your exercise library." action={<Link className="button primary" to="/workouts/new">Create a workout</Link>} />}{remove && <ConfirmDialog title="Delete this workout?" text={`“${remove.title}” will be removed from the schedule. Its history will be kept.`} onCancel={() => setRemove(null)} onConfirm={async () => { await act(() => appRepository.deleteWorkout(remove.id), "Workout deleted."); setRemove(null); }} />}</>;
}

function ExercisesLibrary() {
  const { data } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const techniqueNames = new Map(data.techniques.map((technique) => [technique.id, technique.name]));
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const filteredExercises = normalizedSearchTerm
    ? data.exercises.filter((exercise) => exercise.title.toLocaleLowerCase().includes(normalizedSearchTerm))
    : data.exercises;
  return <><Header title="Exercises" back="/workouts" action={<Link className="icon-button" to="/exercises/new" aria-label="New exercise"><Icon name="add" /></Link>} /><WorkoutLibraryNav />{data.exercises.length ? <><label className="filter-control">Search exercises<input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search by exercise name" /></label>{filteredExercises.length ? <div className="library">{filteredExercises.map((exercise) => <article key={exercise.id}><div><h3>{exercise.title}</h3><p>{exercise.category || "Uncategorized"} · {detailLabel(exercise)}</p><small>{exercise.techniqueIds.map((id) => techniqueNames.get(id) ?? id).join(" · ")}</small></div><Link className="icon-button" to={`/exercises/${exercise.id}/edit`} aria-label={`Edit ${exercise.title}`}><Icon name="edit" /></Link></article>)}</div> : <Empty icon="search" title="No matching exercises" text="Try another part of the exercise name." />}</> : <Empty icon="fitness_center" title="No exercises yet" text="Create an exercise from the technique library." action={<Link className="button primary" to="/exercises/new">Create an exercise</Link>} />}</>;
}

function TechniquesLibrary() {
  const { data } = useApp();
  const [selectedSubCategory, setSelectedSubCategory] = useState("all");
  const usage = new Map(data.techniques.map((technique) => [technique.id, data.exercises.filter((exercise) => exercise.techniqueIds.includes(technique.id)).length]));
  const subCategories = Array.from(new Set(data.techniques.map((technique) => technique.subCategory)));
  const filteredTechniques = selectedSubCategory === "all"
    ? data.techniques
    : data.techniques.filter((technique) => technique.subCategory === selectedSubCategory);
  return <><Header title="Techniques" back="/workouts" action={<Link className="icon-button" to="/techniques/new" aria-label="New technique"><Icon name="add" /></Link>} /><WorkoutLibraryNav />{data.techniques.length ? <><label className="filter-control">Filter by sub-category<select value={selectedSubCategory} onChange={(event) => setSelectedSubCategory(event.target.value)}><option value="all">All sub-categories</option>{subCategories.map((subCategory) => <option key={subCategory} value={subCategory}>{subCategory}</option>)}</select></label><div className="library">{filteredTechniques.map((technique) => <article className="list-card" key={technique.id}><div><h3>{technique.name}</h3><p>{technique.shortName} · {technique.category}</p><small>{technique.subCategory} · Used in {usage.get(technique.id) ?? 0} exercise(s)</small></div></article>)}</div></> : <Empty icon="sports_martial_arts" title="No techniques yet" text="Import techniques from Settings to populate the library." />}</>;
}

const TECHNIQUE_CATEGORIES: Technique["category"][] = ["Muay Thai techniques", "Stretching Techniques", "Strength Techniques"];

function TechniqueForm() {
  const { act } = useApp();
  const navigate = useNavigate();
  const [value, setValue] = useState<Omit<Technique, "id">>({
    name: "",
    shortName: "",
    description: "",
    category: "Muay Thai techniques",
    subCategory: "",
  });
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!value.name.trim() || !value.shortName.trim() || !value.description.trim() || !value.subCategory.trim()) return;
    const technique: Technique = { ...value, id: uid("technique"), name: value.name.trim(), shortName: value.shortName.trim(), description: value.description.trim(), subCategory: value.subCategory.trim() };
    const ok = await act(() => appRepository.addTechnique(technique), "Technique added.");
    if (ok) navigate("/techniques");
  };
  return <><Header title="New technique" back="/techniques" /><form className="form" onSubmit={submit}>
    <label>Name<input required value={value.name} onChange={(event) => setValue({ ...value, name: event.target.value })} placeholder="Jab" /></label>
    <label>Short name<input required value={value.shortName} onChange={(event) => setValue({ ...value, shortName: event.target.value })} placeholder="Jab" /></label>
    <label>Description<textarea rows={4} required value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} placeholder="Describe the movement." /></label>
    <label>Category<select value={value.category} onChange={(event) => setValue({ ...value, category: event.target.value as Technique["category"] })}>{TECHNIQUE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
    <label>Sub-category<input required value={value.subCategory} onChange={(event) => setValue({ ...value, subCategory: event.target.value })} placeholder="Punches" /></label>
    <button className="button primary sticky-action" type="submit">Save technique</button>
  </form></>;
}

function WorkoutDetail() {
  const { id } = useParams(); const { data } = useApp(); const workout = data.workouts.find((item) => item.id === id);
  if (!workout) return <Navigate to="/workouts" replace />;
  const exercises = resolveWorkoutExercises(data, workout);
  return <><Header title="Workout details" back="/workouts" action={<Link className="icon-button" to={`/workouts/${workout.id}/edit`} aria-label="Edit"><Icon name="edit" /></Link>} /><section className="title-block"><span className="pill">{workout.category}</span><h2>{workout.title}</h2><p>{workout.description}</p><div className="meta"><span>{workout.difficulty}</span><span>{workout.totalDurationMinutes} min</span><span>{workout.restSecondsBetweenExercises} sec rest</span></div></section><section><h2>Exercises</h2><ol className="exercise-list">{exercises.map((exercise, index) => <li key={`${exercise.exerciseId}-${index}`}><span className="number">{index + 1}</span><div><h3>{exercise.title}</h3><p>{exercise.description}</p><small>{exercise.techniqueIds.length} technique(s)</small></div><strong>{detailLabel(exercise)}</strong></li>)}</ol></section><Link className="button primary sticky-action" to={`/session/${workout.id}`}><Icon name="play_arrow" /> Start workout</Link></>;
}

type WorkoutDraft = Pick<Workout, "title" | "description" | "difficulty" | "category" | "restSecondsBetweenExercises" | "exercises">;
const DRAFT_KEY = "thai-stricker:workout-draft";
function WorkoutForm() {
  const { id } = useParams(); const { data, act } = useApp(); const navigate = useNavigate();
  const current = data.workouts.find((item) => item.id === id);
  const stored = !id ? sessionStorage.getItem(DRAFT_KEY) : null;
  const initial: WorkoutDraft = stored ? JSON.parse(stored) : current ? { title: current.title, description: current.description, difficulty: current.difficulty, category: current.category, restSecondsBetweenExercises: current.restSecondsBetweenExercises, exercises: current.exercises } : { title: "", description: "", difficulty: "Beginner", category: "Fundamentals", restSecondsBetweenExercises: data.settings.restSecondsBetweenExercises, exercises: [] };
  const [draft, setDraft] = useState<WorkoutDraft>(initial);
  const update = (next: WorkoutDraft) => { setDraft(next); if (!id) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next)); };
  const addOccurrence = (exercise: Exercise) => { if (draft.exercises.length >= data.settings.maxExercisesPerWorkout) return; update({ ...draft, exercises: [...draft.exercises, { exerciseId: exercise.id, detail: { ...exercise.detail } }] }); };
  const removeOccurrence = (index: number) => update({ ...draft, exercises: draft.exercises.filter((_, itemIndex) => itemIndex !== index) });
  const move = (index: number, delta: number) => { const target = index + delta; if (target < 0 || target >= draft.exercises.length) return; const exercises = [...draft.exercises]; [exercises[index], exercises[target]] = [exercises[target], exercises[index]]; update({ ...draft, exercises }); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!draft.title.trim() || !draft.exercises.length) return;
    const value: Workout = { ...draft, id: current?.id ?? uid("workout"), totalDurationMinutes: calculateWorkoutDuration(draft.exercises, draft.restSecondsBetweenExercises, data.settings.defaultRepsExerciseDurationMinutes), lastDoneDate: current?.lastDoneDate };
    const ok = await act(() => current ? appRepository.updateWorkout(value) : appRepository.addWorkout(value), current ? "Workout updated." : "Workout created.");
    if (ok) { sessionStorage.removeItem(DRAFT_KEY); navigate("/workouts"); }
  };
  return <><Header title={current ? "Edit workout" : "New workout"} back="/workouts" /><form className="form" onSubmit={submit}><label>Name<input required value={draft.title} onChange={(event) => update({ ...draft, title: event.target.value })} /></label><label>Description<textarea rows={3} value={draft.description} onChange={(event) => update({ ...draft, description: event.target.value })} /></label><div className="form-grid"><label>Level<select value={draft.difficulty} onChange={(event) => update({ ...draft, difficulty: event.target.value as WorkoutDifficulty })}>{WORKOUT_DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Category<select value={draft.category} onChange={(event) => update({ ...draft, category: event.target.value as WorkoutCategory })}>{WORKOUT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label></div><label>Rest between exercises<select value={draft.restSecondsBetweenExercises} onChange={(event) => update({ ...draft, restSecondsBetweenExercises: Number(event.target.value) })}>{[15, 30, 45, 60, 90, 120].map((item) => <option value={item} key={item}>{item} seconds</option>)}</select></label>
    <section><div className="section-heading"><div><p className="eyebrow">PROGRAM</p><h2>{draft.exercises.length}/{data.settings.maxExercisesPerWorkout} exercises</h2></div><Link className="button secondary small" to={`/exercises/new?return=${encodeURIComponent(id ? `/workouts/${id}/edit` : "/workouts/new")}`}>New exercise</Link></div>{draft.exercises.length ? <ol className="exercise-list compact">{draft.exercises.map((exercise, index) => <li key={`${exercise.id}-${index}`}><span className="number">{index + 1}</span><div><h3>{exercise.title}</h3><p>{detailLabel(exercise)}</p></div><div className="mini-actions"><button type="button" onClick={() => move(index, -1)} disabled={!index} aria-label="Move up"><Icon name="arrow_upward" /></button><button type="button" onClick={() => move(index, 1)} disabled={index === draft.exercises.length - 1} aria-label="Move down"><Icon name="arrow_downward" /></button><button type="button" onClick={() => removeOccurrence(index)} aria-label="Remove"><Icon name="close" /></button></div></li>)}</ol> : <p className="muted">Add at least one exercise.</p>}</section>
    <section><h2>Exercises</h2><div className="library">{data.exercises.map((exercise) => <article key={exercise.id}><div><h3>{exercise.title}</h3><p>{exercise.category || "Uncategorized"} · {exercise.techniqueIds.length} technique(s) · {detailLabel(exercise)}</p></div><div className="mini-actions"><Link to={`/exercises/${exercise.id}/edit?return=${encodeURIComponent(id ? `/workouts/${id}/edit` : "/workouts/new")}`} aria-label="Edit"><Icon name="edit" /></Link><button type="button" onClick={() => addOccurrence(exercise)} disabled={draft.exercises.length >= data.settings.maxExercisesPerWorkout} aria-label="Add"><Icon name="add" /></button></div></article>)}</div></section><button className="button primary sticky-action" type="submit" disabled={!draft.title.trim() || !draft.exercises.length}>Save workout</button></form></>;
}

function ExerciseForm() {
  const { id } = useParams(); const { data, act } = useApp(); const navigate = useNavigate(); const [params] = useSearchParams();
  const current = data.exercises.find((item) => item.id === id); const returnTo = params.get("return") || "/workouts/new";
  const [value, setValue] = useState<Exercise>(current ?? { id: "", title: "", description: "", help: "", category: "", detail: { type: "duration", seconds: 60 }, techniqueIds: [] });
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!value.techniqueIds.length) return; const exercise = { ...value, id: current?.id ?? uid("exercise") }; const ok = await act(() => current ? appRepository.updateExercise(exercise) : appRepository.addExercise(exercise), current ? "Exercise updated." : "Exercise added."); if (ok) navigate(returnTo); };
  const toggleTechnique = (techniqueId: string) => setValue({ ...value, techniqueIds: value.techniqueIds.includes(techniqueId) ? value.techniqueIds.filter((item) => item !== techniqueId) : [...value.techniqueIds, techniqueId] });
  return <><Header title={current ? "Edit exercise" : "New exercise"} back={returnTo} /><form className="form" onSubmit={submit}><label>Name<input required value={value.title} onChange={(event) => setValue({ ...value, title: event.target.value })} /></label><label>Description<textarea rows={3} value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} /></label><label>Tip<textarea rows={3} value={value.help} onChange={(event) => setValue({ ...value, help: event.target.value })} /></label><label>Category<input value={value.category} onChange={(event) => setValue({ ...value, category: event.target.value })} /></label><fieldset><legend>Techniques</legend>{data.techniques.length ? data.techniques.map((technique) => <label key={technique.id}><input type="checkbox" checked={value.techniqueIds.includes(technique.id)} onChange={() => toggleTechnique(technique.id)} />{technique.name}</label>) : <p className="muted">Import techniques before creating an exercise.</p>}</fieldset><fieldset><legend>Execution details</legend><div className="segmented"><button type="button" className={value.detail.type === "duration" ? "active" : ""} onClick={() => setValue({ ...value, detail: { type: "duration", seconds: 60 } })}>Duration</button><button type="button" className={value.detail.type === "reps" ? "active" : ""} onClick={() => setValue({ ...value, detail: { type: "reps", reps: 10 } })}>Repetitions</button></div>{value.detail.type === "duration" ? <label>Seconds<input type="number" min="1" required value={value.detail.seconds} onChange={(event) => setValue({ ...value, detail: { type: "duration", seconds: Number(event.target.value) } })} /></label> : <label>Count<input type="number" min="1" required value={value.detail.reps} onChange={(event) => setValue({ ...value, detail: { type: "reps", reps: Number(event.target.value) } })} /></label>}</fieldset><button className="button primary sticky-action" type="submit" disabled={!value.techniqueIds.length}>Save exercise</button></form></>;
}

function Schedule() {
  const { data, act } = useApp(); const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const start = isoDate(weekStart); const current = data.weeklyWorkoutPlans.find((item) => item.weekStartDate === start);
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return { date: isoDate(date), label: new Intl.DateTimeFormat("en-US", { weekday: "long", day: "numeric", month: "short" }).format(date) }; });
  const saveDay = async (dayDate: string, dayLabel: string, workoutId: string) => {
    const workout = data.workouts.find((item) => item.id === workoutId); const plannedDays = (current?.plannedDays ?? []).filter((item) => item.dayDate !== dayDate);
    if (workout) plannedDays.push({ dayDate, dayLabel, workoutId: workout.id, workoutTitle: workout.title });
    const plan: WeeklyWorkoutPlan = { id: current?.id ?? uid("plan"), weekStartDate: start, weekNumber: weekNumber(weekStart), year: weekStart.getFullYear(), requiredTrainingDays: data.settings.trainingDaysPerWeek, plannedDays, source: "web" };
    await act(() => appRepository.saveWeeklyPlan(plan), "Schedule saved.");
  };
  const shift = (amount: number) => { const next = new Date(weekStart); next.setDate(next.getDate() + amount * 7); setWeekStart(next); };
  return <><Header title="Schedule" /><div className="week-nav"><button className="icon-button" onClick={() => shift(-1)} aria-label="Previous week"><Icon name="chevron_left" /></button><div><strong>Week {weekNumber(weekStart)}</strong><span>Starting {formatDate(start)}</span></div><button className="icon-button" onClick={() => shift(1)} aria-label="Next week"><Icon name="chevron_right" /></button></div><p className="muted center">Goal: {data.settings.trainingDaysPerWeek} workouts this week</p><div className="stack">{days.map((day) => { const planned = current?.plannedDays.find((item) => item.dayDate === day.date); return <article className="day-card" key={day.date}><div><h3>{day.label}</h3><p>{planned?.workoutTitle ?? "Rest"}</p></div><select aria-label={`Workout for ${day.label}`} value={planned?.workoutId ?? ""} onChange={(event) => void saveDay(day.date, day.label, event.target.value)}><option value="">Rest</option>{data.workouts.map((workout) => <option key={workout.id} value={workout.id}>{workout.title}</option>)}</select></article>; })}</div></>;
}

function Coach() {
  const { data } = useApp(); const [selected, setSelected] = useState(0); const tip = data.coachTips[selected];
  return <><Header title="AI Coach" />{tip ? <><section className="coach-hero"><Icon name="psychology" size={42} /><p className="eyebrow">TECHNIQUE FOCUS</p><h2>{tip.exerciseTitle}</h2><p>{tip.shortTip}</p></section><div className="segmented scroll">{data.coachTips.map((item, index) => <button key={`${item.exerciseId}-${index}`} className={index === selected ? "active" : ""} onClick={() => setSelected(index)}>{item.exerciseTitle}</button>)}</div><InfoList title="Technique tips" icon="bolt" items={tip.technicalTips} /><InfoList title="Common mistakes" icon="warning" items={tip.commonMistakes} /><InfoList title="Focus points" icon="visibility" items={tip.focusPoints} /><section className="info-card"><h2>Why?</h2><p>{tip.explanation}</p></section></> : <Empty icon="psychology" title="No coaching tips available" text="Tips imported with your data will appear here." />}</>;
}
function InfoList({ title, icon, items }: { title: string; icon: string; items: string[] }) { return <section className="info-card"><h2><Icon name={icon} /> {title}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>; }

function Settings() {
  const { data, act, refresh, notify } = useApp();
  const sectionInput = useRef<HTMLInputElement>(null); const legacyInput = useRef<HTMLInputElement>(null); const workoutInput = useRef<HTMLInputElement>(null); const techniqueInput = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false); const [exportOpen, setExportOpen] = useState(false); const [exportSelection, setExportSelection] = useState<DataSectionName[]>([...DATA_SECTION_NAMES]); const [pendingImport, setPendingImport] = useState<NamedSectionImport[] | null>(null);
  const setSetting = async <K extends keyof PersistedSettings>(key: K, value: PersistedSettings[K]) => { await act(() => appRepository.saveSetting(key, value)); };
  const exportZip = async (selection: DataSectionName[], prefix = "thai-stricker-backup") => {
    const files = await appRepository.exportSections(selection);
    const archive = buildSectionArchive(files);
    downloadBlob(new Blob([new Uint8Array(archive).buffer], { type: "application/zip" }), `${prefix}-${backupTimestamp()}.zip`);
  };
  const exportSelected = async () => {
    try { await exportZip(exportSelection); setExportOpen(false); notify(`${exportSelection.length} file(s) exported.`); }
    catch (error) { notify(error instanceof Error ? error.message : "Export failed.", "error"); }
  };
  const readJson = async (file?: File) => file ? JSON.parse(await file.text()) as unknown : null;
  const selectSectionImports = async (files: FileList | null) => {
    try { if (!files?.length) return; setPendingImport(await readSectionImports(Array.from(files))); }
    catch (error) { notify(error instanceof Error ? error.message : "Import failed.", "error"); }
    finally { if (sectionInput.current) sectionInput.current.value = ""; }
  };
  const confirmSectionImport = async () => {
    if (!pendingImport) return;
    try {
      await exportZip(DATA_SECTION_NAMES, "thai-stricker-before-import");
      await appRepository.importSections(pendingImport);
      await refresh(); setPendingImport(null); notify(`${pendingImport.length} file(s) imported. A complete backup was downloaded.`);
    } catch (error) { notify(error instanceof Error ? error.message : "Import failed.", "error"); }
  };
  const importLegacy = async (file?: File) => {
    try { const input = await readJson(file); if (!input) return; await exportZip(DATA_SECTION_NAMES, "thai-stricker-before-import"); await appRepository.importLegacyDataFile(input); await refresh(); notify("Legacy backup imported. A complete backup was downloaded."); }
    catch (error) { notify(error instanceof Error ? error.message : "Import failed.", "error"); }
    finally { if (legacyInput.current) legacyInput.current.value = ""; }
  };
  const importWorkouts = async (file?: File) => { try { const input = await readJson(file); const values = Array.isArray(input) ? input : (input as { workouts?: WorkoutImportPayload[] })?.workouts; if (!Array.isArray(values)) throw new Error("The file does not contain workouts."); await act(() => appRepository.importWorkouts(values), `${values.length} workout(s) imported.`); } catch (error) { notify(error instanceof Error ? error.message : "Import failed.", "error"); } finally { if (workoutInput.current) workoutInput.current.value = ""; } };
  const importTechniques = async (file?: File) => { try { const input = await readJson(file); const values = Array.isArray(input) ? input : (input as { techniques?: Technique[] })?.techniques; if (!Array.isArray(values)) throw new Error("The file does not contain techniques."); await act(() => appRepository.importTechniques(values), `${values.length} technique(s) imported.`); } catch (error) { notify(error instanceof Error ? error.message : "Import failed.", "error"); } finally { if (techniqueInput.current) techniqueInput.current.value = ""; } };
  const toggleSection = (section: DataSectionName) => setExportSelection((current) => current.includes(section) ? current.filter((item) => item !== section) : [...current, section]);
  return <><Header title="Settings" /><section className="settings-group"><p className="eyebrow">TRAINING</p><SettingSelect label="Rest between exercises" value={data.settings.restSecondsBetweenExercises} options={[15, 30, 45, 60, 90, 120]} suffix=" seconds" onChange={(value) => void setSetting("restSecondsBetweenExercises", value as PersistedSettings["restSecondsBetweenExercises"])} /><SettingSelect label="Days per week" value={data.settings.trainingDaysPerWeek} options={[1, 2, 3, 4, 5, 6, 7]} onChange={(value) => void setSetting("trainingDaysPerWeek", value as PersistedSettings["trainingDaysPerWeek"])} /><SettingSelect label="Maximum exercises" value={data.settings.maxExercisesPerWorkout} options={[5, 10, 15, 20]} onChange={(value) => void setSetting("maxExercisesPerWorkout", value as PersistedSettings["maxExercisesPerWorkout"])} /><SettingSelect label="Exercises per page" value={data.settings.numberOfExercisesPerPage} options={[3, 6, 9, 12]} onChange={(value) => void setSetting("numberOfExercisesPerPage", value as PersistedSettings["numberOfExercisesPerPage"])} /><SettingSelect label="Duration of a repetition exercise" value={data.settings.defaultRepsExerciseDurationMinutes} options={[1, 2, 3, 4, 5]} suffix=" min" onChange={(value) => void setSetting("defaultRepsExerciseDurationMinutes", value as PersistedSettings["defaultRepsExerciseDurationMinutes"])} /></section>
    <section className="settings-group"><p className="eyebrow">APPEARANCE</p><div className="setting-row"><div><strong>Theme</strong><span>Light or dark</span></div><div className="segmented"><button className={data.settings.themePreference === "Light" ? "active" : ""} onClick={() => void setSetting("themePreference", "Light")}>Light</button><button className={data.settings.themePreference === "Dark" ? "active" : ""} onClick={() => void setSetting("themePreference", "Dark")}>Dark</button></div></div></section>
    <section className="settings-group"><p className="eyebrow">LOCAL DATA</p><button className="setting-action" onClick={() => { setExportSelection([...DATA_SECTION_NAMES]); setExportOpen(true); }}><span className="round-icon"><Icon name="download" /></span><div><strong>Export a backup</strong><span>Choose the files to include in the ZIP archive</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => sectionInput.current?.click()}><span className="round-icon"><Icon name="upload" /></span><div><strong>Import a backup</strong><span>ZIP archive or multiple JSON files</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => legacyInput.current?.click()}><span className="round-icon"><Icon name="history" /></span><div><strong>Import a legacy backup</strong><span>Previous complete THAI STRICKER file</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => workoutInput.current?.click()}><span className="round-icon"><Icon name="fitness_center" /></span><div><strong>Import workouts</strong><span>Compatible with the previous Android format</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => techniqueInput.current?.click()}><span className="round-icon"><Icon name="sports_martial_arts" /></span><div><strong>Import techniques</strong><span>Compatible with the previous Android format</span></div><Icon name="chevron_right" /></button><button className="setting-action danger-text" onClick={() => setConfirmReset(true)}><span className="round-icon"><Icon name="delete_forever" /></span><div><strong>Reset the app</strong><span>Delete data stored in this browser</span></div><Icon name="chevron_right" /></button><input ref={sectionInput} hidden multiple type="file" accept="application/json,application/zip,.json,.zip" onChange={(event) => void selectSectionImports(event.target.files)} /><input ref={legacyInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importLegacy(event.target.files?.[0])} /><input ref={workoutInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importWorkouts(event.target.files?.[0])} /><input ref={techniqueInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importTechniques(event.target.files?.[0])} /></section>
    <p className="storage-note"><Icon name="lock" /> Data stays in this browser only. Export a backup regularly.</p>
    {exportOpen && <div className="dialog-backdrop" role="presentation"><dialog open aria-modal="true" aria-labelledby="export-title"><h2 id="export-title">Files to export</h2><p>The selected files will be bundled into a ZIP archive.</p><div className="backup-options"><label><input type="checkbox" checked={exportSelection.length === DATA_SECTION_NAMES.length} onChange={(event) => setExportSelection(event.target.checked ? [...DATA_SECTION_NAMES] : [])} /><strong>All</strong></label>{DATA_SECTION_NAMES.map((section) => <label key={section}><input type="checkbox" checked={exportSelection.includes(section)} onChange={() => toggleSection(section)} /><span>{SECTION_FILE_NAMES[section]}</span></label>)}</div><div className="dialog-actions"><button className="button secondary" onClick={() => setExportOpen(false)}>Cancel</button><button className="button primary" disabled={!exportSelection.length} onClick={() => void exportSelected()}>Export</button></div></dialog></div>}
    {pendingImport && <div className="dialog-backdrop" role="presentation"><dialog open aria-modal="true" aria-labelledby="import-title"><h2 id="import-title">Import these files?</h2><p>The matching sections will be replaced after a complete backup is downloaded.</p><ul className="import-file-list">{pendingImport.map((item) => <li key={item.filename}><Icon name="description" /> {item.filename}</li>)}</ul><div className="dialog-actions"><button className="button secondary" onClick={() => setPendingImport(null)}>Cancel</button><button className="button primary" onClick={() => void confirmSectionImport()}>Import</button></div></dialog></div>}
    {confirmReset && <ConfirmDialog title="Reset THAI STRICKER?" text="All data stored in this browser will be deleted. A complete backup will be downloaded before the reset." confirmLabel="Reset" onCancel={() => setConfirmReset(false)} onConfirm={async () => { try { await exportZip(DATA_SECTION_NAMES, "thai-stricker-before-reset"); await appRepository.reset(); await refresh(); setConfirmReset(false); notify("App reset. A backup was downloaded."); } catch (error) { notify(error instanceof Error ? error.message : "Reset failed.", "error"); } }} />}</>;
}
function SettingSelect({ label, value, options, suffix = "", onChange }: { label: string; value: number; options: number[]; suffix?: string; onChange: (value: number) => void }) { return <label className="setting-row"><span><strong>{label}</strong></span><select value={value} onChange={(event) => onChange(Number(event.target.value))}>{options.map((item) => <option key={item} value={item}>{item}{suffix}</option>)}</select></label>; }

function WorkoutSession() {
  const { workoutId } = useParams(); const { data, act } = useApp(); const navigate = useNavigate(); const workout = data.workouts.find((item) => item.id === workoutId);
  const [index, setIndex] = useState(0); const [phase, setPhase] = useState<"exercise" | "rest">("exercise"); const [skipped, setSkipped] = useState(0); const [remaining, setRemaining] = useState(0); const deadline = useRef<number | null>(null); const startedAt = useRef(Date.now());
  const finish = async (completed: number, skippedCount: number) => { if (!workout) return; const now = new Date(); const recap = { workoutId: workout.id, workoutTitle: workout.title, exerciseCount: workout.exercises.length, completedExerciseCount: completed, skippedExerciseCount: skippedCount, totalDurationMinutes: Math.max(1, Math.ceil((Date.now() - startedAt.current) / 60000)), completedDate: isoDate(now) }; sessionStorage.setItem(`recap:${workout.id}`, JSON.stringify(recap)); const log: WorkoutLogEntry = { ...recap, id: uid("log"), completedAt: now.toISOString(), source: "web" }; await act(() => appRepository.addWorkoutLog(log)); navigate(`/session/${workout.id}/recap`, { replace: true }); };
  const advance = (skip = false) => { if (!workout) return; const nextSkipped = skipped + (skip && phase === "exercise" ? 1 : 0); if (skip) setSkipped(nextSkipped); if (phase === "exercise" && index === workout.exercises.length - 1) { void finish(workout.exercises.length - nextSkipped, nextSkipped); return; } if (phase === "exercise" && workout.restSecondsBetweenExercises > 0) { setPhase("rest"); deadline.current = Date.now() + workout.restSecondsBetweenExercises * 1000; setRemaining(workout.restSecondsBetweenExercises); } else { setPhase("exercise"); setIndex((value) => value + 1); deadline.current = null; } };
  const exercise = workout?.exercises[index];
  useEffect(() => { if (!exercise || phase !== "exercise" || exercise.detail.type !== "duration") return; deadline.current = Date.now() + exercise.detail.seconds * 1000; setRemaining(exercise.detail.seconds); }, [index, phase, exercise?.id]);
  useEffect(() => { if (!deadline.current) return; const timer = window.setInterval(() => { const value = Math.max(0, Math.ceil(((deadline.current ?? 0) - Date.now()) / 1000)); setRemaining(value); if (value === 0) { window.clearInterval(timer); deadline.current = null; advance(false); } }, 250); return () => window.clearInterval(timer); });
  if (!workout || !exercise) return <Navigate to="/workouts" replace />;
  return <div className="session"><header><Link className="icon-button" to={`/workouts/${workout.id}`} aria-label="Exit"><Icon name="close" /></Link><span>{index + 1} / {workout.exercises.length}</span><button className="text-button" onClick={() => advance(true)}>Skip</button></header><div className="progress"><span style={{ width: `${((index + (phase === "rest" ? .5 : 0)) / workout.exercises.length) * 100}%` }} /></div>{phase === "rest" ? <section className="session-center"><p className="eyebrow">RECOVERY</p><div className="timer">{remaining}</div><h1>Breathe and keep moving</h1><button className="button primary" onClick={() => advance(false)}>Finish rest</button></section> : <section className="session-center"><p className="eyebrow">EXERCISE {index + 1}</p><h1>{exercise.title}</h1><p className="session-description">{exercise.description}</p>{exercise.detail.type === "duration" ? <div className="timer">{remaining}</div> : <div className="reps">{exercise.detail.reps}<span>repetitions</span></div>}<aside><Icon name="lightbulb" /><p>{exercise.help || "Keep your technique clean and maintain a steady pace."}</p></aside>{exercise.detail.type === "reps" && <button className="button primary" onClick={() => advance(false)}>Exercise complete</button>}</section>}</div>;
}

function WorkoutRecap() {
  const { workoutId } = useParams(); const raw = sessionStorage.getItem(`recap:${workoutId}`); const recap = raw ? JSON.parse(raw) as { workoutTitle: string; exerciseCount: number; completedExerciseCount: number; skippedExerciseCount: number; totalDurationMinutes: number } : null;
  return <div className="recap"><span className="recap-icon"><Icon name="emoji_events" size={54} /></span><p className="eyebrow">WORKOUT COMPLETE</p><h1>{recap?.workoutTitle ?? "Well done!"}</h1><p>You completed your workout. Keep it up.</p><div className="stats"><article><strong>{recap?.completedExerciseCount ?? 0}</strong><span>completed</span></article><article><strong>{recap?.skippedExerciseCount ?? 0}</strong><span>skipped</span></article><article><strong>{recap?.totalDurationMinutes ?? 0}</strong><span>minutes</span></article></div><Link className="button primary" to="/">Back to home</Link></div>;
}

function ConfirmDialog({ title, text, confirmLabel = "Delete", onCancel, onConfirm }: { title: string; text: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void | Promise<void> }) {
  return <div className="dialog-backdrop" role="presentation"><dialog open aria-modal="true"><h2>{title}</h2><p>{text}</p><div className="dialog-actions"><button className="button secondary" onClick={onCancel}>Cancel</button><button className="button danger-button" onClick={() => void onConfirm()}>{confirmLabel}</button></div></dialog></div>;
}

export default function App() { return <AppProvider><Layout /></AppProvider>; }
