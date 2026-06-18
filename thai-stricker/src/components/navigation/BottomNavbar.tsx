import { Pressable, StyleSheet, Text, View } from "react-native";

import type { AppTheme } from "../../styles/theme";

const NAV_ITEMS = ["Home", "Workouts", "Schedule", "AI Coach", "Settings"] as const;

export type BottomNavTab = (typeof NAV_ITEMS)[number];

type BottomNavbarProps = {
  activeTab: BottomNavTab;
  onTabPress: (tab: BottomNavTab) => void;
  theme: AppTheme;
};

export function BottomNavbar({ activeTab, onTabPress, theme }: BottomNavbarProps) {
  const styles = getStyles(theme);

  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        {NAV_ITEMS.map((item) => {
          const isActive = item === activeTab;

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              onPress={() => onTabPress(item)}
              style={[styles.item, isActive ? styles.itemActive : undefined]}
            >
              <Text style={[styles.label, isActive ? styles.labelActive : undefined]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function getStyles(theme: AppTheme) {
  const isDarkTheme = theme.name === "dark";

  return StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.appBackground,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 14,
    },
    bar: {
      flexDirection: "row",
      backgroundColor: isDarkTheme ? "#17171A" : theme.colors.navbarBackground,
      borderRadius: 24,
      borderTopWidth: 1,
      borderTopColor: isDarkTheme ? "#34363A" : theme.colors.border,
      paddingHorizontal: 6,
      paddingVertical: 10,
      gap: 4,
    },
    item: {
      flex: 1,
      minHeight: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 2,
      paddingVertical: 10,
    },
    itemActive: {
      backgroundColor: isDarkTheme ? "#18363C" : theme.colors.navbarActive,
    },
    label: {
      color: isDarkTheme ? "#E6E0D4" : theme.colors.navbarInactive,
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 0.2,
      textAlign: "center",
      flexShrink: 1,
    },
    labelActive: {
      color: isDarkTheme ? theme.colors.primary : theme.colors.primaryText,
    },
  });
}
