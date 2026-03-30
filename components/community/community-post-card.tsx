import { PostActionRow } from "@/components/community/post-action-row";
import { VerifiedBadge } from "@/components/community/verified-badge";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  resolveImageSource,
  resolveOptionalImageSource,
} from "@/features/community/community.data";
import type { CommunityPost } from "@/features/community/community.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const postBodyText = [post.caption, hashtagsText].filter(Boolean).join(" ").trim();
  const hasBodyContent = Boolean(postBodyText);
  const avatarSource = resolveOptionalImageSource(post.userAvatar);
  const postImages = post.images ?? [];
  const hasVideo = Boolean(post.videoUri);
  const hasSingleImage = postImages.length === 1;
  const hasMultipleImages = postImages.length > 1;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {avatarSource ? (
          <Image
            source={avatarSource}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.avatarFallback}>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="person"
              size={24}
            />
          </View>
        )}

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
          <Text style={styles.caption}>{postBodyText}</Text>
        </View>
      ) : null}

      {hasVideo ? (
        <View style={styles.videoPreview}>
          <MaterialIcons
            color={colors.white}
            name="play-circle-filled"
            size={38}
          />
          <Text style={styles.videoLabel}>Video post</Text>
        </View>
      ) : null}

      {hasSingleImage ? (
        <Image
          source={resolveImageSource(postImages[0])}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}

      {hasMultipleImages ? (
        <View style={styles.multiImageWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.multiImageContent}
          >
            {postImages.map((image, index) => (
              <Image
                key={`${post.id}-image-${index}`}
                source={resolveImageSource(image)}
                style={styles.multiImage}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          <Text style={styles.multiImageCount}>
            {postImages.length} photos
          </Text>
        </View>
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
    avatarFallback: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
      alignItems: "center",
      justifyContent: "center",
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
    multiImageWrap: {
      width: "100%",
      paddingTop: 10,
      paddingBottom: 8,
    },
    multiImageContent: {
      paddingHorizontal: 10,
      gap: 8,
    },
    multiImage: {
      width: 230,
      height: 168,
      borderRadius: 10,
      backgroundColor: "rgba(44, 110, 184, 0.12)",
    },
    multiImageCount: {
      marginTop: 6,
      paddingHorizontal: 14,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "700",
      opacity: 0.84,
    },
  });
