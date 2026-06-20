import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { BottomNavbar } from "../../components/navigation/BottomNavbar";
import { GoogleMaterialSymbol } from "../../components/icons/GoogleMaterialSymbol";
import type { AppTheme } from "../../styles/theme";

type WorkoutFinishedRecapScreenProps = {
  theme: AppTheme;
  workoutTitle: string;
  totalExercises: number;
  completedExerciseCount: number;
  skippedExerciseCount: number;
  completionDate: string;
  onBackToHome: () => void;
};

function formatDisplayDate(completionDate: string) {
  const [year, month, day] = completionDate.split("-");
  const monthLabels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthIndex = Number(month) - 1;

  if (!year || Number.isNaN(monthIndex) || !day || monthIndex < 0 || monthIndex > 11) {
    return completionDate;
  }

  return `${monthLabels[monthIndex]} ${Number(day)}, ${year}`;
}

export function WorkoutFinishedRecapScreen({
  theme,
  workoutTitle,
  totalExercises,
  completedExerciseCount,
  skippedExerciseCount,
  completionDate,
  onBackToHome,
}: WorkoutFinishedRecapScreenProps) {
  const styles = getStyles(theme);
  const isDarkTheme = theme.name === "dark";
  const completedOrSkipped = completedExerciseCount + skippedExerciseCount;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isDarkTheme ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Workout complete</Text>
              <Text style={styles.workoutTitle}>{workoutTitle.toUpperCase()}</Text>
            </View>

            <View style={styles.completionMarkWrap}>
              <View style={styles.completionRing}>
                <View style={styles.completionBadge}>
                  <GoogleMaterialSymbol
                    color={theme.colors.primary}
                    fallbackName="check-circle"
                    name="check_circle"
                    size={36}
                  />
                </View>
              </View>
            </View>

            <View style={styles.summaryPanel}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryHeaderText}>Session summary</Text>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{formatDisplayDate(completionDate)}</Text>
                </View>
              </View>

              <View style={styles.totalRow}>
                <View style={styles.totalLabelRow}>
                  <GoogleMaterialSymbol
                    color={theme.colors.textPrimary}
                    fallbackName="list-alt"
                    name="list_alt"
                    size={18}
                  />
                  <Text style={styles.totalLabel}>Total Exercises</Text>
                </View>
                <Text style={styles.totalValue}>{totalExercises}</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Completed</Text>
                  <Text style={[styles.statValue, styles.statValuePrimary]}>
                    {completedExerciseCount}
                  </Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statLabel}>Skipped</Text>
                  <Text style={[styles.statValue, styles.statValueSecondary]}>
                    {skippedExerciseCount}
                  </Text>
                </View>
              </View>

              <Text style={styles.summaryMeta}>
                Completed or skipped: {completedOrSkipped} / {totalExercises}
              </Text>
            </View>

            <Pressable onPress={onBackToHome} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Back</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.lightTopBar}>
              <Pressable onPress={onBackToHome} style={styles.lightTopIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="close"
                  name="close"
                  size={26}
                />
              </Pressable>
              <Text style={styles.lightTopTitle}>WORKOUT COMPLETE</Text>
              <Pressable style={styles.lightTopIconButton}>
                <GoogleMaterialSymbol
                  color="#1560C8"
                  fallbackName="more-vert"
                  name="more_vert"
                  size={24}
                />
              </Pressable>
            </View>

            <View style={styles.lightHeroSection}>
              <View style={styles.lightTrophyFrame}>
                <View style={styles.lightTrophyPanel}>
                  <GoogleMaterialSymbol
                    color="#EAF1FF"
                    fallbackName="emoji-events"
                    name="emoji_events"
                    size={86}
                  />
                </View>
              </View>
              <Text style={styles.lightHeadline}>Great Work!</Text>
              <Text style={styles.lightWorkoutName}>{workoutTitle}</Text>
            </View>

            <View style={styles.lightSummaryPanel}>
              <View style={styles.lightDateRow}>
                <Text style={styles.lightDateLabel}>Date</Text>
                <Text style={styles.lightDateValue}>{formatDisplayDate(completionDate)}</Text>
              </View>

              <View style={styles.lightDivider} />

              <View style={styles.lightStatsGrid}>
                <View style={styles.lightStatCardNeutral}>
                  <Text style={styles.lightStatNumberPrimary}>{totalExercises}</Text>
                  <Text style={styles.lightStatCaption}>Total Drills</Text>
                </View>

                <View style={styles.lightStatCardBlue}>
                  <Text style={styles.lightStatNumberBlue}>{completedExerciseCount}</Text>
                  <Text style={styles.lightStatCaption}>Completed</Text>
                </View>
              </View>

              <View style={styles.lightSkippedPanel}>
                <View style={styles.lightSkippedLabelRow}>
                  <GoogleMaterialSymbol
                    color="#8B6200"
                    fallbackName="error-outline"
                    name="error"
                    size={24}
                  />
                  <Text style={styles.lightSkippedLabel}>Skipped Exercises</Text>
                </View>
                <Text style={styles.lightSkippedValue}>
                  {skippedExerciseCount} {skippedExerciseCount === 1 ? "Exercise" : "Exercises"}
                </Text>
              </View>

              <View style={styles.lightOverviewBox}>
                <Text style={styles.lightOverviewText}>
                  Completed or skipped: {completedOrSkipped} / {totalExercises}
                </Text>
              </View>
            </View>

            <Pressable onPress={onBackToHome} style={styles.lightPrimaryButton}>
              <GoogleMaterialSymbol
                color="#FFFFFF"
                fallbackName="home"
                name="home"
                size={24}
              />
              <Text style={styles.lightPrimaryButtonText}>Return Home</Text>
            </Pressable>
          </>
        )}
      </ScrollView>

      {!isDarkTheme ? (
        <View style={styles.navbarDock}>
          <BottomNavbar activeTab="Workouts" onTabPress={() => {}} theme={theme} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
    },
    content: {
      flexGrow: 1,
      paddingHorizontal: isDarkTheme ? 8 : 20,
      paddingTop: 24,
      paddingBottom: isDarkTheme ? 28 : 126,
      gap: 28,
      backgroundColor: isDarkTheme ? "#141416" : "#F7F3F0",
    },
    header: {
      alignItems: "center",
      gap: 8,
    },
    title: {
      color: theme.colors.primary,
      fontSize: 30,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      textShadowColor: "rgba(0, 240, 255, 0.25)",
      textShadowRadius: 12,
    },
    workoutTitle: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2.4,
    },
    completionMarkWrap: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
    },
    completionRing: {
      width: 166,
      height: 166,
      borderRadius: 83,
      borderWidth: 5,
      borderColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 6,
    },
    completionBadge: {
      width: 74,
      height: 74,
      borderRadius: 37,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#17191C",
    },
    summaryPanel: {
      borderWidth: 1,
      borderColor: "#253137",
      borderStyle: "dashed",
      padding: 16,
      gap: 14,
      backgroundColor: "#141416",
    },
    summaryHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    summaryHeaderText: {
      color: theme.colors.textPrimary,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.8,
    },
    dateBadge: {
      borderWidth: 1,
      borderColor: "#334149",
      paddingHorizontal: 10,
      paddingVertical: 6,
      backgroundColor: "#16181B",
    },
    dateBadgeText: {
      color: theme.colors.textPrimary,
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    totalRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#212124",
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 12,
    },
    totalLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    totalLabel: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: "500",
    },
    totalValue: {
      color: theme.colors.textPrimary,
      fontSize: 34,
      fontWeight: "800",
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: "#212124",
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 8,
    },
    statLabel: {
      color: "#6F7780",
      fontSize: 11,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    statValue: {
      fontSize: 36,
      fontWeight: "800",
    },
    statValuePrimary: {
      color: theme.colors.primary,
    },
    statValueSecondary: {
      color: "#F1A4A4",
    },
    summaryMeta: {
      color: theme.colors.textSecondary,
      fontSize: 13,
      lineHeight: 19,
    },
    primaryButton: {
      marginTop: "auto",
      minHeight: 72,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.22,
      shadowRadius: 14,
      elevation: 4,
    },
    primaryButtonText: {
      color: "#05282B",
      fontSize: 20,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    lightTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    lightTopIconButton: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },
    lightTopTitle: {
      color: "#1560C8",
      fontSize: 24,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    lightHeroSection: {
      alignItems: "center",
      gap: 10,
    },
    lightTrophyFrame: {
      width: 328,
      height: 328,
      borderRadius: 24,
      backgroundColor: "#E8F0FD",
      alignItems: "center",
      justifyContent: "center",
    },
    lightTrophyPanel: {
      width: 296,
      height: 296,
      borderRadius: 22,
      backgroundColor: "#2A73E2",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#2A73E2",
      shadowOpacity: 0.18,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    lightHeadline: {
      color: "#1560C8",
      fontSize: 34,
      fontWeight: "900",
      textAlign: "center",
      marginTop: 4,
    },
    lightWorkoutName: {
      color: "#6C7280",
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
    },
    lightSummaryPanel: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#C8D3E7",
      backgroundColor: "#FFFFFF",
      padding: 18,
      gap: 18,
    },
    lightDateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    lightDateLabel: {
      color: "#24344D",
      fontSize: 16,
      fontWeight: "500",
    },
    lightDateValue: {
      color: "#151515",
      fontSize: 16,
      fontWeight: "500",
    },
    lightDivider: {
      height: 1,
      backgroundColor: "#E6E1DE",
    },
    lightStatsGrid: {
      flexDirection: "row",
      gap: 14,
    },
    lightStatCardNeutral: {
      flex: 1,
      minHeight: 150,
      borderRadius: 8,
      backgroundColor: "#F1EEEB",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 14,
    },
    lightStatCardBlue: {
      flex: 1,
      minHeight: 150,
      borderRadius: 8,
      backgroundColor: "#BDD3FA",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 14,
    },
    lightStatNumberPrimary: {
      color: "#1560C8",
      fontSize: 56,
      fontWeight: "900",
      lineHeight: 62,
    },
    lightStatNumberBlue: {
      color: "#4A6692",
      fontSize: 56,
      fontWeight: "900",
      lineHeight: 62,
    },
    lightStatCaption: {
      color: "#374457",
      fontSize: 15,
      fontWeight: "500",
      letterSpacing: 1.6,
    },
    lightSkippedPanel: {
      borderRadius: 8,
      backgroundColor: "#F4F0ED",
      paddingHorizontal: 18,
      paddingVertical: 18,
      gap: 8,
    },
    lightSkippedLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    lightSkippedLabel: {
      color: "#3C4350",
      fontSize: 17,
      fontWeight: "500",
    },
    lightSkippedValue: {
      color: "#8B6200",
      fontSize: 18,
      fontWeight: "700",
      marginLeft: 36,
    },
    lightOverviewBox: {
      borderRadius: 8,
      backgroundColor: "#F8FAFE",
      borderWidth: 1,
      borderColor: "#D8E2F2",
      paddingHorizontal: 14,
      paddingVertical: 14,
    },
    lightOverviewText: {
      color: "#415471",
      fontSize: 15,
      lineHeight: 22,
    },
    lightPrimaryButton: {
      minHeight: 83,
      borderRadius: 14,
      backgroundColor: "#2A73E2",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 12,
      shadowColor: "#2A73E2",
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    lightPrimaryButtonText: {
      color: "#FFFFFF",
      fontSize: 22,
      fontWeight: "800",
    },
    navbarDock: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "#F7F3F0",
    },
  });
}
