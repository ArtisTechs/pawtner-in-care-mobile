import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";

type SosActionButtonVariant = "ghost" | "primary" | "soft";

type SosActionButtonProps = {
  disabled?: boolean;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: SosActionButtonVariant;
};

export function SosActionButton({
  disabled = false,
  label,
  onPress,
  style,
  variant = "primary",
}: SosActionButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.baseButton,
        variant === "primary" && styles.primaryButton,
        variant === "soft" && styles.softButton,
        variant === "ghost" && styles.ghostButton,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.baseText,
          variant === "ghost" && styles.ghostText,
          variant === "soft" && styles.softText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    baseButton: {
      minHeight: 42,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    primaryButton: {
      backgroundColor: colors.dashboardScreenBackground,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.3)",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 4,
    },
    softButton: {
      backgroundColor: colors.dashboardSectionCardBackground,
    },
    ghostButton: {
      backgroundColor: "transparent",
    },
    baseText: {
      fontFamily: RoundedFontFamily,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "800",
      color: colors.white,
    },
    softText: {
      color: colors.dashboardBottomIconActive,
    },
    ghostText: {
      color: "rgba(255, 255, 255, 0.9)",
      fontSize: 14,
    },
    pressed: {
      opacity: 0.84,
    },
    disabled: {
      opacity: 0.5,
    },
  });
