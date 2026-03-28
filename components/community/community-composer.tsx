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
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type CommunityComposerProps = {
  avatar: CommunityImageSource;
  onSubmitPost: (input: SubmitCommunityPostInput) => void;
};

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
  const [draftCaption, setDraftCaption] = useState("");
  const [selectedMediaUri, setSelectedMediaUri] = useState<string | null>(null);
  const [selectedMediaType, setSelectedMediaType] =
    useState<CommunityPostMediaType | null>(null);
  const canPost = draftCaption.trim().length > 0 || Boolean(selectedMediaUri);
  const avatarSource = resolveOptionalImageSource(avatar);

  const clearSelectedMedia = () => {
    setSelectedMediaUri(null);
    setSelectedMediaType(null);
  };

  const handlePressPost = () => {
    if (!canPost) {
      return;
    }

    onSubmitPost({
      caption: draftCaption,
      mediaUri: selectedMediaUri,
      mediaType: selectedMediaType,
    });
    setDraftCaption("");
    clearSelectedMedia();
  };

  const handlePickMedia = async (mediaType: CommunityPostMediaType) => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: mediaType === "image",
        mediaTypes: [mediaType === "image" ? "images" : "videos"],
        quality: 1,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      const pickedAsset = result.assets[0];

      setSelectedMediaUri(pickedAsset.uri);
      setSelectedMediaType(mediaType);
    } catch {
      // Keep silent for now to match existing lightweight composer behavior.
    }
  };

  const handlePressMediaAction = (action: CommunityPostMediaType) => {
    void handlePickMedia(action);
  };

  return (
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

        <TextInput
          value={draftCaption}
          onChangeText={setDraftCaption}
          placeholder="What's happening?"
          placeholderTextColor="rgba(42, 102, 171, 0.52)"
          style={styles.input}
          multiline
          maxLength={220}
        />
      </View>

      {selectedMediaType === "image" && selectedMediaUri ? (
        <View style={styles.mediaPreviewWrap}>
          <Image
            source={resolveImageSource(selectedMediaUri)}
            style={styles.mediaPreviewImage}
            resizeMode="cover"
          />

          <Pressable
            accessibilityRole="button"
            onPress={clearSelectedMedia}
            style={({ pressed }) => [styles.removeMediaButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={colors.white} name="close" size={16} />
          </Pressable>
        </View>
      ) : null}

      {selectedMediaType === "video" && selectedMediaUri ? (
        <View style={styles.videoPreviewWrap}>
          <View style={styles.videoPreviewInfo}>
            <MaterialIcons
              color={colors.dashboardBottomIconActive}
              name="videocam"
              size={19}
            />
            <Text style={styles.videoPreviewText}>Video attached</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={clearSelectedMedia}
            style={({ pressed }) => [styles.videoRemoveButton, pressed && styles.pressed]}
          >
            <MaterialIcons
              color={colors.dashboardBottomIconActive}
              name="close"
              size={16}
            />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <View style={styles.mediaActionGroup}>
          {MEDIA_ACTIONS.map((item) => {
            const isSelected =
              (item.action === "image" && selectedMediaType === "image") ||
              (item.action === "video" && selectedMediaType === "video");

            return (
              <Pressable
                key={item.action}
                accessibilityRole="button"
                onPress={() => handlePressMediaAction(item.action)}
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
      alignItems: "flex-start",
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
    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 90,
      borderRadius: 21,
      backgroundColor: "#EDEDEF",
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      textAlignVertical: "top",
    },
    mediaPreviewWrap: {
      marginTop: 10,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      position: "relative",
    },
    mediaPreviewImage: {
      width: "100%",
      height: 152,
      backgroundColor: "rgba(44, 110, 184, 0.12)",
    },
    removeMediaButton: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(29, 78, 136, 0.92)",
    },
    videoPreviewWrap: {
      marginTop: 10,
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
    actionsRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
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
    postButton: {
      height: 34,
      minWidth: 86,
      borderRadius: 17,
      paddingHorizontal: 18,
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
