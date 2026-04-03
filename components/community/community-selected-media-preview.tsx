import { Colors, RoundedFontFamily } from "@/constants/theme";
import { resolveImageSource } from "@/features/community/community.data";
import { buildCommunityVideoHtml } from "@/features/community/community-video";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type CommunitySelectedMediaPreviewProps = {
  onClearPhotos: () => void;
  onClearVideo: () => void;
  onRemovePhoto: (uri: string) => void;
  photoUris: string[];
  videoMimeType?: string | null;
  videoUri: string | null;
};

export function CommunitySelectedMediaPreview({
  onClearPhotos,
  onClearVideo,
  onRemovePhoto,
  photoUris,
  videoMimeType,
  videoUri,
}: CommunitySelectedMediaPreviewProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hasPhotos = photoUris.length > 0;
  const hasVideo = Boolean(videoUri?.trim());
  const videoHtml = useMemo(() => {
    const normalizedVideoUri = videoUri?.trim();

    if (!normalizedVideoUri) {
      return "";
    }

    return buildCommunityVideoHtml({
      videoMimeType,
      videoUri: normalizedVideoUri,
    });
  }, [videoMimeType, videoUri]);

  if (!hasPhotos && !hasVideo) {
    return null;
  }

  return (
    <View style={styles.container}>
      {hasPhotos ? (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selected photos ({photoUris.length})</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClearPhotos}
              style={({ pressed }) => [styles.clearAllButton, pressed && styles.pressed]}
            >
              <Text style={styles.clearAllText}>Clear all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoScrollerContent}
          >
            {photoUris.map((photoUri, index) => (
              <View key={`${photoUri}-${index}`} style={styles.photoCard}>
                <Image
                  source={resolveImageSource(photoUri)}
                  style={styles.photoImage}
                  resizeMode="cover"
                />

                <Pressable
                  accessibilityRole="button"
                  onPress={() => onRemovePhoto(photoUri)}
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
        </View>
      ) : null}

      {hasVideo && videoUri ? (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Selected video</Text>
            <Pressable
              accessibilityRole="button"
              onPress={onClearVideo}
              style={({ pressed }) => [styles.clearAllButton, pressed && styles.pressed]}
            >
              <Text style={styles.clearAllText}>Remove</Text>
            </Pressable>
          </View>

          <View style={styles.videoCard}>
            <WebView
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              allowFileAccess
              allowFileAccessFromFileURLs
              allowUniversalAccessFromFileURLs
              mixedContentMode="always"
              mediaPlaybackRequiresUserAction={false}
              originWhitelist={["*"]}
              scrollEnabled={false}
              source={{ html: videoHtml }}
              style={styles.videoPlayer}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    clearAllButton: {
      minHeight: 24,
      paddingHorizontal: 8,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    clearAllText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "800",
    },
    container: {
      gap: 8,
    },
    photoCard: {
      width: 90,
      height: 90,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "rgba(44, 110, 184, 0.12)",
      position: "relative",
    },
    photoImage: {
      width: "100%",
      height: "100%",
    },
    photoScrollerContent: {
      gap: 8,
      paddingVertical: 2,
    },
    pressed: {
      opacity: 0.82,
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
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    sectionTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "700",
      opacity: 0.92,
    },
    sectionWrap: {
      gap: 6,
    },
    videoCard: {
      width: "100%",
      borderRadius: 10,
      overflow: "hidden",
      aspectRatio: 16 / 9,
      backgroundColor: colors.dashboardBottomIconActive,
      borderWidth: 1,
      borderColor: "rgba(29, 78, 136, 0.2)",
    },
    videoPlayer: {
      flex: 1,
      backgroundColor: colors.dashboardBottomIconActive,
    },
  });
