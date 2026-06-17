import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useState } from "react";

const REST_OPTIONS = [15, 30, 45, 60, 90, 120] as const;
const TRAINING_DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;
const THEME_OPTIONS = ["light", "dark"] as const;

type RestOption = (typeof REST_OPTIONS)[number];
type TrainingDayOption = (typeof TRAINING_DAY_OPTIONS)[number];
type ThemeOption = (typeof THEME_OPTIONS)[number];

function OptionGroup<T extends string | number>({
  options,
  selectedValue,
  onSelect,
  getLabel,
}: {
  options: readonly T[];
  selectedValue: T;
  onSelect: (value: T) => void;
  getLabel: (value: T) => string;
}) {
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
};

export function SettingsScreen({
  restSecondsBetweenExercises,
  onRestSecondsChange,
}: SettingsScreenProps) {
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<TrainingDayOption>(3);
  const [themePreference, setThemePreference] = useState<ThemeOption>("dark");

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
            />
          </View>

          <View style={styles.settingBlock}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingLabel}>Training days per week</Text>
              <Text style={styles.settingValue}>{trainingDaysPerWeek} days</Text>
            </View>
            <Text style={styles.settingHint}>This preference does not affect scheduling yet.</Text>
            <OptionGroup
              options={TRAINING_DAY_OPTIONS}
              selectedValue={trainingDaysPerWeek}
              onSelect={setTrainingDaysPerWeek}
              getLabel={(value) => `${value}`}
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
            <Text style={styles.settingHint}>This selector does not change the actual app theme yet.</Text>
            <OptionGroup
              options={THEME_OPTIONS}
              selectedValue={themePreference}
              onSelect={setThemePreference}
              getLabel={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
            />
          </View>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Scope note</Text>
          <Text style={styles.noteText}>
            Settings are local placeholders for now and are not applied to workouts or theme yet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4efe6",
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
    color: "#8b5e34",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    color: "#1f1f1f",
    fontSize: 34,
    fontWeight: "800",
  },
  subtitle: {
    color: "#5f5446",
    fontSize: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#fffaf3",
    borderRadius: 18,
    padding: 18,
    gap: 18,
    borderWidth: 1,
    borderColor: "#eadfce",
  },
  cardTitle: {
    color: "#231f1a",
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
    color: "#231f1a",
    fontSize: 16,
    fontWeight: "700",
  },
  settingValue: {
    color: "#8b5e34",
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  settingHint: {
    color: "#6b5f51",
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
    borderColor: "#c9b69b",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fffaf3",
  },
  optionButtonSelected: {
    backgroundColor: "#bf5b22",
    borderColor: "#bf5b22",
  },
  optionText: {
    color: "#5f5446",
    fontSize: 14,
    fontWeight: "700",
  },
  optionTextSelected: {
    color: "#fffaf3",
  },
  noteCard: {
    backgroundColor: "#1f3c36",
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  noteTitle: {
    color: "#eef7f1",
    fontSize: 18,
    fontWeight: "700",
  },
  noteText: {
    color: "#d7e8df",
    fontSize: 14,
    lineHeight: 21,
  },
});
