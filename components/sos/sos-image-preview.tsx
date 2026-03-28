import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { SosImageSourceType } from "@/features/sos/sos.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, type ReactNode } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SosImagePreviewProps = {
  cameraPreview?: ReactNode;
  isCameraPermissionGranted?: boolean;
  imageUri: string | null;
  onPressEnableCamera?: () => void;
  placeholderSource: ImageSourcePropType;
  showCameraPermissionPrompt?: boolean;
  sourceType: SosImageSourceType | null;
};

const SOURCE_LABEL_MAP: Record<SosImageSourceType, string> = {
  camera: "Camera",
  gallery: "Gallery",
};

export function SosImagePreview({
  cameraPreview,
  isCameraPermissionGranted = false,
  imageUri,
  onPressEnableCamera,
  placeholderSource,
  showCameraPermissionPrompt = false,
  sourceType,
}: SosImagePreviewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const resolvedSource = imageUri ? { uri: imageUri } : placeholderSource;

  return (
    <View style={styles.previewWrap}>
      {cameraPreview ? (
        <View style={styles.cameraLayer}>{cameraPreview}</View>
      ) : (
        <Image source={resolvedSource} style={styles.previewImage} resizeMode="cover" />
      )}

      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={styles.imageOverlay}
          resizeMode="cover"
        />
      ) : null}

      {!imageUri && !cameraPreview ? (
        <View style={styles.placeholderOverlay}>
          <MaterialIcons color={colors.white} name="photo-camera" size={22} />
          <Text style={styles.placeholderText}>Capture or upload stray photo</Text>
        </View>
      ) : null}

      {showCameraPermissionPrompt && !isCameraPermissionGranted ? (
        <View style={styles.permissionOverlay}>
          <MaterialIcons color={colors.white} name="photo-camera" size={22} />
          <Text style={styles.permissionText}>Camera access is needed for in-screen capture.</Text>
          {onPressEnableCamera ? (
            <Pressable
              accessibilityRole="button"
              onPress={onPressEnableCamera}
              style={({ pressed }) => [
                styles.permissionButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.permissionButtonText}>Enable Camera</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {sourceType ? (
        <View style={styles.sourceBadge}>
          <Text style={styles.sourceBadgeText}>{SOURCE_LABEL_MAP[sourceType]}</Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    previewWrap: {
      width: "100%",
      aspectRatio: 0.72,
      borderRadius: 18,
      borderWidth: 2.5,
      borderColor: "rgba(255, 255, 255, 0.95)",
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      position: "relative",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 7,
      elevation: 5,
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    cameraLayer: {
      width: "100%",
      height: "100%",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    placeholderOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(32, 83, 145, 0.36)",
      paddingHorizontal: 22,
      rowGap: 7,
    },
    permissionOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(32, 83, 145, 0.5)",
      paddingHorizontal: 24,
      rowGap: 8,
    },
    placeholderText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
      textAlign: "center",
    },
    permissionText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "800",
      textAlign: "center",
    },
    permissionButton: {
      marginTop: 2,
      minHeight: 34,
      borderRadius: 999,
      paddingHorizontal: 14,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.3,
      borderColor: "rgba(255, 255, 255, 0.95)",
      backgroundColor: "rgba(16, 54, 96, 0.6)",
    },
    permissionButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "800",
    },
    sourceBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      borderRadius: 999,
      backgroundColor: "rgba(20, 59, 106, 0.78)",
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    sourceBadgeText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 8,
      lineHeight: 13,
      fontWeight: "800",
    },
    pressed: {
      opacity: 0.84,
    },
  });
