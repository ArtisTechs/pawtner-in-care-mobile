import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type EventsTabKey = "events" | "local";

type EventsTabsProps = {
  activeTab: EventsTabKey;
  onChangeTab: (tab: EventsTabKey) => void;
  rightAccessory?: React.ReactNode;
};

const TABS: { key: EventsTabKey; label: string }[] = [
  { key: "events", label: "Events" },
  { key: "local", label: "Local Events" },
];

export function EventsTabs({
  activeTab,
  onChangeTab,
  rightAccessory,
}: EventsTabsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.tabsWrap}>
        {TABS.map((tab) => {
          const selected = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => onChangeTab(tab.key)}
              style={({ pressed }) => [
                styles.tabButton,
                pressed && styles.tabButtonPressed,
              ]}
            >
              <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabUnderline,
                  selected && styles.tabUnderlineSelected,
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {rightAccessory ? <View style={styles.rightAccessory}>{rightAccessory}</View> : null}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    tabsWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 22,
      paddingTop: 2,
    },
    tabButton: {
      alignItems: "flex-start",
    },
    tabButtonPressed: {
      opacity: 0.84,
    },
    tabLabel: {
      fontFamily: RoundedFontFamily,
      color: "rgba(42, 102, 171, 0.4)",
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
    },
    tabLabelSelected: {
      color: colors.dashboardBottomIconActive,
    },
    tabUnderline: {
      marginTop: 4,
      width: "100%",
      height: 6,
      borderRadius: 999,
      backgroundColor: "transparent",
    },
    tabUnderlineSelected: {
      backgroundColor: "#93BEEB",
    },
    rightAccessory: {
      alignItems: "flex-end",
      justifyContent: "center",
    },
  });
