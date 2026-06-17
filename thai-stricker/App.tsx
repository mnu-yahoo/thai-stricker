import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { BottomNavbar, type BottomNavTab } from './src/components/navigation/BottomNavbar';
import { HomeScreen } from './src/features/home/HomeScreen';
import { mockAvailableExercises } from './src/features/exercises/exerciseMocks';
import {
  type DefaultRepsExerciseDurationOption,
  type NumberOfExercisesPerPageOption,
  SettingsScreen,
  type MaxExercisesPerWorkoutOption,
  type TrainingDayOption,
} from './src/features/settings/SettingsScreen';
import { ScheduleScreen } from './src/features/plannedWorkouts/ScheduleScreen';
import { type MockWeeklyWorkoutPlan } from './src/features/plannedWorkouts/plannedWorkoutMocks';
import { WorkoutFinishedRecapScreen } from './src/features/workoutSession/WorkoutFinishedRecapScreen';
import { StartWorkoutScreen } from './src/features/workoutSession/StartWorkoutScreen';
import {
  mockWorkoutLogs,
  type MockWorkoutLogEntry,
} from './src/features/workoutLogging/workoutLogMocks';
import { AddWorkoutScreen } from './src/features/workouts/AddWorkoutScreen';
import { WorkoutsScreen } from './src/features/workouts/WorkoutsScreen';
import { mockWorkouts, type MockWorkout } from './src/features/workouts/workoutMocks';

type WorkoutFlowState = {
  workoutId: string;
  currentExerciseIndex: number;
  currentStep: 'exercise' | 'rest';
  completedExerciseCount: number;
  skippedExerciseCount: number;
};

type WorkoutRecapState = {
  workoutId: string;
  completionDate: string;
  completedExerciseCount: number;
  skippedExerciseCount: number;
};

type WorkoutsViewState = 'list' | 'add';

export default function App() {
  const [activeTab, setActiveTab] = useState<BottomNavTab>('Home');
  // Mock-only setting value. This will later come from persisted app settings.
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
  const [workouts, setWorkouts] = useState<MockWorkout[]>(mockWorkouts);
  const [workoutsView, setWorkoutsView] = useState<WorkoutsViewState>('list');
  const [workoutLogs, setWorkoutLogs] = useState<MockWorkoutLogEntry[]>(mockWorkoutLogs);
  const [weeklyWorkoutPlans, setWeeklyWorkoutPlans] = useState<MockWeeklyWorkoutPlan[]>([]);
  const [workoutFlow, setWorkoutFlow] = useState<WorkoutFlowState | null>(null);
  const [workoutRecap, setWorkoutRecap] = useState<WorkoutRecapState | null>(null);

  const handleTabPress = (tab: BottomNavTab) => {
    if (workoutFlow || workoutRecap) {
      return;
    }

    if (tab === 'Home' || tab === 'Workouts' || tab === 'Schedule' || tab === 'Settings') {
      setActiveTab(tab);
      if (tab !== 'Workouts') {
        setWorkoutsView('list');
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
    const activeCompletedWorkout = workouts.find((workout) => workout.id === flow.workoutId);
    if (!activeCompletedWorkout) {
      return;
    }

    const completedAt = new Date().toISOString();
    const completionDate = completedAt.slice(0, 10);

    setWorkouts((currentWorkouts) =>
      currentWorkouts.map((workout) =>
        workout.id === flow.workoutId ? { ...workout, lastDoneDate: completionDate } : workout,
      ),
    );
    setWorkoutLogs((currentLogs) => {
      const nextLog: MockWorkoutLogEntry = {
        id: `log-${Date.now()}`,
        workoutId: activeCompletedWorkout.id,
        workoutTitle: activeCompletedWorkout.title,
        completedAt,
        completedDate: completionDate,
        exerciseCount: activeCompletedWorkout.exercises.length,
        completedExerciseCount: flow.completedExerciseCount,
        skippedExerciseCount: flow.skippedExerciseCount,
        totalDurationMinutes: activeCompletedWorkout.totalDurationMinutes,
        source: 'mock',
      };

      const alreadyExists = currentLogs.some(
        (log) =>
          log.workoutId === nextLog.workoutId &&
          log.completedAt === nextLog.completedAt &&
          log.completedExerciseCount === nextLog.completedExerciseCount &&
          log.skippedExerciseCount === nextLog.skippedExerciseCount,
      );

      if (alreadyExists) {
        return currentLogs;
      }

      return [...currentLogs, nextLog];
    });

    setWorkoutFlow(null);
    setWorkoutRecap({
      workoutId: flow.workoutId,
      completionDate,
      completedExerciseCount: flow.completedExerciseCount,
      skippedExerciseCount: flow.skippedExerciseCount,
    });
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
        currentStep: 'rest',
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
        currentStep: 'exercise',
        currentExerciseIndex: currentFlow.currentExerciseIndex + 1,
      };
    });
  };

  const handleStartWorkout = (workoutId: string) => {
    setWorkoutRecap(null);
    setWorkoutFlow({
      workoutId,
      currentExerciseIndex: 0,
      currentStep: 'exercise',
      completedExerciseCount: 0,
      skippedExerciseCount: 0,
    });
  };

  const handleBackToHome = () => {
    setWorkoutRecap(null);
    setActiveTab('Home');
  };

  const handleOpenAddWorkout = () => {
    setWorkoutsView('add');
  };

  const handleBackToWorkouts = () => {
    setWorkoutsView('list');
  };

  const handleAddWorkout = (workout: MockWorkout) => {
    setWorkouts((currentWorkouts) => [...currentWorkouts, workout]);
    setWorkoutsView('list');
    setActiveTab('Home');
  };

  const handleSaveWeeklyPlan = (plan: MockWeeklyWorkoutPlan) => {
    setWeeklyWorkoutPlans((currentPlans) => {
      const plansWithoutWeek = currentPlans.filter(
        (currentPlan) => currentPlan.weekStartDate !== plan.weekStartDate,
      );

      return [...plansWithoutWeek, plan].sort((leftPlan, rightPlan) =>
        leftPlan.weekStartDate.localeCompare(rightPlan.weekStartDate),
      );
    });
  };

  const shouldHideNavbar = Boolean(workoutFlow || workoutRecap);

  let content = null;

  if (workoutFlow && activeWorkout) {
    content = (
      <StartWorkoutScreen
        workout={activeWorkout}
        currentExerciseIndex={workoutFlow.currentExerciseIndex}
        currentStep={workoutFlow.currentStep}
        restSecondsBetweenExercises={restSecondsBetweenExercises}
        onFinishExercise={() => advanceFromExercise(false)}
        onSkipExercise={() => advanceFromExercise(true)}
        onFinishRest={handleFinishRest}
      />
    );
  } else if (workoutRecap && recapWorkout) {
    content = (
      <WorkoutFinishedRecapScreen
        workoutTitle={recapWorkout.title}
        totalExercises={recapWorkout.exercises.length}
        completedExerciseCount={workoutRecap.completedExerciseCount}
        skippedExerciseCount={workoutRecap.skippedExerciseCount}
        completionDate={workoutRecap.completionDate}
        onBackToHome={handleBackToHome}
      />
    );
  } else if (activeTab === 'Home') {
    content = (
      <HomeScreen
        workoutLogs={workoutLogs}
        weeklyWorkoutPlans={weeklyWorkoutPlans}
        workouts={workouts}
        onStartWorkout={handleStartWorkout}
      />
    );
  } else if (activeTab === 'Workouts') {
    content =
      workoutsView === 'add' ? (
        <AddWorkoutScreen
          availableExercises={mockAvailableExercises}
          maxExercisesPerWorkout={maxExercisesPerWorkout}
          numberOfExercisesPerPage={numberOfExercisesPerPage}
          restSecondsBetweenExercises={restSecondsBetweenExercises}
          defaultRepsExerciseDurationMinutes={defaultRepsExerciseDurationMinutes}
          onBackToWorkouts={handleBackToWorkouts}
          onAddWorkout={handleAddWorkout}
        />
      ) : (
        <WorkoutsScreen
          restSecondsBetweenExercises={restSecondsBetweenExercises}
          workouts={workouts}
          onStartWorkout={handleStartWorkout}
          onOpenAddWorkout={handleOpenAddWorkout}
        />
      );
  } else if (activeTab === 'Schedule') {
    content = (
      <ScheduleScreen
        trainingDaysPerWeek={trainingDaysPerWeek}
        workouts={workouts}
        weeklyWorkoutPlans={weeklyWorkoutPlans}
        onSaveWeeklyPlan={handleSaveWeeklyPlan}
      />
    );
  } else {
    content = (
      <SettingsScreen
        restSecondsBetweenExercises={restSecondsBetweenExercises}
        onRestSecondsChange={setRestSecondsBetweenExercises}
        trainingDaysPerWeek={trainingDaysPerWeek}
        onTrainingDaysPerWeekChange={setTrainingDaysPerWeek}
        maxExercisesPerWorkout={maxExercisesPerWorkout}
        onMaxExercisesPerWorkoutChange={setMaxExercisesPerWorkout}
        numberOfExercisesPerPage={numberOfExercisesPerPage}
        onNumberOfExercisesPerPageChange={setNumberOfExercisesPerPage}
        defaultRepsExerciseDurationMinutes={defaultRepsExerciseDurationMinutes}
        onDefaultRepsExerciseDurationMinutesChange={setDefaultRepsExerciseDurationMinutes}
      />
    );
  }

  return (
    <View style={styles.appShell}>
      {content}
      {!shouldHideNavbar ? <BottomNavbar activeTab={activeTab} onTabPress={handleTabPress} /> : null}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
    backgroundColor: '#f4efe6',
  },
});
