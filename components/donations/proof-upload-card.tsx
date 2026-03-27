import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ProofUploadCardProps = {
  imageUri: string | null;
  onPickImage: () => void;
  onRemoveImage?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function ProofUploadCard({
  imageUri,
  onPickImage,
  onRemoveImage,
  style,
}: ProofUploadCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.outerCard, style]}>
      <Pressable
        accessibilityRole="button"
        onPress={onPickImage}
        style={({ pressed }) => [
          styles.innerCard,
          pressed && styles.pressed,
        ]}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            <View style={styles.imageBadge}>
              <Text style={styles.imageBadgeText}>Change Image</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholderWrap}>
            <View style={styles.placeholderIconWrap}>
              <MaterialIcons
                color="rgba(52, 97, 151, 0.65)"
                name="add-photo-alternate"
                size={48}
              />
            </View>
            <Text style={styles.placeholderLabel}>Insert Image{"\n"}Here</Text>
          </View>
        )}
      </Pressable>

      {imageUri && onRemoveImage ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRemoveImage}
          style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    outerCard: {
      width: "100%",
      borderRadius: 14,
      backgroundColor: "#6FA6E0",
      padding: 14,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.24,
      shadowRadius: 8,
      elevation: 4,
    },
    innerCard: {
      width: "100%",
      minHeight: 188,
      borderRadius: 2,
      backgroundColor: "rgba(241, 244, 249, 0.92)",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderIconWrap: {
      width: 74,
      height: 74,
      borderRadius: 37,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(59, 108, 168, 0.2)",
      backgroundColor: "rgba(212, 226, 241, 0.46)",
    },
    placeholderLabel: {
      marginTop: 4,
      fontFamily: RoundedFontFamily,
      color: "rgba(73, 90, 112, 0.48)",
      fontSize: 26,
      lineHeight: 30,
      fontWeight: "900",
      textAlign: "center",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      minHeight: 188,
    },
    imageBadge: {
      position: "absolute",
      bottom: 10,
      alignSelf: "center",
      borderRadius: 999,
      backgroundColor: "rgba(30, 111, 189, 0.85)",
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    imageBadgeText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 11,
      lineHeight: 13,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    removeButton: {
      marginTop: 10,
      alignSelf: "flex-end",
      borderRadius: 999,
      backgroundColor: "rgba(237, 69, 69, 0.88)",
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    removeButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "800",
    },
    pressed: {
      opacity: 0.88,
    },
  });
