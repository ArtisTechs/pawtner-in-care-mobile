import { PostActionRow } from "@/components/community/post-action-row";
import { VerifiedBadge } from "@/components/community/verified-badge";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  resolveImageSource,
} from "@/features/community/community.data";
import type { CommunityPost } from "@/features/community/community.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type CommunityPostCardProps = {
  post: CommunityPost;
  onPressComment: (postId: string) => void;
  onPressLike: (postId: string) => void;
};

export function CommunityPostCard({
  post,
  onPressComment,
  onPressLike,
}: CommunityPostCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const hashtagsText = post.hashtags.join(" ");
  const hasBodyContent = Boolean(post.caption || hashtagsText);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Image
          source={resolveImageSource(post.userAvatar)}
          style={styles.avatar}
          resizeMode="cover"
        />

        <View style={styles.headerMeta}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{post.userName}</Text>
            {post.isVerified ? <VerifiedBadge /> : null}
          </View>
          <Text style={styles.timeLabel}>{post.createdAtLabel}</Text>
        </View>
      </View>

      {hasBodyContent ? (
        <View style={styles.body}>
          {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
          {hashtagsText ? <Text style={styles.hashtags}>{hashtagsText}</Text> : null}
        </View>
      ) : null}

      {post.mediaType === "video" ? (
        <View style={styles.videoPreview}>
          <MaterialIcons
            color={colors.white}
            name="play-circle-filled"
            size={38}
          />
          <Text style={styles.videoLabel}>Video post</Text>
        </View>
      ) : null}

      {post.image ? (
        <Image
          source={resolveImageSource(post.image)}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}

      <PostActionRow
        commentCount={post.commentCount}
        likeCount={post.likeCount}
        liked={post.liked}
        onPressComment={() => onPressComment(post.id)}
        onPressLike={() => onPressLike(post.id)}
      />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "#C7DAEE",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.16,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
    },
    headerMeta: {
      flex: 1,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    userName: {
      fontFamily: RoundedFontFamily,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
      color: colors.dashboardBottomIconActive,
    },
    timeLabel: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      fontSize: 8,
      lineHeight: 14,
      fontWeight: "700",
      color: colors.dashboardBottomIcon,
      opacity: 0.72,
    },
    body: {
      paddingTop: 10,
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    caption: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "500",
    },
    hashtags: {
      marginTop: 4,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
    },
    videoPreview: {
      width: "100%",
      minHeight: 170,
      backgroundColor: colors.dashboardBottomIconActive,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    videoLabel: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "800",
    },
    postImage: {
      width: "100%",
      aspectRatio: 1.58,
      backgroundColor: "rgba(44, 110, 184, 0.12)",
    },
  });
