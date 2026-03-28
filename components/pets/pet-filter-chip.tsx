import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type PetFilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function PetFilterChip({ label, selected, onPress }: PetFilterChipProps) {
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
            ? colors.dashboardSectionCardBackground
            : "rgba(226, 241, 255, 0.42)",
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
    minWidth: 66,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
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
