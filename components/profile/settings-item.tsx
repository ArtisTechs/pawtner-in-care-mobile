import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type SettingsItemProps = {
  label: string;
  onPress: () => void;
};

export function SettingsItem({ label, onPress }: SettingsItemProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={styles.label}>{label}</Text>
      <MaterialIcons
        color={colors.dashboardHeaderText}
        name="chevron-right"
        size={24}
      />
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    button: {
      width: "100%",
      minHeight: 50,
      borderRadius: 12,
      backgroundColor: colors.dashboardBottomBarBackground,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    buttonPressed: {
      opacity: 0.82,
    },
    label: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
  });
