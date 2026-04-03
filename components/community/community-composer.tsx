import { CommunitySelectedMediaPreview } from "@/components/community/community-selected-media-preview";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { resolveOptionalImageSource } from "@/features/community/community.data";
import type {
  CommunityComposerMediaAsset,
  CommunityImageSource,
  CommunityPostMediaType,
  SubmitCommunityPostInput,
} from "@/features/community/community.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type CommunityComposerProps = {
  avatar: CommunityImageSource;
  isSubmitting?: boolean;
  onSubmitPost: (input: SubmitCommunityPostInput) => Promise<void> | void;
};

const MAX_PHOTOS = 5;
const MAX_VIDEO = 1;

const MEDIA_ACTIONS: {
  action: CommunityPostMediaType;
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
}[] = [
  { action: "image", iconName: "image" },
  { action: "video", iconName: "videocam" },
];

const normalizeAsset = (
  asset: ImagePicker.ImagePickerAsset,
): CommunityComposerMediaAsset | null => {
  const normalizedUri = asset.uri?.trim();

  if (!normalizedUri) {
    return null;
  }

  return {
    fileName: asset.fileName ?? null,
    mimeType: asset.mimeType ?? null,
    uri: normalizedUri,
  };
};

export function CommunityComposer({
  avatar,
  isSubmitting = false,
  onSubmitPost,
}: CommunityComposerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isComposeModalVisible, setIsComposeModalVisible] = useState(false);
  const [draftCaption, setDraftCaption] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState<CommunityComposerMediaAsset[]>(
    [],
  );
  const [selectedVideo, setSelectedVideo] = useState<CommunityComposerMediaAsset | null>(
    null,
  );
  const [isDiscardConfirmVisible, setIsDiscardConfirmVisible] = useState(false);

  const canPost =
    draftCaption.trim().length > 0 ||
    selectedPhotos.length > 0 ||
    Boolean(selectedVideo);
  const hasDraftChanges =
    draftCaption.length > 0 || selectedPhotos.length > 0 || Boolean(selectedVideo);
  const avatarSource = resolveOptionalImageSource(avatar);
  const canAddMorePhotos = selectedPhotos.length < MAX_PHOTOS && !selectedVideo;
  const canAttachVideo = !selectedVideo && selectedPhotos.length === 0;
  const mediaRuleMessage = selectedVideo
    ? "Clear video first to add photos."
    : selectedPhotos.length > 0
      ? "Clear photos first to attach a video."
      : "";

  const resetDraft = () => {
    setDraftCaption("");
    setSelectedPhotos([]);
    setSelectedVideo(null);
  };

  const closeComposerModal = () => {
    setIsComposeModalVisible(false);
  };

  const closeDiscardConfirm = () => {
    if (isSubmitting) {
      return;
    }

    setIsDiscardConfirmVisible(false);
  };

  const discardDraftAndClose = () => {
    if (isSubmitting) {
      return;
    }

    setIsDiscardConfirmVisible(false);
    resetDraft();
    closeComposerModal();
  };

  const handleRequestCloseComposer = () => {
    if (isSubmitting) {
      return;
    }

    if (!hasDraftChanges) {
      closeComposerModal();
      return;
    }

    setIsDiscardConfirmVisible(true);
  };

  const handlePressCancel = () => {
    handleRequestCloseComposer();
  };

  const handlePressPost = async () => {
    if (!canPost || isSubmitting) {
      return;
    }

    try {
      await onSubmitPost({
        caption: draftCaption,
        photos: selectedPhotos,
        video: selectedVideo,
      });
      resetDraft();
      closeComposerModal();
    } catch {
      // Keep current draft when submit fails.
    }
  };

  const handlePickMedia = async (mediaType: CommunityPostMediaType) => {
    if (mediaType === "image" && !canAddMorePhotos) {
      return;
    }

    if (mediaType === "video" && !canAttachVideo) {
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: mediaType === "image",
        mediaTypes: [mediaType === "image" ? "images" : "videos"],
        quality: 1,
        selectionLimit:
          mediaType === "image"
            ? Math.max(1, MAX_PHOTOS - selectedPhotos.length)
            : 1,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      if (mediaType === "image") {
        const incomingPhotos = result.assets
          .map(normalizeAsset)
          .filter((asset): asset is CommunityComposerMediaAsset => Boolean(asset));

        if (!incomingPhotos.length) {
          return;
        }

        setSelectedPhotos((currentPhotos) => {
          const existingByUri = new Map(currentPhotos.map((item) => [item.uri, item]));

          for (const asset of incomingPhotos) {
            existingByUri.set(asset.uri, asset);
          }

          return Array.from(existingByUri.values()).slice(0, MAX_PHOTOS);
        });
        setSelectedVideo(null);
        return;
      }

      const pickedVideo = normalizeAsset(result.assets[0]);

      if (!pickedVideo) {
        return;
      }

      setSelectedVideo(pickedVideo);
      setSelectedPhotos([]);
    } catch {
      // Keep silent for now to match existing lightweight composer behavior.
    }
  };

  const handleOpenForMediaAction = (mediaType: CommunityPostMediaType) => {
    setIsComposeModalVisible(true);
    void handlePickMedia(mediaType);
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    setSelectedPhotos((currentPhotos) =>
      currentPhotos.filter((asset) => asset.uri !== uriToRemove),
    );
  };

  const handleClearPhotos = () => {
    setSelectedPhotos([]);
  };

  const handleClearVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.inputRow}>
          {avatarSource ? (
            <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={styles.avatarFallback}>
              <MaterialIcons
                color={colors.dashboardBottomIcon}
                name="person"
                size={24}
              />
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            onPress={() => setIsComposeModalVisible(true)}
            style={({ pressed }) => [
              styles.inputLauncher,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.inputLauncherText}>What&apos;s happening?</Text>
          </Pressable>

          <View style={styles.mediaActionGroup}>
            {MEDIA_ACTIONS.map((item) => {
              const isSelected =
                (item.action === "image" && selectedPhotos.length > 0) ||
                (item.action === "video" && Boolean(selectedVideo));

              return (
                <Pressable
                  key={item.action}
                  accessibilityRole="button"
                  onPress={() => handleOpenForMediaAction(item.action)}
                  style={({ pressed }) => [
                    styles.mediaActionButton,
                    isSelected && styles.mediaActionButtonSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <MaterialIcons
                    color={
                      isSelected
                        ? colors.dashboardBottomIconActive
                        : colors.dashboardBottomIcon
                    }
                    name={item.iconName}
                    size={20}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isComposeModalVisible}
        onRequestClose={handleRequestCloseComposer}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            onPress={handleRequestCloseComposer}
            style={StyleSheet.absoluteFill}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboardAvoidingView}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Create Post</Text>

              <TextInput
                value={draftCaption}
                onChangeText={setDraftCaption}
                placeholder="Add a caption (include hashtags in caption)"
                placeholderTextColor="rgba(42, 102, 171, 0.52)"
                style={styles.captionInput}
                multiline
                maxLength={254}
                textAlignVertical="top"
              />

              <View style={styles.mediaSummaryRow}>
                <Text style={styles.mediaSummaryText}>
                  Photos: {selectedPhotos.length}/{MAX_PHOTOS}
                </Text>
                <Text style={styles.mediaSummaryText}>
                  Video: {selectedVideo ? MAX_VIDEO : 0}/{MAX_VIDEO}
                </Text>
              </View>

              <CommunitySelectedMediaPreview
                onClearPhotos={handleClearPhotos}
                onClearVideo={handleClearVideo}
                onRemovePhoto={handleRemovePhoto}
                photoUris={selectedPhotos.map((item) => item.uri)}
                videoMimeType={selectedVideo?.mimeType ?? null}
                videoUri={selectedVideo?.uri ?? null}
              />

              <View style={styles.modalMediaActionGroup}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!canAddMorePhotos || isSubmitting}
                  onPress={() => void handlePickMedia("image")}
                  style={({ pressed }) => [
                    styles.modalMediaActionButton,
                    (!canAddMorePhotos || isSubmitting) &&
                      styles.modalMediaActionButtonDisabled,
                    pressed && canAddMorePhotos && !isSubmitting && styles.pressed,
                  ]}
                >
                  <MaterialIcons
                    color={colors.dashboardBottomIconActive}
                    name="image"
                    size={18}
                  />
                  <Text style={styles.modalMediaActionText}>
                    {selectedPhotos.length ? "Add more photos" : "Add photos"}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={selectedPhotos.length === 0 || isSubmitting}
                  onPress={handleClearPhotos}
                  style={({ pressed }) => [
                    styles.modalMediaActionButton,
                    (selectedPhotos.length === 0 || isSubmitting) &&
                      styles.modalMediaActionButtonDisabled,
                    pressed &&
                      selectedPhotos.length > 0 &&
                      !isSubmitting &&
                      styles.pressed,
                  ]}
                >
                  <MaterialIcons
                    color={colors.dashboardBottomIconActive}
                    name="delete"
                    size={18}
                  />
                  <Text style={styles.modalMediaActionText}>Clear photos</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={!canAttachVideo || isSubmitting}
                  onPress={() => void handlePickMedia("video")}
                  style={({ pressed }) => [
                    styles.modalMediaActionButton,
                    (!canAttachVideo || isSubmitting) &&
                      styles.modalMediaActionButtonDisabled,
                    pressed && canAttachVideo && !isSubmitting && styles.pressed,
                  ]}
                >
                  <MaterialIcons
                    color={colors.dashboardBottomIconActive}
                    name="videocam"
                    size={18}
                  />
                  <Text style={styles.modalMediaActionText}>Add video</Text>
                </Pressable>
              </View>

              {mediaRuleMessage ? (
                <Text style={styles.mediaRuleText}>{mediaRuleMessage}</Text>
              ) : null}

              <View style={styles.modalButtonRow}>
                <Pressable
                  accessibilityRole="button"
                  onPress={handlePressCancel}
                  style={({ pressed }) => [
                    styles.cancelButton,
                    (pressed || isSubmitting) && styles.pressed,
                  ]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => void handlePressPost()}
                  style={({ pressed }) => [
                    styles.postButton,
                    (!canPost || isSubmitting) && styles.postButtonDisabled,
                    pressed && canPost && !isSubmitting && styles.pressed,
                  ]}
                >
                  <Text style={styles.postButtonText}>
                    {isSubmitting ? "Posting..." : "Post"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={isDiscardConfirmVisible}
        onRequestClose={closeDiscardConfirm}
      >
        <View style={styles.promptOverlay}>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            onPress={closeDiscardConfirm}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.promptCard}>
            <View style={styles.cancelPromptIconOuterCircle}>
              <View style={styles.cancelPromptIconInnerCircle}>
                <MaterialIcons color="#FFFFFF" name="close" size={42} />
              </View>
            </View>

            <Text style={styles.promptTitle}>Discard this post?</Text>
            <Text style={styles.promptBodyText}>
              You have unsaved changes. Discard your draft and close the composer?
            </Text>

            <View style={styles.promptButtonRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={closeDiscardConfirm}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptCancelButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptCancelText}>Keep editing</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={discardDraftAndClose}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptDangerButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptConfirmText}>Discard</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
      marginTop: 1,
    },
    avatarFallback: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
      marginTop: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      height: 36,
      minWidth: 90,
      borderRadius: 18,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.28)",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.8)",
    },
    cancelButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 15,
      lineHeight: 18,
      fontWeight: "800",
    },
    captionInput: {
      minHeight: 95,
      borderRadius: 14,
      backgroundColor: colors.white,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.14)",
    },
    card: {
      width: "100%",
      borderRadius: 16,
      backgroundColor: "#C7DAEE",
      paddingHorizontal: 12,
      paddingVertical: 12,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 2,
    },
    inputLauncher: {
      flex: 1,
      minHeight: 42,
      borderRadius: 21,
      backgroundColor: "#EDEDEF",
      paddingHorizontal: 14,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    inputLauncherText: {
      fontFamily: RoundedFontFamily,
      color: "rgba(42, 102, 171, 0.8)",
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    mediaActionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    mediaActionButtonSelected: {
      backgroundColor: "rgba(29, 78, 136, 0.14)",
    },
    mediaActionGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    mediaRuleText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
      opacity: 0.78,
    },
    mediaSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    mediaSummaryText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      opacity: 0.84,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(11, 28, 51, 0.35)",
      justifyContent: "flex-end",
    },
    modalButtonRow: {
      marginTop: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
    },
    modalCard: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      backgroundColor: "#E7EFF8",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 20,
      gap: 10,
    },
    modalKeyboardAvoidingView: {
      width: "100%",
    },
    modalMediaActionButton: {
      minHeight: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.22)",
      backgroundColor: colors.white,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    modalMediaActionButtonDisabled: {
      opacity: 0.4,
    },
    modalMediaActionGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    modalMediaActionText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "700",
    },
    modalTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
    },
    postButton: {
      height: 36,
      minWidth: 90,
      borderRadius: 18,
      paddingHorizontal: 20,
      backgroundColor: colors.dashboardBottomBarBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    postButtonDisabled: {
      opacity: 0.45,
    },
    postButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "900",
    },
    promptOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 26,
      backgroundColor: "rgba(10, 19, 35, 0.45)",
    },
    promptCard: {
      width: "100%",
      maxWidth: 320,
      borderRadius: 14,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 18,
      backgroundColor: colors.dashboardSectionCardBackground,
      borderWidth: 2,
      borderColor: colors.petDetailsOutline,
      alignItems: "center",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 10,
    },
    cancelPromptIconOuterCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F6A9A9",
      marginBottom: 12,
    },
    cancelPromptIconInnerCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E24D4D",
    },
    promptTitle: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: colors.text,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "800",
      marginBottom: 8,
    },
    promptBodyText: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "600",
      marginBottom: 18,
    },
    promptButtonRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    promptButton: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    promptCancelButton: {
      backgroundColor: "#E5E5E5",
    },
    promptDangerButton: {
      backgroundColor: "#E24D4D",
    },
    promptCancelText: {
      color: "#4B9AF0",
      fontFamily: RoundedFontFamily,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600",
    },
    promptConfirmText: {
      color: colors.white,
      fontFamily: RoundedFontFamily,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600",
    },
    promptButtonPressed: {
      opacity: 0.88,
    },
    pressed: {
      opacity: 0.82,
    },
  });
