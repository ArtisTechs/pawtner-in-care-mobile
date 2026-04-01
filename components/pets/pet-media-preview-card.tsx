import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

type PetMediaPreviewCardProps = {
  videoUrl?: string;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const toCloudinaryMp4Url = (url: string) => {
  if (!/res\.cloudinary\.com/i.test(url)) {
    return null;
  }

  if (!/\/video\/upload\//i.test(url)) {
    return null;
  }

  const withFormatTransform = url.replace(/\/video\/upload\//i, "/video/upload/f_mp4/");

  return withFormatTransform.replace(/\.(webm|mov|mkv)(\?.*)?$/i, ".mp4$2");
};

const buildVideoHtml = (videoUrl: string) => {
  const normalizedVideoUrl = videoUrl.trim();
  const cloudinaryMp4Url = toCloudinaryMp4Url(normalizedVideoUrl);
  const primarySource = cloudinaryMp4Url ?? normalizedVideoUrl;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #0f1f33;
        overflow: hidden;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #0f1f33;
      }
    </style>
  </head>
  <body>
    <video controls playsinline preload="metadata">
      <source src="${escapeHtml(primarySource)}" type="video/mp4" />
      <source src="${escapeHtml(normalizedVideoUrl)}" type="video/webm" />
      <source src="${escapeHtml(normalizedVideoUrl)}" />
    </video>
  </body>
</html>`;
};

export function PetMediaPreviewCard({ videoUrl }: PetMediaPreviewCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const normalizedVideoUrl = videoUrl?.trim();
  const hasVideo = Boolean(normalizedVideoUrl);
  const videoHtml = normalizedVideoUrl ? buildVideoHtml(normalizedVideoUrl) : "";

  return (
    <View style={styles.card}>
      {hasVideo ? (
        <View style={styles.playerWrap}>
          <WebView
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            originWhitelist={["*"]}
            scrollEnabled={false}
            source={{ html: videoHtml }}
            style={styles.player}
          />
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No video URL</Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: "100%",
      borderRadius: 20,
      backgroundColor: colors.petDetailsSurface,
      overflow: "hidden",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    playerWrap: {
      width: "100%",
      aspectRatio: 3 / 4,
      backgroundColor: "#0f1f33",
    },
    player: {
      flex: 1,
      backgroundColor: "#0f1f33",
    },
    emptyState: {
      width: "100%",
      minHeight: 132,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(9, 28, 51, 0.2)",
    },
    emptyText: {
      color: colors.petDetailsTextSecondary,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "700",
    },
  });
