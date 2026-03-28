import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { HeroesWallPeriod } from "@/features/heroes-wall/heroes-wall.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type HeroesWallTabsProps = {
  activeTab: HeroesWallPeriod;
  onChangeTab: (tab: HeroesWallPeriod) => void;
};

const PERIOD_TABS: { key: HeroesWallPeriod; label: string }[] = [
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "allTime", label: "All time" },
];

export function HeroesWallTabs({ activeTab, onChangeTab }: HeroesWallTabsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {PERIOD_TABS.map((tab) => {
        const selected = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => onChangeTab(tab.key)}
            style={({ pressed }) => [
              styles.tabButton,
              selected ? styles.tabButtonSelected : styles.tabButtonDefault,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selected ? styles.tabTextSelected : styles.tabTextDefault,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      minHeight: 40,
      borderRadius: 999,
      backgroundColor: "#85B6EA",
      padding: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    tabButton: {
      flex: 1,
      minHeight: 36,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    tabButtonSelected: {
      backgroundColor: colors.loginHeaderGradientStart,
    },
    tabButtonDefault: {
      backgroundColor: "transparent",
    },
    tabText: {
      fontFamily: RoundedFontFamily,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
    },
    tabTextSelected: {
      color: colors.white,
    },
    tabTextDefault: {
      color: "rgba(30, 87, 152, 0.94)",
    },
    pressed: {
      opacity: 0.86,
    },
  });
