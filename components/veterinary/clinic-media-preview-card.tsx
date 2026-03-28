import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { VeterinaryClinicMediaItem } from "@/features/veterinary/veterinary.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ClinicMediaPreviewCardProps = {
  item: VeterinaryClinicMediaItem;
  onPress?: () => void;
};

export function ClinicMediaPreviewCard({
  item,
  onPress,
}: ClinicMediaPreviewCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isVideo = item.type === "video";

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <MaterialIcons
          color={colors.petDetailsOutline}
          name={isVideo ? "play-circle-filled" : "photo-library"}
          size={28}
        />
      </View>
      <Text style={styles.typeLabel}>{isVideo ? "Video" : "Photo"}</Text>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: 154,
      aspectRatio: 1.22,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.petDetailsOutline,
      backgroundColor: colors.petDetailsSurface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 6,
      elevation: 4,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.5)",
    },
    typeLabel: {
      marginTop: 8,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
    },
    pressed: {
      opacity: 0.9,
    },
  });
