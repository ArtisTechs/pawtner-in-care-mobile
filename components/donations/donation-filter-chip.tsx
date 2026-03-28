import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type DonationFilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function DonationFilterChip({
  label,
  selected,
  onPress,
}: DonationFilterChipProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? "rgba(226, 241, 255, 0.56)"
            : "rgba(150, 196, 241, 0.36)",
          borderColor: selected
            ? "rgba(255, 255, 255, 0.18)"
            : "rgba(216, 232, 255, 0.28)",
        },
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected
              ? colors.dashboardBottomIconActive
              : colors.dashboardHeaderText,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 30,
    minWidth: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  label: {
    fontFamily: RoundedFontFamily,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
