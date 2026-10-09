import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { Icon } from "./components/Icon";
import { HomeDashboard } from "./features/home/HomeDashboard";
import { appRepository, calculateWorkoutDuration, STORAGE_KEY } from "./persistence/appRepository";
import type { AppDataSnapshot, Exercise, PersistedSettings, Technique, ThaiStrickerDataFileV1, WeeklyWorkoutPlan, Workout, WorkoutCategory, WorkoutDifficulty, WorkoutImportPayload, WorkoutLogEntry } from "./types/domain";
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
  if (!value) throw new Error("AppProvider manquant");
  return value;
};

function isoDate(date = new Date()) { return date.toISOString().slice(0, 10); }
function uid(prefix: string) { return `${prefix}-${crypto.randomUUID()}`; }
function formatDate(value?: string) { return value ? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`)) : "Jamais"; }
function targetLabel(exercise: Exercise | Workout["exercises"][number]) { return exercise.target.type === "duration" ? `${exercise.target.seconds} s` : `${exercise.target.reps} répétitions`; }
function mondayOf(date: Date) { const result = new Date(date); const day = (result.getDay() + 6) % 7; result.setDate(result.getDate() - day); result.setHours(12, 0, 0, 0); return result; }
function weekNumber(date: Date) { const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())); const day = utc.getUTCDay() || 7; utc.setUTCDate(utc.getUTCDate() + 4 - day); const start = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1)); return Math.ceil((((utc.getTime() - start.getTime()) / 86400000) + 1) / 7); }
function downloadJson(value: unknown, filename: string) { const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }

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
    catch (error) { notify(error instanceof Error ? error.message : "Une erreur est survenue.", "error"); return false; }
  };
  if (!data) return <div className="splash"><div className="brand-mark">TS</div><p>Chargement…</p></div>;
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
    <Route path="/exercises/new" element={<ExerciseForm />} />
    <Route path="/exercises/:id/edit" element={<ExerciseForm />} />
    <Route path="/schedule" element={<Schedule />} />
    <Route path="/coach" element={<Coach />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/session/:workoutId" element={<WorkoutSession />} />
    <Route path="/session/:workoutId/recap" element={<WorkoutRecap />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main>{!immersive && <BottomNav />}</div>;
}

function Header({ title, back, action }: { title: string; back?: string; action?: ReactNode }) {
  return <header className="page-header">{back ? <Link className="icon-button" to={back} aria-label="Retour"><Icon name="arrow_back" /></Link> : <div className="brand-mini">TS</div>}<h1>{title}</h1>{action ?? <span className="header-spacer" />}</header>;
}

function Empty({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return <section className="empty"><Icon name={icon} size={42} /><h2>{title}</h2><p>{text}</p>{action}</section>;
}

function HomeDashboardRoute() {
  const { data } = useApp();
  return <HomeDashboard data={data} />;
}

function Workouts() {
  const { data, act } = useApp();
  const [remove, setRemove] = useState<Workout | null>(null);
  return <><Header title="Séances" action={<Link className="icon-button" to="/workouts/new" aria-label="Nouvelle séance"><Icon name="add" /></Link>} />{data.workouts.length ? <div className="stack">{data.workouts.map((workout) => <article className="workout-card" key={workout.id}><div className="card-top"><span className="pill">{workout.category}</span><span className="muted">{workout.difficulty}</span></div><h2>{workout.title}</h2><p>{workout.description}</p><div className="meta"><span><Icon name="schedule" /> {workout.totalDurationMinutes} min</span><span><Icon name="fitness_center" /> {workout.exercises.length}</span><span><Icon name="history" /> {formatDate(workout.lastDoneDate)}</span></div><div className="actions"><Link className="button primary" to={`/session/${workout.id}`}><Icon name="play_arrow" /> Démarrer</Link><Link className="button secondary" to={`/workouts/${workout.id}`}>Détails</Link><Link className="icon-button" to={`/workouts/${workout.id}/edit`} aria-label={`Modifier ${workout.title}`}><Icon name="edit" /></Link><button className="icon-button danger" onClick={() => setRemove(workout)} aria-label={`Supprimer ${workout.title}`}><Icon name="delete" /></button></div></article>)}</div> : <Empty icon="fitness_center" title="Aucune séance" text="Crée une séance à partir de ta bibliothèque d’exercices." action={<Link className="button primary" to="/workouts/new">Créer une séance</Link>} />}{remove && <ConfirmDialog title="Supprimer cette séance ?" text={`« ${remove.title} » sera retirée du planning. L’historique restera conservé.`} onCancel={() => setRemove(null)} onConfirm={async () => { await act(() => appRepository.deleteWorkout(remove.id), "Séance supprimée."); setRemove(null); }} />}</>;
}

function WorkoutDetail() {
  const { id } = useParams(); const { data } = useApp(); const workout = data.workouts.find((item) => item.id === id);
  if (!workout) return <Navigate to="/workouts" replace />;
  return <><Header title="Détail" back="/workouts" action={<Link className="icon-button" to={`/workouts/${workout.id}/edit`} aria-label="Modifier"><Icon name="edit" /></Link>} /><section className="title-block"><span className="pill">{workout.category}</span><h2>{workout.title}</h2><p>{workout.description}</p><div className="meta"><span>{workout.difficulty}</span><span>{workout.totalDurationMinutes} min</span><span>{workout.restSecondsBetweenExercises} s repos</span></div></section><section><h2>Exercices</h2><ol className="exercise-list">{workout.exercises.map((exercise, index) => <li key={`${exercise.id}-${index}`}><span className="number">{index + 1}</span><div><h3>{exercise.title}</h3><p>{exercise.description}</p></div><strong>{targetLabel(exercise)}</strong></li>)}</ol></section><Link className="button primary sticky-action" to={`/session/${workout.id}`}><Icon name="play_arrow" /> Commencer</Link></>;
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
  const addOccurrence = (exercise: Exercise) => { if (draft.exercises.length >= data.settings.maxExercisesPerWorkout) return; update({ ...draft, exercises: [...draft.exercises, { ...exercise }] }); };
  const removeOccurrence = (index: number) => update({ ...draft, exercises: draft.exercises.filter((_, itemIndex) => itemIndex !== index) });
  const move = (index: number, delta: number) => { const target = index + delta; if (target < 0 || target >= draft.exercises.length) return; const exercises = [...draft.exercises]; [exercises[index], exercises[target]] = [exercises[target], exercises[index]]; update({ ...draft, exercises }); };
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!draft.title.trim() || !draft.exercises.length) return;
    const value: Workout = { ...draft, id: current?.id ?? uid("workout"), totalDurationMinutes: calculateWorkoutDuration(draft.exercises, draft.restSecondsBetweenExercises, data.settings.defaultRepsExerciseDurationMinutes), lastDoneDate: current?.lastDoneDate };
    const ok = await act(() => current ? appRepository.updateWorkout(value) : appRepository.addWorkout(value), current ? "Séance modifiée." : "Séance créée.");
    if (ok) { sessionStorage.removeItem(DRAFT_KEY); navigate("/workouts"); }
  };
  return <><Header title={current ? "Modifier la séance" : "Nouvelle séance"} back="/workouts" /><form className="form" onSubmit={submit}><label>Nom<input required value={draft.title} onChange={(event) => update({ ...draft, title: event.target.value })} /></label><label>Description<textarea rows={3} value={draft.description} onChange={(event) => update({ ...draft, description: event.target.value })} /></label><div className="form-grid"><label>Niveau<select value={draft.difficulty} onChange={(event) => update({ ...draft, difficulty: event.target.value as WorkoutDifficulty })}>{WORKOUT_DIFFICULTIES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Catégorie<select value={draft.category} onChange={(event) => update({ ...draft, category: event.target.value as WorkoutCategory })}>{WORKOUT_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label></div><label>Repos entre exercices<select value={draft.restSecondsBetweenExercises} onChange={(event) => update({ ...draft, restSecondsBetweenExercises: Number(event.target.value) })}>{[15, 30, 45, 60, 90, 120].map((item) => <option value={item} key={item}>{item} secondes</option>)}</select></label>
    <section><div className="section-heading"><div><p className="eyebrow">PROGRAMME</p><h2>{draft.exercises.length}/{data.settings.maxExercisesPerWorkout} exercices</h2></div><Link className="button secondary small" to={`/exercises/new?return=${encodeURIComponent(id ? `/workouts/${id}/edit` : "/workouts/new")}`}>Nouvel exercice</Link></div>{draft.exercises.length ? <ol className="exercise-list compact">{draft.exercises.map((exercise, index) => <li key={`${exercise.id}-${index}`}><span className="number">{index + 1}</span><div><h3>{exercise.title}</h3><p>{targetLabel(exercise)}</p></div><div className="mini-actions"><button type="button" onClick={() => move(index, -1)} disabled={!index} aria-label="Monter"><Icon name="arrow_upward" /></button><button type="button" onClick={() => move(index, 1)} disabled={index === draft.exercises.length - 1} aria-label="Descendre"><Icon name="arrow_downward" /></button><button type="button" onClick={() => removeOccurrence(index)} aria-label="Retirer"><Icon name="close" /></button></div></li>)}</ol> : <p className="muted">Ajoute au moins un exercice.</p>}</section>
    <section><h2>Bibliothèque</h2><div className="library">{data.availableExercises.map((exercise) => <article key={exercise.id}><div><h3>{exercise.title}</h3><p>{exercise.category || "Sans catégorie"} · {targetLabel(exercise)}</p></div><div className="mini-actions"><Link to={`/exercises/${exercise.id}/edit?return=${encodeURIComponent(id ? `/workouts/${id}/edit` : "/workouts/new")}`} aria-label="Modifier"><Icon name="edit" /></Link><button type="button" onClick={() => addOccurrence(exercise)} disabled={draft.exercises.length >= data.settings.maxExercisesPerWorkout} aria-label="Ajouter"><Icon name="add" /></button></div></article>)}</div></section><button className="button primary sticky-action" type="submit" disabled={!draft.title.trim() || !draft.exercises.length}>Enregistrer la séance</button></form></>;
}

function ExerciseForm() {
  const { id } = useParams(); const { data, act } = useApp(); const navigate = useNavigate(); const [params] = useSearchParams();
  const current = data.availableExercises.find((item) => item.id === id); const returnTo = params.get("return") || "/workouts/new";
  const [value, setValue] = useState<Exercise>(current ?? { id: "", title: "", description: "", help: "", category: "", target: { type: "duration", seconds: 60 }, techniqueIds: [] });
  const submit = async (event: FormEvent) => { event.preventDefault(); const exercise = { ...value, id: current?.id ?? uid("exercise") }; const ok = await act(() => current ? appRepository.updateAvailableExercise(exercise) : appRepository.addAvailableExercise(exercise), current ? "Exercice modifié." : "Exercice ajouté."); if (ok) navigate(returnTo); };
  return <><Header title={current ? "Modifier l’exercice" : "Nouvel exercice"} back={returnTo} /><form className="form" onSubmit={submit}><label>Nom<input required value={value.title} onChange={(event) => setValue({ ...value, title: event.target.value })} /></label><label>Description<textarea rows={3} value={value.description} onChange={(event) => setValue({ ...value, description: event.target.value })} /></label><label>Conseil<textarea rows={3} value={value.help} onChange={(event) => setValue({ ...value, help: event.target.value })} /></label><label>Catégorie<input value={value.category} onChange={(event) => setValue({ ...value, category: event.target.value })} /></label><fieldset><legend>Objectif</legend><div className="segmented"><button type="button" className={value.target.type === "duration" ? "active" : ""} onClick={() => setValue({ ...value, target: { type: "duration", seconds: 60 } })}>Durée</button><button type="button" className={value.target.type === "reps" ? "active" : ""} onClick={() => setValue({ ...value, target: { type: "reps", reps: 10 } })}>Répétitions</button></div>{value.target.type === "duration" ? <label>Secondes<input type="number" min="1" required value={value.target.seconds} onChange={(event) => setValue({ ...value, target: { type: "duration", seconds: Number(event.target.value) } })} /></label> : <label>Nombre<input type="number" min="1" required value={value.target.reps} onChange={(event) => setValue({ ...value, target: { type: "reps", reps: Number(event.target.value) } })} /></label>}</fieldset><button className="button primary sticky-action" type="submit">Enregistrer l’exercice</button></form></>;
}

function Schedule() {
  const { data, act } = useApp(); const [weekStart, setWeekStart] = useState(() => mondayOf(new Date()));
  const start = isoDate(weekStart); const current = data.weeklyWorkoutPlans.find((item) => item.weekStartDate === start);
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date(weekStart); date.setDate(date.getDate() + index); return { date: isoDate(date), label: new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "short" }).format(date) }; });
  const saveDay = async (dayDate: string, dayLabel: string, workoutId: string) => {
    const workout = data.workouts.find((item) => item.id === workoutId); const plannedDays = (current?.plannedDays ?? []).filter((item) => item.dayDate !== dayDate);
    if (workout) plannedDays.push({ dayDate, dayLabel, workoutId: workout.id, workoutTitle: workout.title });
    const plan: WeeklyWorkoutPlan = { id: current?.id ?? uid("plan"), weekStartDate: start, weekNumber: weekNumber(weekStart), year: weekStart.getFullYear(), requiredTrainingDays: data.settings.trainingDaysPerWeek, plannedDays, source: "web" };
    await act(() => appRepository.saveWeeklyPlan(plan), "Planning enregistré.");
  };
  const shift = (amount: number) => { const next = new Date(weekStart); next.setDate(next.getDate() + amount * 7); setWeekStart(next); };
  return <><Header title="Planning" /><div className="week-nav"><button className="icon-button" onClick={() => shift(-1)} aria-label="Semaine précédente"><Icon name="chevron_left" /></button><div><strong>Semaine {weekNumber(weekStart)}</strong><span>À partir du {formatDate(start)}</span></div><button className="icon-button" onClick={() => shift(1)} aria-label="Semaine suivante"><Icon name="chevron_right" /></button></div><p className="muted center">Objectif : {data.settings.trainingDaysPerWeek} séances cette semaine</p><div className="stack">{days.map((day) => { const planned = current?.plannedDays.find((item) => item.dayDate === day.date); return <article className="day-card" key={day.date}><div><h3>{day.label}</h3><p>{planned?.workoutTitle ?? "Repos"}</p></div><select aria-label={`Séance du ${day.label}`} value={planned?.workoutId ?? ""} onChange={(event) => void saveDay(day.date, day.label, event.target.value)}><option value="">Repos</option>{data.workouts.map((workout) => <option key={workout.id} value={workout.id}>{workout.title}</option>)}</select></article>; })}</div></>;
}

function Coach() {
  const { data } = useApp(); const [selected, setSelected] = useState(0); const tip = data.coachTips[selected];
  return <><Header title="Coach IA" />{tip ? <><section className="coach-hero"><Icon name="psychology" size={42} /><p className="eyebrow">FOCUS TECHNIQUE</p><h2>{tip.exerciseTitle}</h2><p>{tip.shortTip}</p></section><div className="segmented scroll">{data.coachTips.map((item, index) => <button key={`${item.exerciseId}-${index}`} className={index === selected ? "active" : ""} onClick={() => setSelected(index)}>{item.exerciseTitle}</button>)}</div><InfoList title="Points techniques" icon="bolt" items={tip.technicalTips} /><InfoList title="Erreurs fréquentes" icon="warning" items={tip.commonMistakes} /><InfoList title="Points d’attention" icon="visibility" items={tip.focusPoints} /><section className="info-card"><h2>Pourquoi ?</h2><p>{tip.explanation}</p></section></> : <Empty icon="psychology" title="Aucun conseil disponible" text="Les conseils importés avec tes données apparaîtront ici." />}</>;
}
function InfoList({ title, icon, items }: { title: string; icon: string; items: string[] }) { return <section className="info-card"><h2><Icon name={icon} /> {title}</h2><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>; }

function Settings() {
  const { data, act, refresh, notify } = useApp(); const fullInput = useRef<HTMLInputElement>(null); const workoutInput = useRef<HTMLInputElement>(null); const techniqueInput = useRef<HTMLInputElement>(null); const [confirmReset, setConfirmReset] = useState(false);
  const setSetting = async <K extends keyof PersistedSettings>(key: K, value: PersistedSettings[K]) => { await act(() => appRepository.saveSetting(key, value)); };
  const exportAll = async () => downloadJson(await appRepository.exportDataFile(), `thai-stricker-backup-${isoDate()}.json`);
  const readJson = async (file?: File) => file ? JSON.parse(await file.text()) as unknown : null;
  const importFull = async (file?: File) => {
    try { const input = await readJson(file); if (!input) return; const backup = await appRepository.importDataFile(input); downloadJson(backup, `thai-stricker-before-import-${isoDate()}.json`); await refresh(); notify("Sauvegarde importée. Une copie des anciennes données a été téléchargée."); }
    catch (error) { notify(error instanceof Error ? error.message : "Import impossible.", "error"); }
    finally { if (fullInput.current) fullInput.current.value = ""; }
  };
  const importWorkouts = async (file?: File) => { try { const input = await readJson(file); const values = Array.isArray(input) ? input : (input as { workouts?: WorkoutImportPayload[] })?.workouts; if (!Array.isArray(values)) throw new Error("Le fichier ne contient pas de séances."); await act(() => appRepository.importWorkouts(values), `${values.length} séance(s) importée(s).`); } catch (error) { notify(error instanceof Error ? error.message : "Import impossible.", "error"); } finally { if (workoutInput.current) workoutInput.current.value = ""; } };
  const importTechniques = async (file?: File) => { try { const input = await readJson(file); const values = Array.isArray(input) ? input : (input as { techniques?: Technique[] })?.techniques; if (!Array.isArray(values)) throw new Error("Le fichier ne contient pas de techniques."); await act(() => appRepository.importTechniques(values), `${values.length} technique(s) importée(s).`); } catch (error) { notify(error instanceof Error ? error.message : "Import impossible.", "error"); } finally { if (techniqueInput.current) techniqueInput.current.value = ""; } };
  return <><Header title="Réglages" /><section className="settings-group"><p className="eyebrow">ENTRAÎNEMENT</p><SettingSelect label="Repos entre exercices" value={data.settings.restSecondsBetweenExercises} options={[15, 30, 45, 60, 90, 120]} suffix=" secondes" onChange={(value) => void setSetting("restSecondsBetweenExercises", value as PersistedSettings["restSecondsBetweenExercises"])} /><SettingSelect label="Jours par semaine" value={data.settings.trainingDaysPerWeek} options={[1, 2, 3, 4, 5, 6, 7]} onChange={(value) => void setSetting("trainingDaysPerWeek", value as PersistedSettings["trainingDaysPerWeek"])} /><SettingSelect label="Exercices maximum" value={data.settings.maxExercisesPerWorkout} options={[5, 10, 15, 20]} onChange={(value) => void setSetting("maxExercisesPerWorkout", value as PersistedSettings["maxExercisesPerWorkout"])} /><SettingSelect label="Exercices par page" value={data.settings.numberOfExercisesPerPage} options={[3, 6, 9, 12]} onChange={(value) => void setSetting("numberOfExercisesPerPage", value as PersistedSettings["numberOfExercisesPerPage"])} /><SettingSelect label="Durée d’un exercice en répétitions" value={data.settings.defaultRepsExerciseDurationMinutes} options={[1, 2, 3, 4, 5]} suffix=" min" onChange={(value) => void setSetting("defaultRepsExerciseDurationMinutes", value as PersistedSettings["defaultRepsExerciseDurationMinutes"])} /></section>
    <section className="settings-group"><p className="eyebrow">APPARENCE</p><div className="setting-row"><div><strong>Thème</strong><span>Clair ou sombre</span></div><div className="segmented"><button className={data.settings.themePreference === "Light" ? "active" : ""} onClick={() => void setSetting("themePreference", "Light")}>Clair</button><button className={data.settings.themePreference === "Dark" ? "active" : ""} onClick={() => void setSetting("themePreference", "Dark")}>Sombre</button></div></div></section>
    <section className="settings-group"><p className="eyebrow">DONNÉES LOCALES</p><button className="setting-action" onClick={() => void exportAll()}><span className="round-icon"><Icon name="download" /></span><div><strong>Exporter une sauvegarde</strong><span>Toutes les données au format JSON</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => fullInput.current?.click()}><span className="round-icon"><Icon name="upload" /></span><div><strong>Importer une sauvegarde</strong><span>Remplace les données après sauvegarde</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => workoutInput.current?.click()}><span className="round-icon"><Icon name="fitness_center" /></span><div><strong>Importer des séances</strong><span>Ancien format JSON compatible</span></div><Icon name="chevron_right" /></button><button className="setting-action" onClick={() => techniqueInput.current?.click()}><span className="round-icon"><Icon name="sports_martial_arts" /></span><div><strong>Importer des techniques</strong><span>Ancien format JSON compatible</span></div><Icon name="chevron_right" /></button><button className="setting-action danger-text" onClick={() => setConfirmReset(true)}><span className="round-icon"><Icon name="delete_forever" /></span><div><strong>Réinitialiser l’application</strong><span>Efface les données de ce navigateur</span></div><Icon name="chevron_right" /></button><input ref={fullInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importFull(event.target.files?.[0])} /><input ref={workoutInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importWorkouts(event.target.files?.[0])} /><input ref={techniqueInput} hidden type="file" accept="application/json,.json" onChange={(event) => void importTechniques(event.target.files?.[0])} /></section>
    <p className="storage-note"><Icon name="lock" /> Les données restent uniquement dans ce navigateur. Exporte régulièrement une sauvegarde.</p>{confirmReset && <ConfirmDialog title="Réinitialiser ThaiStricker ?" text="Toutes les données enregistrées dans ce navigateur seront supprimées. Cette action est irréversible sans sauvegarde." confirmLabel="Réinitialiser" onCancel={() => setConfirmReset(false)} onConfirm={async () => { await exportAll(); await appRepository.reset(); await refresh(); setConfirmReset(false); notify("Application réinitialisée. Une sauvegarde a été téléchargée."); }} />}</>;
}
function SettingSelect({ label, value, options, suffix = "", onChange }: { label: string; value: number; options: number[]; suffix?: string; onChange: (value: number) => void }) { return <label className="setting-row"><span><strong>{label}</strong></span><select value={value} onChange={(event) => onChange(Number(event.target.value))}>{options.map((item) => <option key={item} value={item}>{item}{suffix}</option>)}</select></label>; }

function WorkoutSession() {
  const { workoutId } = useParams(); const { data, act } = useApp(); const navigate = useNavigate(); const workout = data.workouts.find((item) => item.id === workoutId);
  const [index, setIndex] = useState(0); const [phase, setPhase] = useState<"exercise" | "rest">("exercise"); const [skipped, setSkipped] = useState(0); const [remaining, setRemaining] = useState(0); const deadline = useRef<number | null>(null); const startedAt = useRef(Date.now());
  const finish = async (completed: number, skippedCount: number) => { if (!workout) return; const now = new Date(); const recap = { workoutId: workout.id, workoutTitle: workout.title, exerciseCount: workout.exercises.length, completedExerciseCount: completed, skippedExerciseCount: skippedCount, totalDurationMinutes: Math.max(1, Math.ceil((Date.now() - startedAt.current) / 60000)), completedDate: isoDate(now) }; sessionStorage.setItem(`recap:${workout.id}`, JSON.stringify(recap)); const log: WorkoutLogEntry = { ...recap, id: uid("log"), completedAt: now.toISOString(), source: "web" }; await act(() => appRepository.addWorkoutLog(log)); navigate(`/session/${workout.id}/recap`, { replace: true }); };
  const advance = (skip = false) => { if (!workout) return; const nextSkipped = skipped + (skip && phase === "exercise" ? 1 : 0); if (skip) setSkipped(nextSkipped); if (phase === "exercise" && index === workout.exercises.length - 1) { void finish(workout.exercises.length - nextSkipped, nextSkipped); return; } if (phase === "exercise" && workout.restSecondsBetweenExercises > 0) { setPhase("rest"); deadline.current = Date.now() + workout.restSecondsBetweenExercises * 1000; setRemaining(workout.restSecondsBetweenExercises); } else { setPhase("exercise"); setIndex((value) => value + 1); deadline.current = null; } };
  const exercise = workout?.exercises[index];
  useEffect(() => { if (!exercise || phase !== "exercise" || exercise.target.type !== "duration") return; deadline.current = Date.now() + exercise.target.seconds * 1000; setRemaining(exercise.target.seconds); }, [index, phase, exercise?.id]);
  useEffect(() => { if (!deadline.current) return; const timer = window.setInterval(() => { const value = Math.max(0, Math.ceil(((deadline.current ?? 0) - Date.now()) / 1000)); setRemaining(value); if (value === 0) { window.clearInterval(timer); deadline.current = null; advance(false); } }, 250); return () => window.clearInterval(timer); });
  if (!workout || !exercise) return <Navigate to="/workouts" replace />;
  return <div className="session"><header><Link className="icon-button" to={`/workouts/${workout.id}`} aria-label="Quitter"><Icon name="close" /></Link><span>{index + 1} / {workout.exercises.length}</span><button className="text-button" onClick={() => advance(true)}>Passer</button></header><div className="progress"><span style={{ width: `${((index + (phase === "rest" ? .5 : 0)) / workout.exercises.length) * 100}%` }} /></div>{phase === "rest" ? <section className="session-center"><p className="eyebrow">RÉCUPÉRATION</p><div className="timer">{remaining}</div><h1>Respire et reste mobile</h1><button className="button primary" onClick={() => advance(false)}>Terminer le repos</button></section> : <section className="session-center"><p className="eyebrow">EXERCICE {index + 1}</p><h1>{exercise.title}</h1><p className="session-description">{exercise.description}</p>{exercise.target.type === "duration" ? <div className="timer">{remaining}</div> : <div className="reps">{exercise.target.reps}<span>répétitions</span></div>}<aside><Icon name="lightbulb" /><p>{exercise.help || "Garde une technique propre et un rythme régulier."}</p></aside>{exercise.target.type === "reps" && <button className="button primary" onClick={() => advance(false)}>Exercice terminé</button>}</section>}</div>;
}

function WorkoutRecap() {
  const { workoutId } = useParams(); const raw = sessionStorage.getItem(`recap:${workoutId}`); const recap = raw ? JSON.parse(raw) as { workoutTitle: string; exerciseCount: number; completedExerciseCount: number; skippedExerciseCount: number; totalDurationMinutes: number } : null;
  return <div className="recap"><span className="recap-icon"><Icon name="emoji_events" size={54} /></span><p className="eyebrow">SÉANCE TERMINÉE</p><h1>{recap?.workoutTitle ?? "Bravo !"}</h1><p>Tu as terminé ton entraînement. Continue comme ça.</p><div className="stats"><article><strong>{recap?.completedExerciseCount ?? 0}</strong><span>terminés</span></article><article><strong>{recap?.skippedExerciseCount ?? 0}</strong><span>passés</span></article><article><strong>{recap?.totalDurationMinutes ?? 0}</strong><span>minutes</span></article></div><Link className="button primary" to="/">Retour à l’accueil</Link></div>;
}

function ConfirmDialog({ title, text, confirmLabel = "Supprimer", onCancel, onConfirm }: { title: string; text: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void | Promise<void> }) {
  return <div className="dialog-backdrop" role="presentation"><dialog open aria-modal="true"><h2>{title}</h2><p>{text}</p><div className="dialog-actions"><button className="button secondary" onClick={onCancel}>Annuler</button><button className="button danger-button" onClick={() => void onConfirm()}>{confirmLabel}</button></div></dialog></div>;
}

export default function App() { return <AppProvider><Layout /></AppProvider>; }
