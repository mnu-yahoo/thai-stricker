import { Pressable, StyleSheet, Text, View } from "react-native";

const NAV_ITEMS = ["Home", "Workouts", "Schedule", "AI Coach", "Settings"] as const;

export type BottomNavTab = (typeof NAV_ITEMS)[number];

type BottomNavbarProps = {
  activeTab: BottomNavTab;
  onTabPress: (tab: BottomNavTab) => void;
};

export function BottomNavbar({ activeTab, onTabPress }: BottomNavbarProps) {
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

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#f4efe6",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  bar: {
    flexDirection: "row",
    backgroundColor: "#fffaf3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eadfce",
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
    backgroundColor: "#bf5b22",
  },
  label: {
    color: "#6b5f51",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  labelActive: {
    color: "#fffaf3",
  },
});
