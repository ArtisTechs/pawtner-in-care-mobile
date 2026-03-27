import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, View } from "react-native";

type DonationProgressBarProps = {
  progress: number;
};

const clampProgress = (value: number) => Math.max(0, Math.min(1, value));

export function DonationProgressBar({ progress }: DonationProgressBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const normalizedProgress = clampProgress(progress);

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${normalizedProgress * 100}%`,
            backgroundColor: colors.dashboardBottomIcon,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#D5D7DA",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});
