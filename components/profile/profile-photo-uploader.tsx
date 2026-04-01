import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getErrorMessage } from "@/services/api/api-error";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ProfilePhotoUploaderProps = {
  disabled?: boolean;
  onChangePhoto: (photoUri: string | null) => void;
  onError?: (message: string) => void;
  photoUri: string | null;
};

export function ProfilePhotoUploader({
  disabled = false,
  onChangePhoto,
  onError,
  photoUri,
}: ProfilePhotoUploaderProps) {
  const [isPickingPhoto, setIsPickingPhoto] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePickPhoto = async () => {
    if (disabled || isPickingPhoto) {
      return;
    }

    try {
      setIsPickingPhoto(true);
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        onError?.("Media permission is required to upload profile photo.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        allowsMultipleSelection: false,
        aspect: [1, 1],
        mediaTypes: ["images"],
        quality: 0.9,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const selectedAsset = result.assets[0];

      if (!selectedAsset?.uri) {
        onError?.("Unable to read selected profile photo.");
        return;
      }

      onChangePhoto(selectedAsset.uri);
    } catch (error) {
      onError?.(getErrorMessage(error, "Unable to select profile photo right now."));
    } finally {
      setIsPickingPhoto(false);
    }
  };

  const handleClearPhoto = () => {
    if (disabled || isPickingPhoto) {
      return;
    }

    Alert.alert(
      "Clear photo?",
      "This will remove the selected profile photo.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => onChangePhoto(null),
        },
      ],
    );
  };

  const handlePressPreview = () => {
    if (!photoUri) {
      return;
    }

    setIsPreviewVisible(true);
  };

  return (
    <>
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          disabled={!photoUri}
          onPress={handlePressPreview}
          style={({ pressed }) => [
            styles.previewWrap,
            !photoUri && styles.previewWrapDisabled,
            pressed && photoUri && styles.pressed,
          ]}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <View style={styles.previewFallback}>
              <MaterialIcons
                color={colors.dashboardBottomIcon}
                name="person"
                size={24}
              />
            </View>
          )}
        </Pressable>

        <View style={styles.textWrap}>
          <Text style={styles.title}>Profile Photo</Text>
          <Text style={styles.subtitle}>{isPickingPhoto ? "Selecting photo..." : "Tap photo to preview"}</Text>
        </View>

        <View style={styles.actionsWrap}>
          <View style={styles.actionButtonsRow}>
            <Pressable
              accessibilityRole="button"
              disabled={disabled || isPickingPhoto}
              onPress={() => void handlePickPhoto()}
              style={({ pressed }) => [
                styles.uploadButton,
                (disabled || isPickingPhoto) && styles.uploadButtonDisabled,
                pressed && !disabled && !isPickingPhoto && styles.pressed,
              ]}
            >
              <MaterialIcons
                color={colors.dashboardBottomIconActive}
                name="upload"
                size={18}
              />
              <Text style={styles.uploadButtonText}>
                {isPickingPhoto ? "Selecting..." : photoUri ? "Change" : "Upload"}
              </Text>
            </Pressable>

            {photoUri ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleClearPhoto}
                style={({ pressed }) => [
                  styles.clearIconButton,
                  pressed && styles.pressed,
                ]}
              >
                <MaterialIcons color={colors.loginError} name="delete" size={16} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsPreviewVisible(false)}
        transparent
        visible={isPreviewVisible && Boolean(photoUri)}
      >
        <View style={styles.previewBackdrop}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsPreviewVisible(false)}
            style={styles.previewBackdropDismiss}
          />

          <View style={styles.previewModalCard}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={styles.previewModalImage}
                resizeMode="contain"
              />
            ) : null}

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
    </>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      marginTop: 12,
      width: "100%",
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.88)",
      paddingHorizontal: 10,
      paddingVertical: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      shadowColor: "rgba(14, 56, 106, 0.2)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    previewWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.24)",
      overflow: "hidden",
      backgroundColor: colors.white,
    },
    previewWrapDisabled: {
      opacity: 0.96,
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    previewFallback: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
      gap: 2,
    },
    title: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "900",
    },
    subtitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "600",
      opacity: 0.85,
    },
    actionsWrap: {
      alignItems: "flex-end",
    },
    actionButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    uploadButton: {
      minHeight: 34,
      borderRadius: 999,
      backgroundColor: colors.dashboardBottomBarBackground,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.24)",
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
    },
    uploadButtonDisabled: {
      opacity: 0.62,
    },
    uploadButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 13,
      lineHeight: 15,
      fontWeight: "800",
    },
    clearIconButton: {
      width: 34,
      height: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(216, 64, 64, 0.25)",
      backgroundColor: "rgba(216, 64, 64, 0.12)",
      alignItems: "center",
      justifyContent: "center",
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
      opacity: 0.84,
    },
  });
