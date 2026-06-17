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
  return StyleSheet.create({
    wrapper: {
    backgroundColor: theme.colors.appBackground,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: theme.colors.navbarBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 6,
    gap: 6,
  },
  item: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  itemActive: {
    backgroundColor: theme.colors.navbarActive,
  },
  label: {
    color: theme.colors.navbarInactive,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  labelActive: {
    color: theme.colors.primaryText,
  },
  });
}
