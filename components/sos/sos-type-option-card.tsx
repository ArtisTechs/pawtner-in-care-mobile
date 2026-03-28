import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SosTypeOptionCardProps = {
  isSelected: boolean;
  label: string;
  onPress: () => void;
};

export function SosTypeOptionCard({
  isSelected,
  label,
  onPress,
}: SosTypeOptionCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
    >
      {isSelected ? (
        <LinearGradient
          colors={["#2D73B9", "#3E90DB"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.selectedGradient}
          pointerEvents="none"
        />
      ) : null}
      <View
        style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
      >
        <View
          style={[styles.radioInner, isSelected && styles.radioInnerSelected]}
        />
      </View>
      <Text style={[styles.label, isSelected && styles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      minHeight: 45,
      marginLeft: 14,
      borderRadius: 12,
      backgroundColor: "rgba(240, 242, 246, 0.95)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 18,
      borderWidth: 1,
      borderColor: "rgba(28, 84, 146, 0.22)",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 5,
      elevation: 4,
      overflow: "visible",
    },
    cardSelected: {
      borderWidth: 1,
      borderColor: "rgba(20, 60, 108, 0.8)",
      backgroundColor: "transparent",
      shadowOpacity: 0.26,
      shadowRadius: 7,
      elevation: 6,
    },
    selectedGradient: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 11,
    },
    radioOuter: {
      position: "absolute",
      left: -14,
      width: 24,
      height: 24,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: "rgba(231, 240, 250, 0.96)",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.white,
    },
    radioOuterSelected: {
      left: -18,
      width: 34,
      height: 34,
      borderColor: "rgba(255, 255, 255, 0.3)",
      borderWidth: 1.5,
      backgroundColor: "#2D73B9",
    },
    radioInner: {
      width: 0,
      height: 0,
      borderRadius: 999,
      backgroundColor: "transparent",
    },
    radioInnerSelected: {
      backgroundColor: "transparent",
    },
    label: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      color: "#246DBC",
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "900",
      fontStyle: "italic",
    },
    labelSelected: {
      color: colors.white,
      fontSize: 20,
      lineHeight: 28,
    },
    pressed: {
      opacity: 0.84,
    },
  });
