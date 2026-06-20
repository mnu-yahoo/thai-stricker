import { Pressable, StyleSheet, Text, View } from "react-native";

import { GoogleMaterialSymbol } from "../icons/GoogleMaterialSymbol";
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
  const isDarkTheme = theme.name === "dark";

  const getIconName = (item: BottomNavTab) => {
    switch (item) {
      case "Home":
        return { name: "home", fallbackName: "home" as const };
      case "Workouts":
        return { name: "sports_martial_arts", fallbackName: "sports-kabaddi" as const };
      case "Schedule":
        return { name: "calendar_month", fallbackName: "calendar-month" as const };
      case "AI Coach":
        return { name: "smart_toy", fallbackName: "smart-toy" as const };
      case "Settings":
        return { name: "settings", fallbackName: "settings" as const };
    }
  };

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
              <GoogleMaterialSymbol
                color={
                  isActive
                    ? isDarkTheme
                      ? theme.colors.primary
                      : "#1560C8"
                    : isDarkTheme
                      ? theme.colors.navbarInactive
                      : "#486895"
                }
                fallbackName={getIconName(item).fallbackName}
                name={getIconName(item).name}
                size={18}
              />
              <Text
                numberOfLines={1}
                style={[styles.label, isActive ? styles.labelActive : undefined]}
              >
                {item}
              </Text>
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
      paddingHorizontal: isDarkTheme ? 12 : 0,
      paddingTop: 8,
      paddingBottom: isDarkTheme ? 14 : 0,
    },
    bar: {
      flexDirection: "row",
      backgroundColor: isDarkTheme ? "#17171A" : "#FFFFFF",
      borderRadius: isDarkTheme ? 24 : 0,
      borderTopWidth: 1,
      borderTopColor: isDarkTheme ? "#34363A" : "#D7E0EF",
      paddingHorizontal: isDarkTheme ? 6 : 14,
      paddingVertical: isDarkTheme ? 10 : 12,
      gap: isDarkTheme ? 4 : 2,
    },
    item: {
      flex: 1,
      minHeight: isDarkTheme ? 56 : 60,
      borderRadius: isDarkTheme ? 16 : 18,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 2,
      paddingVertical: isDarkTheme ? 10 : 8,
      gap: isDarkTheme ? 0 : 6,
    },
    itemActive: {
      backgroundColor: isDarkTheme ? "#18363C" : "#E7F0FF",
    },
    label: {
      color: isDarkTheme ? "#E6E0D4" : theme.colors.navbarInactive,
      fontSize: isDarkTheme ? 11 : 10,
      fontWeight: "800",
      letterSpacing: 0,
      textAlign: "center",
      flexShrink: 1,
      width: "100%",
    },
    labelActive: {
      color: isDarkTheme ? theme.colors.primary : "#1560C8",
    },
  });
}
