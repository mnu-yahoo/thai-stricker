import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
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
  onResetWorkoutsAndExercises: () => void;
  onImportWorkouts: () => void;
  theme: AppTheme;
};

function clampToOptions<T extends readonly number[]>(
  options: T,
  currentValue: T[number],
  direction: -1 | 1,
): T[number] {
  const currentIndex = options.indexOf(currentValue);
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), options.length - 1);

  return options[nextIndex];
}

function SegmentedControl<T extends string | number>({
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
    <View style={styles.lightSegmentedWrap}>
      {options.map((option) => {
        const isSelected = option === selectedValue;

        return (
          <Pressable
            key={String(option)}
            onPress={() => onSelect(option)}
            style={[
              styles.lightSegmentButton,
              isSelected ? styles.lightSegmentButtonSelected : undefined,
            ]}
          >
            <Text
              style={[
                styles.lightSegmentButtonText,
                isSelected ? styles.lightSegmentButtonTextSelected : undefined,
              ]}
            >
              {getLabel(option)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function StepperControl<T extends number>({
  value,
  onDecrease,
  onIncrease,
  displayValue,
  theme,
}: {
  value: T;
  onDecrease: () => void;
  onIncrease: () => void;
  displayValue: string;
  theme: AppTheme;
}) {
  const styles = getStyles(theme);

  return (
    <View style={styles.lightStepper}>
      <Pressable onPress={onDecrease} style={styles.lightStepperButton}>
        <Text style={styles.lightStepperButtonText}>−</Text>
      </Pressable>
      <Text style={styles.lightStepperValue}>{displayValue}</Text>
      <Pressable onPress={onIncrease} style={styles.lightStepperButton}>
        <Text style={styles.lightStepperButtonText}>+</Text>
      </Pressable>
    </View>
  );
}

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
  onResetWorkoutsAndExercises,
  onImportWorkouts,
  theme,
}: SettingsScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <>
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

            <View style={styles.header}>
              <Text style={styles.eyebrow}>Private coaching app</Text>
              <Text style={styles.title}>SETTINGS</Text>
              <Text style={styles.subtitle}>
                Adjust your training preferences for this session.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Training preferences</Text>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="tune"
                  name="tune"
                  size={18}
                />
              </View>

              <View style={styles.settingBlock}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Rest time between exercises</Text>
                  <Text style={styles.settingValue}>{restSecondsBetweenExercises} sec</Text>
                </View>
                <Text style={styles.settingHint}>
                  Changing this updates the rest interval used across your workouts.
                </Text>
                <View style={styles.optionGroup}>
                  {REST_OPTIONS.map((value) => {
                    const isSelected = value === restSecondsBetweenExercises;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => onRestSecondsChange(value)}
                        style={[
                          styles.optionButton,
                          isSelected ? styles.optionButtonSelected : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.optionTextSelected : undefined,
                          ]}
                        >
                          {value}s
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingBlock}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Training days per week</Text>
                  <Text style={styles.settingValue}>{trainingDaysPerWeek} days</Text>
                </View>
                <Text style={styles.settingHint}>
                  Changing this updates the weekly workout planning target.
                </Text>
                <View style={styles.optionGroup}>
                  {TRAINING_DAY_OPTIONS.map((value) => {
                    const isSelected = value === trainingDaysPerWeek;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => onTrainingDaysPerWeekChange(value)}
                        style={[
                          styles.optionButton,
                          isSelected ? styles.optionButtonSelected : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.optionTextSelected : undefined,
                          ]}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingBlock}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Maximum exercises per workout</Text>
                  <Text style={styles.settingValue}>{maxExercisesPerWorkout} exercises</Text>
                </View>
                <Text style={styles.settingHint}>
                  Defines the maximum number of exercises allowed when creating a workout.
                </Text>
                <View style={styles.optionGroup}>
                  {MAX_EXERCISES_OPTIONS.map((value) => {
                    const isSelected = value === maxExercisesPerWorkout;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => onMaxExercisesPerWorkoutChange(value)}
                        style={[
                          styles.optionButton,
                          isSelected ? styles.optionButtonSelected : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.optionTextSelected : undefined,
                          ]}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingBlock}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Number of exercises per page</Text>
                  <Text style={styles.settingValue}>{numberOfExercisesPerPage} exercises</Text>
                </View>
                <Text style={styles.settingHint}>
                  Used later to control how many available exercises are shown per page.
                </Text>
                <View style={styles.optionGroup}>
                  {NUMBER_OF_EXERCISES_PER_PAGE_OPTIONS.map((value) => {
                    const isSelected = value === numberOfExercisesPerPage;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => onNumberOfExercisesPerPageChange(value)}
                        style={[
                          styles.optionButton,
                          isSelected ? styles.optionButtonSelected : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.optionTextSelected : undefined,
                          ]}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.settingBlock}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Default reps exercise duration</Text>
                  <Text style={styles.settingValue}>
                    {defaultRepsExerciseDurationMinutes} min
                  </Text>
                </View>
                <Text style={styles.settingHint}>
                  Used later to estimate time for reps-based exercises.
                </Text>
                <View style={styles.optionGroup}>
                  {DEFAULT_REPS_EXERCISE_DURATION_OPTIONS.map((value) => {
                    const isSelected = value === defaultRepsExerciseDurationMinutes;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => onDefaultRepsExerciseDurationMinutesChange(value)}
                        style={[
                          styles.optionButton,
                          isSelected ? styles.optionButtonSelected : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.optionTextSelected : undefined,
                          ]}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Appearance</Text>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="palette"
                  name="palette"
                  size={18}
                />
              </View>

              <View style={styles.settingBlock}>
                <View style={styles.settingHeader}>
                  <Text style={styles.settingLabel}>Theme preference</Text>
                  <Text style={styles.settingValue}>{themePreference}</Text>
                </View>
                <Text style={styles.settingHint}>
                  Select Light or Dark to apply the app theme immediately for this session.
                </Text>
                <View style={styles.optionGroup}>
                  {THEME_OPTIONS.map((value) => {
                    const isSelected = value === themePreference;

                    return (
                      <Pressable
                        key={value}
                        onPress={() => onThemePreferenceChange(value)}
                        style={[
                          styles.optionButton,
                          isSelected ? styles.optionButtonSelected : undefined,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected ? styles.optionTextSelected : undefined,
                          ]}
                        >
                          {value}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            <View style={styles.noteCard}>
              <Text style={styles.noteTitle}>Scope note</Text>
              <Text style={styles.noteText}>
                Settings are stored locally on this device and persist across app reloads.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>DB Section</Text>
                <GoogleMaterialSymbol
                  color={theme.colors.primary}
                  fallbackName="dataset"
                  name="dataset"
                  size={18}
                />
              </View>

              <Text style={styles.settingHint}>
                Manage local SQLite workout data and import workout JSON files from the device.
              </Text>

              <Pressable onPress={onImportWorkouts} style={styles.dbPrimaryButton}>
                <Text style={styles.dbPrimaryButtonText}>Import Workouts</Text>
              </Pressable>

              <Pressable onPress={onResetWorkoutsAndExercises} style={styles.dbDangerButton}>
                <Text style={styles.dbDangerButtonText}>Reset Workouts and Exercises</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <View style={styles.lightTopBar}>
              <Pressable style={styles.lightIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="arrow-back"
                  name="arrow_back"
                  size={24}
                />
              </Pressable>
              <Text style={styles.lightTopTitle}>Settings</Text>
              <Pressable style={styles.lightIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="notifications-none"
                  name="notifications"
                  size={24}
                />
              </Pressable>
            </View>

            <View style={styles.lightProfileCard}>
              <View style={styles.lightProfileAvatar} />
              <View style={styles.lightProfileCopy}>
                <Text style={styles.lightProfileName}>Alex Rivera</Text>
                <Text style={styles.lightProfileRole}>PRO-AM PRACTITIONER</Text>
              </View>
            </View>

            <View style={styles.lightSection}>
              <View style={styles.lightSectionTitleRow}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="sports-kabaddi"
                  name="sports_martial_arts"
                  size={22}
                />
                <Text style={styles.lightSectionTitle}>Workout Preferences</Text>
              </View>

              <View style={styles.lightSettingBlock}>
                <View style={styles.lightSettingHeader}>
                  <Text style={styles.lightSettingName}>Rest time</Text>
                  <Text style={styles.lightSettingInlineValue}>{restSecondsBetweenExercises}s</Text>
                </View>
                <Text style={styles.lightSettingHint}>Time to recover between rounds</Text>
                <SegmentedControl
                  options={[30, 60, 90] as const}
                  selectedValue={
                    [30, 60, 90].includes(restSecondsBetweenExercises)
                      ? (restSecondsBetweenExercises as 30 | 60 | 90)
                      : 60
                  }
                  onSelect={(value) => onRestSecondsChange(value)}
                  getLabel={(value) => `${value}s`}
                  theme={theme}
                />
              </View>

              <View style={styles.lightDivider} />

              <View style={styles.lightSettingBlock}>
                <View style={styles.lightCompactHeader}>
                  <View>
                    <Text style={styles.lightSettingName}>Training days</Text>
                    <Text style={styles.lightSettingHint}>Per week schedule</Text>
                  </View>
                  <StepperControl
                    value={trainingDaysPerWeek}
                    onDecrease={() =>
                      onTrainingDaysPerWeekChange(
                        clampToOptions(TRAINING_DAY_OPTIONS, trainingDaysPerWeek, -1),
                      )
                    }
                    onIncrease={() =>
                      onTrainingDaysPerWeekChange(
                        clampToOptions(TRAINING_DAY_OPTIONS, trainingDaysPerWeek, 1),
                      )
                    }
                    displayValue={`${trainingDaysPerWeek}`}
                    theme={theme}
                  />
                </View>
              </View>

              <View style={styles.lightDivider} />

              <View style={styles.lightSettingBlock}>
                <View style={styles.lightCompactHeader}>
                  <View>
                    <Text style={styles.lightSettingName}>Max exercises</Text>
                    <Text style={styles.lightSettingHint}>Limit per session</Text>
                  </View>
                  <StepperControl
                    value={maxExercisesPerWorkout}
                    onDecrease={() =>
                      onMaxExercisesPerWorkoutChange(
                        clampToOptions(MAX_EXERCISES_OPTIONS, maxExercisesPerWorkout, -1),
                      )
                    }
                    onIncrease={() =>
                      onMaxExercisesPerWorkoutChange(
                        clampToOptions(MAX_EXERCISES_OPTIONS, maxExercisesPerWorkout, 1),
                      )
                    }
                    displayValue={`${maxExercisesPerWorkout}`}
                    theme={theme}
                  />
                </View>
              </View>

              <View style={styles.lightDivider} />

              <View style={styles.lightSettingBlock}>
                <View style={styles.lightSettingHeader}>
                  <Text style={styles.lightSettingName}>Exercises per page</Text>
                  <Text style={styles.lightSettingInlineValue}>{numberOfExercisesPerPage}</Text>
                </View>
                <SegmentedControl
                  options={[4, 10, 8] as const}
                  selectedValue={
                    [4, 10, 8].includes(numberOfExercisesPerPage)
                      ? (numberOfExercisesPerPage as 4 | 10 | 8)
                      : 10
                  }
                  onSelect={(value) => onNumberOfExercisesPerPageChange(value)}
                  getLabel={(value) => `${value}`}
                  theme={theme}
                />
              </View>

              <View style={styles.lightDivider} />

              <View style={styles.lightSettingBlock}>
                <View style={styles.lightCompactHeader}>
                  <View>
                    <Text style={styles.lightSettingName}>Reps duration</Text>
                    <Text style={styles.lightSettingHint}>
                      Estimated time for
                      {"\n"}
                      rep-based drills
                    </Text>
                  </View>
                  <StepperControl
                    value={defaultRepsExerciseDurationMinutes}
                    onDecrease={() =>
                      onDefaultRepsExerciseDurationMinutesChange(
                        clampToOptions(
                          DEFAULT_REPS_EXERCISE_DURATION_OPTIONS,
                          defaultRepsExerciseDurationMinutes,
                          -1,
                        ),
                      )
                    }
                    onIncrease={() =>
                      onDefaultRepsExerciseDurationMinutesChange(
                        clampToOptions(
                          DEFAULT_REPS_EXERCISE_DURATION_OPTIONS,
                          defaultRepsExerciseDurationMinutes,
                          1,
                        ),
                      )
                    }
                    displayValue={`${defaultRepsExerciseDurationMinutes * 12}s`}
                    theme={theme}
                  />
                </View>
              </View>
            </View>

            <View style={styles.lightSection}>
              <View style={styles.lightSectionTitleRow}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="palette"
                  name="palette"
                  size={22}
                />
                <Text style={styles.lightSectionTitle}>Appearance</Text>
              </View>

              <View style={styles.lightPanelCard}>
                <SegmentedControl
                  options={THEME_OPTIONS}
                  selectedValue={themePreference}
                  onSelect={onThemePreferenceChange}
                  getLabel={(value) => value}
                  theme={theme}
                />
              </View>
            </View>

            <View style={styles.lightSection}>
              <View style={styles.lightSectionTitleRow}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="smart-toy"
                  name="smart_toy"
                  size={22}
                />
                <Text style={styles.lightSectionTitle}>Coaching</Text>
              </View>

              <View style={styles.lightPanelCard}>
                <View style={styles.lightToggleRow}>
                  <View style={styles.lightToggleCopy}>
                    <Text style={styles.lightSettingName}>AI Coach Feedback</Text>
                    <Text style={styles.lightSettingHint}>
                      Real-time technique corrections
                    </Text>
                  </View>
                  <View style={styles.lightToggleTrack}>
                    <View style={styles.lightToggleThumb} />
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.lightSection}>
              <View style={styles.lightSectionTitleRow}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="dataset"
                  name="dataset"
                  size={22}
                />
                <Text style={styles.lightSectionTitle}>DB Section</Text>
              </View>

              <View style={styles.lightPanelCard}>
                <Text style={styles.lightSettingHint}>
                  Import local workout JSON files or clear all workouts and exercises from SQLite.
                </Text>

                <View style={styles.lightDbActions}>
                  <Pressable onPress={onImportWorkouts} style={styles.lightPrimaryButton}>
                    <Text style={styles.lightPrimaryButtonText}>Import Workouts</Text>
                  </Pressable>

                  <Pressable
                    onPress={onResetWorkoutsAndExercises}
                    style={styles.lightDangerButton}
                  >
                    <Text style={styles.lightDangerButtonText}>
                      Reset Workouts and Exercises
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? theme.colors.appBackground : "#F7F3F0",
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 24,
      gap: 24,
    },
    darkTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 6,
      marginBottom: 8,
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
    header: {
      gap: 6,
    },
    eyebrow: {
      color: theme.colors.primary,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
      letterSpacing: -0.8,
      textTransform: "uppercase",
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
      gap: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      elevation: isDarkTheme ? 2 : 0,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    cardTitle: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: "700",
      textTransform: isDarkTheme ? "uppercase" : "none",
    },
    settingBlock: {
      gap: 10,
      paddingTop: 2,
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
      color: isDarkTheme ? theme.colors.primary : theme.colors.accent,
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
      borderColor: "#3F4D52",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#1A191C",
    },
    optionButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionText: {
      color: theme.colors.textPrimary,
      fontSize: 14,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    optionTextSelected: {
      color: theme.colors.primaryText,
    },
    noteCard: {
      backgroundColor: "#1A191C",
      borderRadius: 18,
      padding: 18,
      gap: 8,
      borderWidth: 1,
      borderColor: "#3F4D52",
    },
    noteTitle: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    noteText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 21,
    },
    dbPrimaryButton: {
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    dbPrimaryButtonText: {
      color: theme.colors.primaryText,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    dbDangerButton: {
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.danger,
      backgroundColor: isDarkTheme ? "#24191C" : theme.colors.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    dbDangerButtonText: {
      color: theme.colors.danger,
      fontSize: 14,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      textAlign: "center",
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: "#CFD8EA",
      marginBottom: 4,
    },
    lightIconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopTitle: {
      flex: 1,
      color: "#1560C8",
      fontSize: 24,
      fontWeight: "700",
      marginLeft: 12,
    },
    lightProfileCard: {
      minHeight: 126,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#FFFFFF",
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      paddingHorizontal: 22,
    },
    lightProfileAvatar: {
      width: 72,
      height: 72,
      borderRadius: 16,
      backgroundColor: "#102226",
      borderWidth: 2,
      borderColor: "#1560C8",
    },
    lightProfileCopy: {
      gap: 4,
    },
    lightProfileName: {
      color: "#151515",
      fontSize: 22,
      fontWeight: "700",
    },
    lightProfileRole: {
      color: "#24344D",
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    lightSection: {
      gap: 14,
    },
    lightSectionTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    lightSectionTitle: {
      color: "#1560C8",
      fontSize: 22,
      fontWeight: "700",
    },
    lightSettingBlock: {
      gap: 10,
    },
    lightSettingHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    lightCompactHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    },
    lightSettingName: {
      color: "#151515",
      fontSize: 17,
      fontWeight: "700",
    },
    lightSettingHint: {
      color: "#394B65",
      fontSize: 14,
      lineHeight: 20,
    },
    lightSettingInlineValue: {
      color: "#1560C8",
      fontSize: 15,
      fontWeight: "700",
    },
    lightDivider: {
      height: 1,
      backgroundColor: "#D9E0EC",
    },
    lightSegmentedWrap: {
      flexDirection: "row",
      borderRadius: 8,
      backgroundColor: "#ECE7E4",
      padding: 4,
      gap: 4,
    },
    lightSegmentButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    lightSegmentButtonSelected: {
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#C5D1E5",
      shadowColor: "#000000",
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    lightSegmentButtonText: {
      color: "#151515",
      fontSize: 15,
      fontWeight: "500",
    },
    lightSegmentButtonTextSelected: {
      color: "#1560C8",
      fontWeight: "700",
    },
    lightStepper: {
      minWidth: 186,
      minHeight: 48,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#F6F2EF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      gap: 12,
    },
    lightStepperButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#D7E0EF",
      alignItems: "center",
      justifyContent: "center",
    },
    lightStepperButtonText: {
      color: "#1560C8",
      fontSize: 20,
      fontWeight: "500",
      lineHeight: 22,
    },
    lightStepperValue: {
      color: "#151515",
      fontSize: 20,
      fontWeight: "800",
    },
    lightPanelCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "#C5D1E5",
      backgroundColor: "#FFFFFF",
      padding: 14,
      gap: 14,
    },
    lightDbActions: {
      gap: 12,
    },
    lightPrimaryButton: {
      minHeight: 48,
      borderRadius: 12,
      backgroundColor: "#1560C8",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    lightPrimaryButtonText: {
      color: "#FFFFFF",
      fontSize: 15,
      fontWeight: "700",
    },
    lightDangerButton: {
      minHeight: 48,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#D34A4A",
      backgroundColor: "#FFF3F1",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    lightDangerButtonText: {
      color: "#B33535",
      fontSize: 15,
      fontWeight: "700",
      textAlign: "center",
    },
    lightToggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
    },
    lightToggleCopy: {
      flex: 1,
      gap: 4,
    },
    lightToggleTrack: {
      width: 54,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#1E6FE2",
      justifyContent: "center",
      paddingHorizontal: 3,
      alignItems: "flex-end",
    },
    lightToggleThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: "#FFFFFF",
    },
  });
}
