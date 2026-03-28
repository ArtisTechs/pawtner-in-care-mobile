import { SosCaptureButton } from "@/components/sos/sos-capture-button";
import { SosImagePreview } from "@/components/sos/sos-image-preview";
import { SosActionButton } from "@/components/sos/sos-action-button";
import { SosUploadButton } from "@/components/sos/sos-upload-button";
import { AppToast } from "@/components/ui/app-toast";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import { SOS_ASSETS } from "@/features/sos/sos.data";
import type { SosImageSourceType } from "@/features/sos/sos.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;

export default function SosReportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { hideToast, showToast, toast } = useToast();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const [pendingSourceType, setPendingSourceType] = useState<SosImageSourceType | null>(
    null,
  );
  const [sourceType, setSourceType] = useState<SosImageSourceType | null>(null);
  const [isSelectingImage, setIsSelectingImage] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const hasCameraPermission = Boolean(cameraPermission?.granted);

  const handleBack = () => {
    router.replace("/(tabs)");
  };

  const handleImageSelected = (
    imageUri: string,
    nextSourceType: SosImageSourceType,
  ) => {
    setPendingImageUri(null);
    setPendingSourceType(null);
    setSelectedImageUri(imageUri);
    setSourceType(nextSourceType);
    router.push({
      pathname: "/sos/details",
      params: {
        imageUri,
        sourceType: nextSourceType,
      },
    });
  };

  const handleRetakePhoto = () => {
    setPendingImageUri(null);
    setPendingSourceType(null);
    setSelectedImageUri(null);
    setSourceType(null);
  };

  const handleConfirmSelectedImage = () => {
    if (!pendingImageUri || !pendingSourceType) {
      return;
    }

    handleImageSelected(pendingImageUri, pendingSourceType);
    showToast("Image confirmed.");
  };

  const handleUploadFromGallery = async () => {
    try {
      setIsSelectingImage(true);
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showToast("Media permission is required to upload.", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      setPendingImageUri(result.assets[0].uri);
      setPendingSourceType("gallery");
      setSelectedImageUri(result.assets[0].uri);
      setSourceType("gallery");
      showToast("Image selected. Confirm or retake.");
    } catch {
      showToast("Unable to open image library.", "error");
    } finally {
      setIsSelectingImage(false);
    }
  };

  const handleRequestCameraAccess = async () => {
    const permissionResult = await requestCameraPermission();

    if (!permissionResult.granted) {
      showToast("Camera permission is required to capture photo.", "error");
      return false;
    }

    return true;
  };

  const handleCapturePhoto = async () => {
    if (!hasCameraPermission) {
      const granted = await handleRequestCameraAccess();

      if (!granted) {
        return;
      }
    }

    if (!isCameraReady || !cameraRef.current) {
      showToast("Camera is still starting. Try again.", "error");
      return;
    }

    try {
      setIsSelectingImage(true);

      const result = await cameraRef.current.takePictureAsync({
        quality: 1,
      });

      if (!result?.uri) {
        showToast("No photo captured. Try again.", "error");
        return;
      }

      setPendingImageUri(result.uri);
      setPendingSourceType("camera");
      setSelectedImageUri(result.uri);
      setSourceType("camera");
      showToast("Photo captured. Confirm or retake.");
    } catch {
      showToast("Unable to open camera right now.", "error");
    } finally {
      setIsSelectingImage(false);
    }
  };

  const isSelectionAwaitingConfirmation = Boolean(
    pendingImageUri && pendingSourceType,
  );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.loginHeaderGradientStart}
      />
      <AppToast onDismiss={hideToast} toast={toast} />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientStart,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.textureOverlay} />

        <View
          style={[
            styles.contentWrap,
            {
              paddingTop: insets.top + 10,
            },
          ]}
        >
          <View style={styles.headerWrap}>
            <Pressable
              accessibilityRole="button"
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Image
                source={SOS_ASSETS.backIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </Pressable>

            <Text style={styles.title}>REPORT STRAYS</Text>
            <Text style={styles.subtitle}>
              Point your camera and report a stray cats and dogs
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + 22,
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <SosImagePreview
              cameraPreview={
                hasCameraPermission ? (
                <CameraView
                  ref={cameraRef}
                  facing="back"
                  onCameraReady={() => setIsCameraReady(true)}
                  style={styles.cameraPreview}
                />
                ) : undefined
              }
              isCameraPermissionGranted={hasCameraPermission}
              imageUri={selectedImageUri}
              onPressEnableCamera={() => void handleRequestCameraAccess()}
              placeholderSource={SOS_ASSETS.previewPlaceholder}
              showCameraPermissionPrompt={!hasCameraPermission}
              sourceType={sourceType}
            />

            {isSelectionAwaitingConfirmation ? (
              <View style={styles.captureDecisionWrap}>
                <SosActionButton
                  disabled={isSelectingImage}
                  label="Retake"
                  onPress={handleRetakePhoto}
                  style={styles.captureDecisionButton}
                  variant="soft"
                />
                <SosActionButton
                  disabled={isSelectingImage}
                  label="Confirm"
                  onPress={handleConfirmSelectedImage}
                  style={styles.captureDecisionButton}
                />
              </View>
            ) : (
              <>
                <View style={styles.uploadButtonWrap}>
                  <SosUploadButton
                    disabled={isSelectingImage}
                    onPress={() => void handleUploadFromGallery()}
                  />
                </View>

                <View style={styles.captureButtonWrap}>
                  <SosCaptureButton
                    disabled={isSelectingImage}
                    onPress={() => void handleCapturePhoto()}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
      alignItems: "center",
    },
    textureOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
      paddingHorizontal: 12,
    },
    headerWrap: {
      minHeight: 92,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      marginBottom: 10,
      paddingHorizontal: 20,
    },
    backButton: {
      position: "absolute",
      left: 4,
      top: 2,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.white,
    },
    title: {
      fontFamily: DisplayFontFamily,
      color: colors.white,
      fontSize: 32,
      lineHeight: 36,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      marginTop: 6,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      textAlign: "center",
    },
    scrollContent: {
      alignItems: "center",
    },
    uploadButtonWrap: {
      marginTop: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    captureButtonWrap: {
      marginTop: 16,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
    },
    captureDecisionWrap: {
      width: "100%",
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      columnGap: 10,
    },
    captureDecisionButton: {
      flex: 1,
    },
    pressed: {
      opacity: 0.84,
    },
    cameraPreview: {
      width: "100%",
      height: "100%",
    },
  });
