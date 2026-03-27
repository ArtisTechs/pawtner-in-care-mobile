import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type VerifiedBadgeProps = {
  size?: number;
};

export function VerifiedBadge({ size = 16 }: VerifiedBadgeProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <MaterialIcons color={colors.white} name="check" size={size * 0.72} />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    badge: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.dashboardBottomIcon,
    },
  });
