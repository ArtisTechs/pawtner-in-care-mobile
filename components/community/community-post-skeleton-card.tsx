import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function CommunityPostSkeletonCard() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shimmerOpacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerOpacity, {
          toValue: 1,
          duration: 720,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerOpacity, {
          toValue: 0.55,
          duration: 720,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [shimmerOpacity]);

  return (
    <Animated.View style={[styles.card, { opacity: shimmerOpacity }]}>
      <View style={styles.headerRow}>
        <View style={styles.avatar} />
        <View style={styles.headerMeta}>
          <View style={styles.nameLine} />
          <View style={styles.timeLine} />
        </View>
      </View>

      <View style={styles.bodyWrap}>
        <View style={styles.bodyLineWide} />
        <View style={styles.bodyLineShort} />
      </View>

      <View style={styles.mediaBlock} />

      <View style={styles.actionRow}>
        <View style={styles.actionPill} />
        <View style={styles.actionPill} />
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    actionPill: {
      width: 44,
      height: 14,
      borderRadius: 7,
      backgroundColor: "rgba(29, 78, 136, 0.18)",
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(29, 78, 136, 0.14)",
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(29, 78, 136, 0.2)",
    },
    bodyLineShort: {
      width: "58%",
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(29, 78, 136, 0.18)",
    },
    bodyLineWide: {
      width: "90%",
      height: 12,
      borderRadius: 6,
      backgroundColor: "rgba(29, 78, 136, 0.18)",
    },
    bodyWrap: {
      gap: 8,
      paddingTop: 10,
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    card: {
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#C7DAEE",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 2,
    },
    headerMeta: {
      flex: 1,
      gap: 6,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    mediaBlock: {
      width: "100%",
      aspectRatio: 1.58,
      backgroundColor: "rgba(29, 78, 136, 0.18)",
    },
    nameLine: {
      width: "46%",
      height: 14,
      borderRadius: 7,
      backgroundColor: "rgba(29, 78, 136, 0.22)",
    },
    timeLine: {
      width: "24%",
      height: 10,
      borderRadius: 5,
      backgroundColor: "rgba(29, 78, 136, 0.18)",
    },
  });
