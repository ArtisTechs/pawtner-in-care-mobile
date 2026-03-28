import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
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
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasImage = Boolean(imageUri);

  return (
    <View style={[styles.outerCard, style]}>
      <View style={styles.innerCard}>
        {imageUri ? (
          <View style={styles.previewFrame}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={onPickImage}
            style={({ pressed }) => [styles.previewFrame, pressed && styles.pressed]}
          >
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
          </Pressable>
        )}
      </View>

      {hasImage ? (
        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsPreviewVisible(true)}
            style={({ pressed }) => [styles.viewButton, pressed && styles.pressed]}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </Pressable>
          {onRemoveImage ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRemoveImage}
              style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}
            >
              <Text style={styles.clearButtonText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
        transparent
        visible={isPreviewVisible && hasImage}
      >
        <View style={styles.previewBackdrop}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsPreviewVisible(false)}
            style={styles.previewBackdropDismiss}
          />
          <View style={styles.previewModalCard}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.previewModalImage}
                resizeMode="contain"
              />
            ) : null}
            <View style={styles.previewLabelBadge}>
              <Text style={styles.previewLabelText}>Preview</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsPreviewVisible(false)}
              style={({ pressed }) => [
                styles.closePreviewButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.closePreviewButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
      borderRadius: 2,
      backgroundColor: "rgba(241, 244, 249, 0.92)",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
    },
    previewFrame: {
      width: "100%",
      maxWidth: 220,
      aspectRatio: 1,
      borderRadius: 6,
      backgroundColor: "rgba(229, 238, 247, 0.95)",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderWrap: {
      width: "100%",
      height: "100%",
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
      fontSize: 20,
      lineHeight: 30,
      fontWeight: "900",
      textAlign: "center",
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    actionRow: {
      marginTop: 10,
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    viewButton: {
      borderRadius: 999,
      backgroundColor: "rgba(30, 111, 189, 0.9)",
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    viewButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 8,
      lineHeight: 13,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    clearButton: {
      borderRadius: 999,
      backgroundColor: "rgba(237, 69, 69, 0.88)",
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    clearButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 8,
      lineHeight: 12,
      fontWeight: "800",
    },
    previewBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    previewBackdropDismiss: {
      ...StyleSheet.absoluteFillObject,
    },
    previewModalCard: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 14,
      backgroundColor: colors.white,
      padding: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    previewModalImage: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 10,
      backgroundColor: "rgba(229, 238, 247, 0.95)",
    },
    previewLabelBadge: {
      marginTop: 10,
      borderRadius: 999,
      backgroundColor: "rgba(30, 111, 189, 0.85)",
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    previewLabelText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 9,
      lineHeight: 13,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    closePreviewButton: {
      marginTop: 10,
      borderRadius: 999,
      backgroundColor: "rgba(30, 111, 189, 0.9)",
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    closePreviewButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 10,
      lineHeight: 14,
      fontWeight: "800",
      letterSpacing: 0.2,
    },
    pressed: {
      opacity: 0.88,
    },
  });
