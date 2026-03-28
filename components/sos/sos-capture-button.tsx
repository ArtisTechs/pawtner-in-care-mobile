import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type SosCaptureButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

export function SosCaptureButton({
  disabled = false,
  onPress,
}: SosCaptureButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.outerButton,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <View style={styles.innerButton} />
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    outerButton: {
      width: 68,
      height: 68,
      borderRadius: 34,
      borderWidth: 2.2,
      borderColor: "rgba(255, 255, 255, 0.96)",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 7,
      elevation: 6,
    },
    innerButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.white,
    },
    buttonDisabled: {
      opacity: 0.65,
    },
    pressed: {
      transform: [{ scale: 0.97 }],
    },
  });
