import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

type SosUploadButtonProps = {
  disabled?: boolean;
  onPress: () => void;
};

export function SosUploadButton({
  disabled = false,
  onPress,
}: SosUploadButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.label}>Upload From Gallery</Text>
      <MaterialIcons color={colors.dashboardBottomIconActive} name="file-upload" size={18} />
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    button: {
      alignSelf: "center",
      minHeight: 40,
      borderRadius: 999,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 4,
      borderWidth: 1.4,
      borderColor: "rgba(255, 255, 255, 0.96)",
      backgroundColor: colors.white,
      shadowColor: "rgba(21, 67, 116, 0.45)",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.28,
      shadowRadius: 6,
      elevation: 5,
    },
    label: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
    },
    buttonDisabled: {
      opacity: 0.65,
    },
    pressed: {
      opacity: 0.84,
    },
  });
