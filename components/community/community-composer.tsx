import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  resolveImageSource,
  resolveOptionalImageSource,
} from "@/features/community/community.data";
import type {
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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type CommunityComposerProps = {
  avatar: CommunityImageSource;
  onSubmitPost: (input: SubmitCommunityPostInput) => void;
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

export function CommunityComposer({
  avatar,
  onSubmitPost,
}: CommunityComposerProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isComposeModalVisible, setIsComposeModalVisible] = useState(false);
  const [draftCaption, setDraftCaption] = useState("");
  const [selectedPhotoUris, setSelectedPhotoUris] = useState<string[]>([]);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

  const canPost =
    draftCaption.trim().length > 0 ||
    selectedPhotoUris.length > 0 ||
    Boolean(selectedVideoUri);
  const avatarSource = resolveOptionalImageSource(avatar);
  const canAddMorePhotos =
    selectedPhotoUris.length < MAX_PHOTOS && !selectedVideoUri;
  const canAttachVideo = !selectedVideoUri && selectedPhotoUris.length === 0;
  const mediaRuleMessage = selectedVideoUri
    ? "Clear video first to add photos."
    : selectedPhotoUris.length > 0
      ? "Clear photos first to attach a video."
      : "";

  const resetDraft = () => {
    setDraftCaption("");
    setSelectedPhotoUris([]);
    setSelectedVideoUri(null);
  };

  const closeComposerModal = () => {
    setIsComposeModalVisible(false);
  };

  const handlePressCancel = () => {
    resetDraft();
    closeComposerModal();
  };

  const handlePressPost = () => {
    if (!canPost) {
      return;
    }

    onSubmitPost({
      caption: draftCaption,
      imageUris: selectedPhotoUris,
      videoUri: selectedVideoUri,
    });

    resetDraft();
    closeComposerModal();
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
        mediaTypes: [mediaType === "image" ? "images" : "videos"],
        allowsMultipleSelection: mediaType === "image",
        selectionLimit:
          mediaType === "image"
            ? Math.max(1, MAX_PHOTOS - selectedPhotoUris.length)
            : 1,
        quality: 1,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      if (mediaType === "image") {
        const incomingUris = result.assets
          .map((asset) => asset.uri)
          .filter((uri): uri is string => Boolean(uri));

        if (!incomingUris.length) {
          return;
        }

        setSelectedPhotoUris((currentUris) =>
          Array.from(new Set([...currentUris, ...incomingUris])).slice(0, MAX_PHOTOS),
        );
        setSelectedVideoUri(null);
        return;
      }

      const pickedVideoUri = result.assets[0]?.uri;
      if (!pickedVideoUri) {
        return;
      }

      setSelectedVideoUri(pickedVideoUri);
      setSelectedPhotoUris([]);
    } catch {
      // Keep silent for now to match existing lightweight composer behavior.
    }
  };

  const handleOpenForMediaAction = (mediaType: CommunityPostMediaType) => {
    setIsComposeModalVisible(true);
    void handlePickMedia(mediaType);
  };

  const handleRemovePhoto = (uriToRemove: string) => {
    setSelectedPhotoUris((currentUris) =>
      currentUris.filter((uri) => uri !== uriToRemove),
    );
  };

  const handleClearPhotos = () => {
    setSelectedPhotoUris([]);
  };

  const handleClearVideo = () => {
    setSelectedVideoUri(null);
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
            <Text style={styles.inputLauncherText}>What's happening?</Text>
          </Pressable>

          <View style={styles.mediaActionGroup}>
            {MEDIA_ACTIONS.map((item) => {
              const isSelected =
                (item.action === "image" && selectedPhotoUris.length > 0) ||
                (item.action === "video" && Boolean(selectedVideoUri));

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
        onRequestClose={handlePressCancel}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePressCancel}
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
                  Photos: {selectedPhotoUris.length}/{MAX_PHOTOS}
                </Text>
                <Text style={styles.mediaSummaryText}>
                  Video: {selectedVideoUri ? MAX_VIDEO : 0}/{MAX_VIDEO}
                </Text>
              </View>

              {selectedPhotoUris.length ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoPreviewScrollerContent}
                >
                  {selectedPhotoUris.map((photoUri, index) => (
                    <View key={`${photoUri}-${index}`} style={styles.photoPreviewCard}>
                      <Image
                        source={resolveImageSource(photoUri)}
                        style={styles.photoPreviewImage}
                        resizeMode="cover"
                      />

                      <Pressable
                        accessibilityRole="button"
                        onPress={() => handleRemovePhoto(photoUri)}
                        style={({ pressed }) => [
                          styles.removeMediaButton,
                          pressed && styles.pressed,
                        ]}
                      >
                        <MaterialIcons color={colors.white} name="close" size={16} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}

              {selectedVideoUri ? (
                <View style={styles.videoPreviewWrap}>
                  <View style={styles.videoPreviewInfo}>
                    <MaterialIcons
                      color={colors.dashboardBottomIconActive}
                      name="videocam"
                      size={19}
                    />
                    <Text style={styles.videoPreviewText}>1 video selected</Text>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={handleClearVideo}
                    style={({ pressed }) => [
                      styles.videoRemoveButton,
                      pressed && styles.pressed,
                    ]}
                  >
                    <MaterialIcons
                      color={colors.dashboardBottomIconActive}
                      name="close"
                      size={16}
                    />
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.modalMediaActionGroup}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!canAddMorePhotos}
                  onPress={() => void handlePickMedia("image")}
                  style={({ pressed }) => [
                    styles.modalMediaActionButton,
                    !canAddMorePhotos && styles.modalMediaActionButtonDisabled,
                    pressed && canAddMorePhotos && styles.pressed,
                  ]}
                >
                  <MaterialIcons
                    color={colors.dashboardBottomIconActive}
                    name="image"
                    size={18}
                  />
                  <Text style={styles.modalMediaActionText}>
                    {selectedPhotoUris.length ? "Add more photos" : "Add photos"}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  disabled={selectedPhotoUris.length === 0}
                  onPress={handleClearPhotos}
                  style={({ pressed }) => [
                    styles.modalMediaActionButton,
                    selectedPhotoUris.length === 0 &&
                      styles.modalMediaActionButtonDisabled,
                    pressed && selectedPhotoUris.length > 0 && styles.pressed,
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
                  disabled={!canAttachVideo}
                  onPress={() => void handlePickMedia("video")}
                  style={({ pressed }) => [
                    styles.modalMediaActionButton,
                    !canAttachVideo && styles.modalMediaActionButtonDisabled,
                    pressed && canAttachVideo && styles.pressed,
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
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  onPress={handlePressPost}
                  style={({ pressed }) => [
                    styles.postButton,
                    !canPost && styles.postButtonDisabled,
                    pressed && canPost && styles.pressed,
                  ]}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
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
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
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
    mediaActionGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
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
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(11, 28, 51, 0.35)",
      justifyContent: "flex-end",
    },
    modalKeyboardAvoidingView: {
      width: "100%",
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
    modalTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
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
    photoPreviewScrollerContent: {
      gap: 8,
      paddingVertical: 2,
    },
    photoPreviewCard: {
      width: 90,
      height: 90,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "rgba(44, 110, 184, 0.12)",
      position: "relative",
    },
    photoPreviewImage: {
      width: "100%",
      height: "100%",
    },
    removeMediaButton: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(29, 78, 136, 0.92)",
    },
    videoPreviewWrap: {
      minHeight: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.2)",
      backgroundColor: "rgba(255, 255, 255, 0.55)",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    videoPreviewInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    videoPreviewText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
    },
    videoRemoveButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    modalMediaActionGroup: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
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
    modalMediaActionText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "700",
    },
    mediaRuleText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
      opacity: 0.78,
    },
    modalButtonRow: {
      marginTop: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 10,
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
    pressed: {
      opacity: 0.82,
    },
  });
