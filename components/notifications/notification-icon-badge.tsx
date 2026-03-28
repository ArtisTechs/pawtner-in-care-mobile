import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";

type NotificationIconBadgeProps = {
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
};

export function NotificationIconBadge({ iconName }: NotificationIconBadgeProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap}>
      <MaterialIcons color={colors.white} name={iconName} size={18} />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    wrap: {
      width: 28,
      height: 28,
      borderRadius: 5,
      backgroundColor: colors.dashboardScreenBackground,
      alignItems: "center",
      justifyContent: "center",
    },
  });
