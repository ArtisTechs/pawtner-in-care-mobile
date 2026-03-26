import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DateFilterButtonProps = {
  label: string;
  onPress: () => void;
  showDropdownIcon?: boolean;
};

export function DateFilterButton({
  label,
  onPress,
  showDropdownIcon = false,
}: DateFilterButtonProps) {
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
      {showDropdownIcon ? (
        <View style={styles.iconWrap}>
          <MaterialIcons
            color={colors.dashboardBottomIconActive}
            name="keyboard-arrow-down"
            size={17}
          />
        </View>
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    button: {
      minHeight: 34,
      borderRadius: 8,
      backgroundColor: colors.dashboardSectionCardBackground,
      borderWidth: 1,
      borderColor: "rgba(39, 93, 154, 0.44)",
      paddingHorizontal: 11,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    buttonPressed: {
      opacity: 0.84,
    },
    label: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    iconWrap: {
      marginTop: 1,
    },
  });
