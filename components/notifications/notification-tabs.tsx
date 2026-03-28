import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { NotificationFilterKey } from "@/features/notifications/notifications.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NotificationTabsProps = {
  activeTab: NotificationFilterKey;
  onChangeTab: (tab: NotificationFilterKey) => void;
};

const TABS: { key: NotificationFilterKey; label: string }[] = [
  { key: "updates", label: "Updates" },
  { key: "unread", label: "Un-read" },
];

export function NotificationTabs({
  activeTab,
  onChangeTab,
}: NotificationTabsProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const selected = activeTab === tab.key;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            onPress={() => onChangeTab(tab.key)}
            style={({ pressed }) => [
              styles.tabButton,
              selected ? styles.tabButtonSelected : styles.tabButtonUnselected,
              pressed && styles.pressed,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                selected ? styles.tabTextSelected : styles.tabTextUnselected,
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
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    tabButton: {
      minWidth: 70,
      minHeight: 32,
      borderRadius: 999,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    tabButtonSelected: {
      backgroundColor: colors.loginHeaderGradientEnd,
    },
    tabButtonUnselected: {
      backgroundColor: "#9CC3EC",
    },
    tabText: {
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
    },
    tabTextSelected: {
      color: colors.white,
    },
    tabTextUnselected: {
      color: "rgba(255, 255, 255, 0.85)",
    },
    pressed: {
      opacity: 0.84,
    },
  });
