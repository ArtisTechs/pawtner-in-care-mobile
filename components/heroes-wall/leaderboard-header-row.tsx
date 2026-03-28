import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export function LeaderboardHeaderRow() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, styles.rankLabel]}>Rank</Text>
      <Text style={[styles.label, styles.userLabel]}>User</Text>
      <Text style={[styles.label, styles.amountLabel]}>Donated</Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      width: "100%",
      minHeight: 40,
      borderRadius: 999,
      backgroundColor: "#85B6EA",
      paddingHorizontal: 18,
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      fontFamily: RoundedFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: 15,
      lineHeight: 18,
      fontWeight: "900",
    },
    rankLabel: {
      width: 48,
      textAlign: "center",
    },
    userLabel: {
      flex: 1,
      textAlign: "center",
    },
    amountLabel: {
      width: 84,
      textAlign: "right",
    },
  });
