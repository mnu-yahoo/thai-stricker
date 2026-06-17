import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../../styles/theme";

const REST_OPTIONS = [15, 30, 45, 60, 90, 120] as const;
const TRAINING_DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;
const MAX_EXERCISES_OPTIONS = [6, 8, 10, 12, 14, 16, 18, 20] as const;
const NUMBER_OF_EXERCISES_PER_PAGE_OPTIONS = [4, 6, 8, 10] as const;
const DEFAULT_REPS_EXERCISE_DURATION_OPTIONS = [1, 2, 3, 4, 5] as const;
const THEME_OPTIONS = ["Light", "Dark"] as const;

type RestOption = (typeof REST_OPTIONS)[number];
export type TrainingDayOption = (typeof TRAINING_DAY_OPTIONS)[number];
export type MaxExercisesPerWorkoutOption = (typeof MAX_EXERCISES_OPTIONS)[number];
export type NumberOfExercisesPerPageOption =
  (typeof NUMBER_OF_EXERCISES_PER_PAGE_OPTIONS)[number];
export type DefaultRepsExerciseDurationOption =
  (typeof DEFAULT_REPS_EXERCISE_DURATION_OPTIONS)[number];
export type ThemePreferenceOption = (typeof THEME_OPTIONS)[number];

function OptionGroup<T extends string | number>({
  options,
  selectedValue,
  onSelect,
  getLabel,
  theme,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  getLabel: (value: T) => string;
  theme: AppTheme;
}) {
  const styles = getStyles(theme);

  return (
    <View style={styles.optionGroup}>
      {options.map((option) => {
        const isSelected = option === selectedValue;

        return (
          <Pressable
            key={String(option)}
            onPress={() => onSelect(option)}
            style={[styles.optionButton, isSelected ? styles.optionButtonSelected : undefined]}
          >
            <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : undefined]}>
              {getLabel(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type SettingsScreenProps = {
  restSecondsBetweenExercises: RestOption;
  onRestSecondsChange: (value: RestOption) => void;
  trainingDaysPerWeek: TrainingDayOption;
  onTrainingDaysPerWeekChange: (value: TrainingDayOption) => void;
  maxExercisesPerWorkout: MaxExercisesPerWorkoutOption;
  onMaxExercisesPerWorkoutChange: (value: MaxExercisesPerWorkoutOption) => void;
  numberOfExercisesPerPage: NumberOfExercisesPerPageOption;
  onNumberOfExercisesPerPageChange: (value: NumberOfExercisesPerPageOption) => void;
  defaultRepsExerciseDurationMinutes: DefaultRepsExerciseDurationOption;
  onDefaultRepsExerciseDurationMinutesChange: (
    value: DefaultRepsExerciseDurationOption,
  ) => void;
  themePreference: ThemePreferenceOption;
  onThemePreferenceChange: (value: ThemePreferenceOption) => void;
  theme: AppTheme;
};

export function SettingsScreen({
  restSecondsBetweenExercises,
  onRestSecondsChange,
  trainingDaysPerWeek,
  onTrainingDaysPerWeekChange,
  maxExercisesPerWorkout,
  onMaxExercisesPerWorkoutChange,
  numberOfExercisesPerPage,
  onNumberOfExercisesPerPageChange,
  defaultRepsExerciseDurationMinutes,
  onDefaultRepsExerciseDurationMinutesChange,
  themePreference,
  onThemePreferenceChange,
  theme,
}: SettingsScreenProps) {
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Personal preferences</Text>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Adjust your training preferences.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Training preferences</Text>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Rest time between exercises</Text>
              <Text style={styles.settingValue}>{restSecondsBetweenExercises} sec</Text>
            </View>
            <Text style={styles.settingHint}>
              Mocked app-level setting. Changing this updates the value shown in Workouts.
            </Text>
            <OptionGroup
              options={REST_OPTIONS}
              selectedValue={restSecondsBetweenExercises}
              onSelect={onRestSecondsChange}
              getLabel={(value) => `${value}s`}
              theme={theme}
            />
          </View>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Training days per week</Text>
              <Text style={styles.settingValue}>{trainingDaysPerWeek} days</Text>
            </View>
            <Text style={styles.settingHint}>
              Mocked app-level setting. Changing this updates the value shown in Schedule.
            </Text>
            <OptionGroup
              options={TRAINING_DAY_OPTIONS}
              selectedValue={trainingDaysPerWeek}
              onSelect={onTrainingDaysPerWeekChange}
              getLabel={(value) => `${value}`}
              theme={theme}
            />
          </View>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Maximum exercises per workout</Text>
              <Text style={styles.settingValue}>{maxExercisesPerWorkout} exercises</Text>
            </View>
            <Text style={styles.settingHint}>
              Defines the maximum number of exercises allowed when creating a workout. This
              setting will be used later by the Add Workout screen.
            </Text>
            <OptionGroup
              options={MAX_EXERCISES_OPTIONS}
              selectedValue={maxExercisesPerWorkout}
              onSelect={onMaxExercisesPerWorkoutChange}
              getLabel={(value) => `${value}`}
              theme={theme}
            />
          </View>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Number of Exercises per page</Text>
              <Text style={styles.settingValue}>{numberOfExercisesPerPage} exercises</Text>
            </View>
            <Text style={styles.settingHint}>
              Used later to control how many available exercises are shown per page.
            </Text>
            <OptionGroup
              options={NUMBER_OF_EXERCISES_PER_PAGE_OPTIONS}
              selectedValue={numberOfExercisesPerPage}
              onSelect={onNumberOfExercisesPerPageChange}
              getLabel={(value) => `${value}`}
              theme={theme}
            />
          </View>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>
                Default duration in minutes for reps exercises
              </Text>
              <Text style={styles.settingValue}>
                {defaultRepsExerciseDurationMinutes} minutes
              </Text>
            </View>
            <Text style={styles.settingHint}>
              Used later to estimate time for reps-based exercises.
            </Text>
            <OptionGroup
              options={DEFAULT_REPS_EXERCISE_DURATION_OPTIONS}
              selectedValue={defaultRepsExerciseDurationMinutes}
              onSelect={onDefaultRepsExerciseDurationMinutesChange}
              getLabel={(value) => `${value}`}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appearance</Text>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Theme preference</Text>
              <Text style={styles.settingValue}>{themePreference}</Text>
            </View>
            <Text style={styles.settingHint}>
              Select Light or Dark to apply the app theme immediately for this session.
            </Text>
            <OptionGroup
              options={THEME_OPTIONS}
              selectedValue={themePreference}
              onSelect={onThemePreferenceChange}
              getLabel={(value) => value}
              theme={theme}
            />
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Scope note</Text>
          <Text style={styles.noteText}>
            Settings are mocked placeholders for now, stored only for the current app session, and
            are not persisted yet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.appBackground,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 12,
      gap: 16,
    },
    header: {
      gap: 6,
    },
    eyebrow: {
      color: theme.colors.accent,
      fontSize: 13,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 22,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: 18,
      padding: 18,
      gap: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
    },
    settingBlock: {
      gap: 10,
    },
    settingHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    settingLabel: {
      flex: 1,
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "700",
    },
    settingValue: {
      color: theme.colors.accent,
      fontSize: 14,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    settingHint: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    optionGroup: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    optionButton: {
      minWidth: 58,
      minHeight: 42,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.inputBackground,
    },
    optionButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    optionTextSelected: {
      color: theme.colors.primaryText,
    },
    noteCard: {
      backgroundColor: theme.colors.cardElevated,
      borderRadius: 18,
      padding: 18,
      gap: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    noteTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
    },
    noteText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
  });
}
