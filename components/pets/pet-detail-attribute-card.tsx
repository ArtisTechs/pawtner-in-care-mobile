import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type PetDetailAttributeCardProps = {
  label: string;
  value: string;
};

export function PetDetailAttributeCard({
  label,
  value,
}: PetDetailAttributeCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minHeight: 62,
      borderRadius: 12,
      borderWidth: 1.1,
      borderColor: colors.petDetailsOutline,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 6,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    value: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: "900",
    },
    label: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "700",
    },
  });
