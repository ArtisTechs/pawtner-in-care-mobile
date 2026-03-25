import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type PetMediaPreviewCardProps = {
  onPress?: () => void;
};

export function PetMediaPreviewCard({ onPress }: PetMediaPreviewCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.playWrap}>
        <View style={styles.playGlyphContainer}>
          <View style={styles.playGlyph} />
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: "47.5%",
      aspectRatio: 1.35,
      borderRadius: 20,
      backgroundColor: colors.petDetailsSurface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
      paddingBottom: 15,
    },
    playWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: colors.petDetailsOutline,
      alignItems: "center",
      justifyContent: "center",
    },
    playGlyphContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -5 }, { translateY: -11 }],
    },
    playGlyph: {
      width: 0,
      height: 0,
      borderTopWidth: 10,
      borderBottomWidth: 10,
      borderLeftWidth: 16,
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
      borderLeftColor: colors.petDetailsOutline,
    },
    cardPressed: {
      opacity: 0.9,
    },
  });
