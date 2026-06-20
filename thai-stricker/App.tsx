import { MaterialSymbols_400Regular } from "@expo-google-fonts/material-symbols/400Regular";
import { useFonts } from "@expo-google-fonts/material-symbols/useFonts";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { BottomNavbar, type BottomNavTab } from "./src/components/navigation/BottomNavbar";
import { AiCoachScreen } from "./src/features/aiCoach/AiCoachScreen";
import type { MockCoachTip } from "./src/features/aiCoach/coachTipsMocks";
import type { MockAvailableExercise } from "./src/features/exercises/exerciseMocks";
import { HomeScreen } from "./src/features/home/HomeScreen";
import type {
  MockCalendarWorkoutDay,
  MockMonthlySummary,
} from "./src/features/home/homeMocks";
import { ScheduleScreen } from "./src/features/plannedWorkouts/ScheduleScreen";
import { type MockWeeklyWorkoutPlan } from "./src/features/plannedWorkouts/plannedWorkoutMocks";
import {
  type DefaultRepsExerciseDurationOption,
  type NumberOfExercisesPerPageOption,
  SettingsScreen,
  type MaxExercisesPerWorkoutOption,
  type ThemePreferenceOption,
  type TrainingDayOption,
} from "./src/features/settings/SettingsScreen";
import { getTheme } from "./src/styles/theme";
import { WorkoutFinishedRecapScreen } from "./src/features/workoutSession/WorkoutFinishedRecapScreen";
import { StartWorkoutScreen } from "./src/features/workoutSession/StartWorkoutScreen";
import { type MockWorkoutLogEntry } from "./src/features/workoutLogging/workoutLogMocks";
import { AddWorkoutScreen } from "./src/features/workouts/AddWorkoutScreen";
import { EditWorkoutScreen } from "./src/features/workouts/EditWorkoutScreen";
import { WorkoutsScreen } from "./src/features/workouts/WorkoutsScreen";
import { type MockWorkout } from "./src/features/workouts/workoutMocks";
import {
  addAvailableExercise,
  addWorkout,
  addWorkoutLog,
  deleteWorkout,
  loadAppData,
  saveSetting,
  saveWeeklyPlan,
  updateAvailableExercise,
  updateWorkout,
  updateWorkoutLastDoneDate,
} from "./src/persistence/appRepository";

type WorkoutFlowState = {
  workoutId: string;
  currentExerciseIndex: number;
  currentStep: "exercise" | "rest";
  hasStarted: boolean;
  completedExerciseCount: number;
  skippedExerciseCount: number;
};

type WorkoutRecapState = {
  workoutId: string;
  completionDate: string;
  completedExerciseCount: number;
  skippedExerciseCount: number;
};

type WorkoutsViewState = "list" | "add" | { type: "edit"; workoutId: string };

function pickRandomCoachTip(coachTips: MockCoachTip[]) {
  if (coachTips.length === 0) {
    return null;
  }

  return coachTips[Math.floor(Math.random() * coachTips.length)] ?? null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    MaterialSymbols_400Regular,
  });
  const [activeTab, setActiveTab] = useState<BottomNavTab>("Home");
  const [isAppReady, setIsAppReady] = useState(false);
  const [restSecondsBetweenExercises, setRestSecondsBetweenExercises] = useState<
    15 | 30 | 45 | 60 | 90 | 120
  >(30);
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<TrainingDayOption>(3);
  const [maxExercisesPerWorkout, setMaxExercisesPerWorkout] =
    useState<MaxExercisesPerWorkoutOption>(10);
  const [numberOfExercisesPerPage, setNumberOfExercisesPerPage] =
    useState<NumberOfExercisesPerPageOption>(6);
  const [defaultRepsExerciseDurationMinutes, setDefaultRepsExerciseDurationMinutes] =
    useState<DefaultRepsExerciseDurationOption>(3);
  const [themePreference, setThemePreference] = useState<ThemePreferenceOption>("Dark");
  const [availableExercises, setAvailableExercises] = useState<MockAvailableExercise[]>([]);
  const [workouts, setWorkouts] = useState<MockWorkout[]>([]);
  const [workoutsView, setWorkoutsView] = useState<WorkoutsViewState>("list");
  const [workoutLogs, setWorkoutLogs] = useState<MockWorkoutLogEntry[]>([]);
  const [weeklyWorkoutPlans, setWeeklyWorkoutPlans] = useState<MockWeeklyWorkoutPlan[]>([]);
  const [coachTips, setCoachTips] = useState<MockCoachTip[]>([]);
  const [calendarWorkoutDays, setCalendarWorkoutDays] = useState<MockCalendarWorkoutDay[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MockMonthlySummary>({
    completedWorkouts: 0,
    plannedWorkouts: 0,
    missedWorkouts: 0,
  });
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlowState | null>(null);
  const [workoutRecap, setWorkoutRecap] = useState<WorkoutRecapState | null>(null);
  const [homeCoachTip, setHomeCoachTip] = useState<MockCoachTip | null>(null);
  const [aiCoachVisitKey, setAiCoachVisitKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const bootstrapApp = async () => {
      try {
        const snapshot = await loadAppData();

        if (!isMounted) {
          return;
        }

        setRestSecondsBetweenExercises(snapshot.settings.restSecondsBetweenExercises);
        setTrainingDaysPerWeek(snapshot.settings.trainingDaysPerWeek);
        setMaxExercisesPerWorkout(snapshot.settings.maxExercisesPerWorkout);
        setNumberOfExercisesPerPage(snapshot.settings.numberOfExercisesPerPage);
        setDefaultRepsExerciseDurationMinutes(
          snapshot.settings.defaultRepsExerciseDurationMinutes,
        );
        setThemePreference(snapshot.settings.themePreference);
        setAvailableExercises(snapshot.availableExercises);
        setWorkouts(snapshot.workouts);
        setWorkoutLogs(snapshot.workoutLogs);
        setWeeklyWorkoutPlans(snapshot.weeklyWorkoutPlans);
        setCoachTips(snapshot.coachTips);
        setCalendarWorkoutDays(snapshot.calendarWorkoutDays);
        setMonthlySummary(snapshot.monthlySummary);
        setHomeCoachTip(pickRandomCoachTip(snapshot.coachTips));
        setIsAppReady(true);
      } catch (error) {
        console.error("Failed to initialize local SQLite data", error);

        if (!isMounted) {
          return;
        }

        Alert.alert(
          "Database error",
          "The app could not initialize local storage. Please restart the app.",
        );
      }
    };

    void bootstrapApp();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!fontsLoaded || !isAppReady || !homeCoachTip) {
    return <View style={styles.appShell} />;
  }

  const handleTabPress = (tab: BottomNavTab) => {
    if (workoutFlow || workoutRecap) {
      return;
    }

    if (
      tab === "Home" ||
      tab === "Workouts" ||
      tab === "Schedule" ||
      tab === "AI Coach" ||
      tab === "Settings"
    ) {
      setActiveTab(tab);

      if (tab !== "Workouts") {
        setWorkoutsView("list");
      }

      if (tab === "Home") {
        const nextTip = pickRandomCoachTip(coachTips);
        if (nextTip) {
          setHomeCoachTip(nextTip);
        }
      }

      if (tab === "AI Coach") {
        setAiCoachVisitKey((currentKey) => currentKey + 1);
      }

      return;
    }

    Alert.alert(tab, `${tab} is a placeholder only. Real navigation is not implemented yet.`);
  };

  const activeWorkout = workoutFlow
    ? workouts.find((workout) => workout.id === workoutFlow.workoutId) ?? null
    : null;

  const recapWorkout = workoutRecap
    ? workouts.find((workout) => workout.id === workoutRecap.workoutId) ?? null
    : null;

  const finishWorkoutFlow = (flow: WorkoutFlowState) => {
    const completedWorkout = workouts.find((workout) => workout.id === flow.workoutId);
    if (!completedWorkout) {
      return;
    }

    const completedAt = new Date().toISOString();
    const completionDate = completedAt.slice(0, 10);

    setWorkouts((currentWorkouts) =>
      currentWorkouts.map((workout) =>
        workout.id === flow.workoutId ? { ...workout, lastDoneDate: completionDate } : workout,
      ),
    );

    const nextLog: MockWorkoutLogEntry = {
      id: `log-${Date.now()}`,
      workoutId: completedWorkout.id,
      workoutTitle: completedWorkout.title,
      completedAt,
      completedDate: completionDate,
      exerciseCount: completedWorkout.exercises.length,
      completedExerciseCount: flow.completedExerciseCount,
      skippedExerciseCount: flow.skippedExerciseCount,
      totalDurationMinutes: completedWorkout.totalDurationMinutes,
      source: "sqlite",
    };

    setWorkoutLogs((currentLogs) => [nextLog, ...currentLogs]);
    setWorkoutFlow(null);
    setWorkoutRecap({
      workoutId: flow.workoutId,
      completionDate,
      completedExerciseCount: flow.completedExerciseCount,
      skippedExerciseCount: flow.skippedExerciseCount,
    });

    void (async () => {
      await updateWorkoutLastDoneDate(flow.workoutId, completionDate);
      await addWorkoutLog(nextLog);
    })();
  };

  const advanceFromExercise = (didSkip: boolean) => {
    let finishedFlow: WorkoutFlowState | null = null;

    setWorkoutFlow((currentFlow) => {
      if (!currentFlow) {
        return currentFlow;
      }

      const workout = workouts.find((item) => item.id === currentFlow.workoutId);
      if (!workout) {
        return currentFlow;
      }

      const isFinalExercise = currentFlow.currentExerciseIndex === workout.exercises.length - 1;
      const updatedFlow = {
        ...currentFlow,
        completedExerciseCount: currentFlow.completedExerciseCount + (didSkip ? 0 : 1),
        skippedExerciseCount: currentFlow.skippedExerciseCount + (didSkip ? 1 : 0),
      };

      if (isFinalExercise) {
        finishedFlow = updatedFlow;
        return null;
      }

      return {
        ...updatedFlow,
        currentStep: "rest",
      };
    });

    if (finishedFlow) {
      finishWorkoutFlow(finishedFlow);
    }
  };

  const handleFinishRest = () => {
    setWorkoutFlow((currentFlow) => {
      if (!currentFlow) {
        return currentFlow;
      }

      return {
        ...currentFlow,
        hasStarted: true,
        currentStep: "exercise",
        currentExerciseIndex: currentFlow.currentExerciseIndex + 1,
      };
    });
  };

  const handleStartWorkoutFlow = () => {
    setWorkoutFlow((currentFlow) => {
      if (!currentFlow) {
        return currentFlow;
      }

      return {
        ...currentFlow,
        hasStarted: true,
      };
    });
  };

  const handleCancelWorkoutFlow = () => {
    setWorkoutFlow(null);
    setWorkoutRecap(null);
    setWorkoutsView("list");
    const nextTip = pickRandomCoachTip(coachTips);
    if (nextTip) {
      setHomeCoachTip(nextTip);
    }
    setActiveTab("Home");
  };

  const handleStartWorkout = (workoutId: string) => {
    setWorkoutRecap(null);
    setWorkoutFlow({
      workoutId,
      currentExerciseIndex: 0,
      currentStep: "exercise",
      hasStarted: false,
      completedExerciseCount: 0,
      skippedExerciseCount: 0,
    });
  };

  const handleBackToHome = () => {
    setWorkoutRecap(null);
    const nextTip = pickRandomCoachTip(coachTips);
    if (nextTip) {
      setHomeCoachTip(nextTip);
    }
    setActiveTab("Home");
  };

  const handleOpenAddWorkout = () => {
    setWorkoutsView("add");
  };

  const handleOpenEditWorkout = (workoutId: string) => {
    setWorkoutsView({ type: "edit", workoutId });
  };

  const handleBackToWorkouts = () => {
    setWorkoutsView("list");
  };

  const handleAddWorkout = (workout: MockWorkout) => {
    setWorkouts((currentWorkouts) => [...currentWorkouts, workout]);
    setWorkoutsView("list");
    setActiveTab("Home");
    void addWorkout(workout);
  };

  const handleSaveEditedWorkout = (updatedWorkout: MockWorkout) => {
    setWorkouts((currentWorkouts) =>
      currentWorkouts.map((workout) =>
        workout.id === updatedWorkout.id ? updatedWorkout : workout,
      ),
    );
    setWorkoutsView("list");
    void updateWorkout(updatedWorkout);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    setWorkouts((currentWorkouts) => currentWorkouts.filter((workout) => workout.id !== workoutId));
    setWeeklyWorkoutPlans((currentPlans) =>
      currentPlans
        .map((plan) => ({
          ...plan,
          plannedDays: plan.plannedDays.filter((day) => day.workoutId !== workoutId),
        }))
        .filter((plan) => plan.plannedDays.length > 0),
    );
    setWorkoutsView((currentView) =>
      typeof currentView === "object" && currentView.workoutId === workoutId ? "list" : currentView,
    );
    void deleteWorkout(workoutId);
  };

  const handleSaveWeeklyPlan = (plan: MockWeeklyWorkoutPlan) => {
    setWeeklyWorkoutPlans((currentPlans) => {
      const plansWithoutWeek = currentPlans.filter(
        (currentPlan) => currentPlan.weekStartDate !== plan.weekStartDate,
      );
      const persistedPlan: MockWeeklyWorkoutPlan = {
        ...plan,
        source: "sqlite",
      };

      return [...plansWithoutWeek, persistedPlan].sort((leftPlan, rightPlan) =>
        leftPlan.weekStartDate.localeCompare(rightPlan.weekStartDate),
      );
    });
    void saveWeeklyPlan({ ...plan, source: "sqlite" });
  };

  const handleAddAvailableExercise = (newExercise: MockAvailableExercise) => {
    setAvailableExercises((currentExercises) => [...currentExercises, newExercise]);
    void addAvailableExercise(newExercise);
  };

  const handleUpdateAvailableExercise = (updatedExercise: MockAvailableExercise) => {
    setAvailableExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.id === updatedExercise.id ? updatedExercise : exercise,
      ),
    );
    void updateAvailableExercise(updatedExercise);
  };

  const handleRestSecondsChange = (
    value: 15 | 30 | 45 | 60 | 90 | 120,
  ) => {
    setRestSecondsBetweenExercises(value);
    void saveSetting("restSecondsBetweenExercises", value);
  };

  const handleTrainingDaysChange = (value: TrainingDayOption) => {
    setTrainingDaysPerWeek(value);
    void saveSetting("trainingDaysPerWeek", value);
  };

  const handleMaxExercisesChange = (value: MaxExercisesPerWorkoutOption) => {
    setMaxExercisesPerWorkout(value);
    void saveSetting("maxExercisesPerWorkout", value);
  };

  const handleExercisesPerPageChange = (value: NumberOfExercisesPerPageOption) => {
    setNumberOfExercisesPerPage(value);
    void saveSetting("numberOfExercisesPerPage", value);
  };

  const handleDefaultRepsDurationChange = (value: DefaultRepsExerciseDurationOption) => {
    setDefaultRepsExerciseDurationMinutes(value);
    void saveSetting("defaultRepsExerciseDurationMinutes", value);
  };

  const handleThemePreferenceChange = (value: ThemePreferenceOption) => {
    setThemePreference(value);
    void saveSetting("themePreference", value);
  };

  const shouldHideNavbar = Boolean(workoutFlow || workoutRecap);
  const theme = getTheme(themePreference);

  let content = null;

  if (workoutFlow && activeWorkout) {
    content = (
      <StartWorkoutScreen
        theme={theme}
        workout={activeWorkout}
        currentExerciseIndex={workoutFlow.currentExerciseIndex}
        currentStep={workoutFlow.currentStep}
        hasStarted={workoutFlow.hasStarted}
        restSecondsBetweenExercises={restSecondsBetweenExercises}
        onCancelWorkout={handleCancelWorkoutFlow}
        onStartWorkout={handleStartWorkoutFlow}
        onFinishExercise={() => advanceFromExercise(false)}
        onSkipExercise={() => advanceFromExercise(true)}
        onFinishRest={handleFinishRest}
      />
    );
  } else if (workoutRecap && recapWorkout) {
    content = (
      <WorkoutFinishedRecapScreen
        theme={theme}
        workoutTitle={recapWorkout.title}
        totalExercises={recapWorkout.exercises.length}
        completedExerciseCount={workoutRecap.completedExerciseCount}
        skippedExerciseCount={workoutRecap.skippedExerciseCount}
        completionDate={workoutRecap.completionDate}
        onBackToHome={handleBackToHome}
      />
    );
  } else if (activeTab === "Home") {
    content = (
      <HomeScreen
        theme={theme}
        randomCoachTip={homeCoachTip}
        workoutLogs={workoutLogs}
        weeklyWorkoutPlans={weeklyWorkoutPlans}
        workouts={workouts}
        calendarWorkoutDays={calendarWorkoutDays}
        monthlySummary={monthlySummary}
        onStartWorkout={handleStartWorkout}
        onOpenAiCoach={() => handleTabPress("AI Coach")}
      />
    );
  } else if (activeTab === "Workouts") {
    content =
      workoutsView === "add" ? (
        <AddWorkoutScreen
          theme={theme}
          availableExercises={availableExercises}
          maxExercisesPerWorkout={maxExercisesPerWorkout}
          numberOfExercisesPerPage={numberOfExercisesPerPage}
          restSecondsBetweenExercises={restSecondsBetweenExercises}
          defaultRepsExerciseDurationMinutes={defaultRepsExerciseDurationMinutes}
          onAddAvailableExercise={handleAddAvailableExercise}
          onUpdateAvailableExercise={handleUpdateAvailableExercise}
          onBackToWorkouts={handleBackToWorkouts}
          onAddWorkout={handleAddWorkout}
        />
      ) : typeof workoutsView === "object" && workoutsView.type === "edit" ? (
        <EditWorkoutScreen
          theme={theme}
          availableExercises={availableExercises}
          workout={
            workouts.find((currentWorkout) => currentWorkout.id === workoutsView.workoutId) ??
            null
          }
          maxExercisesPerWorkout={maxExercisesPerWorkout}
          numberOfExercisesPerPage={numberOfExercisesPerPage}
          restSecondsBetweenExercises={restSecondsBetweenExercises}
          defaultRepsExerciseDurationMinutes={defaultRepsExerciseDurationMinutes}
          onBackToWorkouts={handleBackToWorkouts}
          onSaveWorkout={handleSaveEditedWorkout}
        />
      ) : (
        <WorkoutsScreen
          theme={theme}
          restSecondsBetweenExercises={restSecondsBetweenExercises}
          workouts={workouts}
          onStartWorkout={handleStartWorkout}
          onOpenAddWorkout={handleOpenAddWorkout}
          onOpenEditWorkout={handleOpenEditWorkout}
          onDeleteWorkout={handleDeleteWorkout}
        />
      );
  } else if (activeTab === "Schedule") {
    content = (
      <ScheduleScreen
        theme={theme}
        trainingDaysPerWeek={trainingDaysPerWeek}
        workouts={workouts}
        weeklyWorkoutPlans={weeklyWorkoutPlans}
        onSaveWeeklyPlan={handleSaveWeeklyPlan}
      />
    );
  } else if (activeTab === "AI Coach") {
    content = (
      <AiCoachScreen
        theme={theme}
        availableExercises={availableExercises}
        coachTips={coachTips}
        visitKey={aiCoachVisitKey}
        weeklyWorkoutPlans={weeklyWorkoutPlans}
        workouts={workouts}
      />
    );
  } else {
    content = (
      <SettingsScreen
        theme={theme}
        restSecondsBetweenExercises={restSecondsBetweenExercises}
        onRestSecondsChange={handleRestSecondsChange}
        trainingDaysPerWeek={trainingDaysPerWeek}
        onTrainingDaysPerWeekChange={handleTrainingDaysChange}
        maxExercisesPerWorkout={maxExercisesPerWorkout}
        onMaxExercisesPerWorkoutChange={handleMaxExercisesChange}
        numberOfExercisesPerPage={numberOfExercisesPerPage}
        onNumberOfExercisesPerPageChange={handleExercisesPerPageChange}
        defaultRepsExerciseDurationMinutes={defaultRepsExerciseDurationMinutes}
        onDefaultRepsExerciseDurationMinutesChange={handleDefaultRepsDurationChange}
        themePreference={themePreference}
        onThemePreferenceChange={handleThemePreferenceChange}
      />
    );
  }

  return (
    <View style={[styles.appShell, { backgroundColor: theme.colors.appBackground }]}>
      {content}
      {!shouldHideNavbar ? (
        <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} theme={theme} />
      ) : null}
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
});
