import { CommunityComposer } from "@/components/community/community-composer";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { DashboardBottomNavbar } from "@/components/navigation/dashboard-bottom-navbar";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  COMMUNITY_ASSETS,
  COMMUNITY_CURRENT_USER,
  createLocalCommunityPost,
  getCommunityPosts,
} from "@/features/community/community.data";
import type {
  CommunityPost,
  SubmitCommunityPostInput,
} from "@/features/community/community.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const NAVBAR_RESERVED_SPACE = 84;

export default function CommunityScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const feedListRef = useRef<FlatList<CommunityPost>>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(() => getCommunityPosts());

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleSubmitPost = useCallback((input: SubmitCommunityPostInput) => {
    const trimmedCaption = input.caption.trim();
    const hasMedia = Boolean(input.mediaUri && input.mediaType);

    if (!trimmedCaption && !hasMedia) {
      return;
    }

    const newPost = createLocalCommunityPost({
      caption: trimmedCaption,
      userName: COMMUNITY_CURRENT_USER.name,
      userAvatar: COMMUNITY_CURRENT_USER.avatar,
      isVerified: COMMUNITY_CURRENT_USER.isVerified,
      mediaUri: input.mediaUri,
      mediaType: input.mediaType,
    });

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    requestAnimationFrame(() => {
      feedListRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });
  }, []);

  const handlePressShowNewPosts = useCallback(() => {
    feedListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, []);

  const handleToggleLike = useCallback((postId: string) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        const nextLiked = !post.liked;

        return {
          ...post,
          liked: nextLiked,
          likeCount: nextLiked
            ? post.likeCount + 1
            : Math.max(0, post.likeCount - 1),
        };
      }),
    );
  }, []);

  const handlePressComment = useCallback((postId: string) => {
    void postId;
    // TODO: route to comments screen once community comments flow exists.
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View
        style={[
          styles.headerWrap,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Pressable
            accessibilityRole="button"
            onPress={handleBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Image
              source={COMMUNITY_ASSETS.backIcon}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Image
            source={COMMUNITY_ASSETS.titleImage}
            style={styles.headerTitleImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.feedWrap}>
        <FlatList
          ref={feedListRef}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CommunityPostCard
              post={item}
              onPressComment={handlePressComment}
              onPressLike={handleToggleLike}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.postGap} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <CommunityComposer
                avatar={COMMUNITY_CURRENT_USER.avatar}
                onSubmitPost={handleSubmitPost}
              />

              <Pressable
                accessibilityRole="button"
                onPress={handlePressShowNewPosts}
                style={({ pressed }) => [
                  styles.newPostsButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.newPostsText}>Show 21 new posts</Text>
              </Pressable>
            </View>
          }
          contentContainerStyle={[
            styles.feedContent,
            {
              paddingBottom: NAVBAR_RESERVED_SPACE + insets.bottom + 12,
            },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <DashboardBottomNavbar activeKey="community" />
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.loginCardBackground,
      alignItems: "center",
    },
    headerWrap: {
      width: "100%",
      alignItems: "center",
      backgroundColor: colors.loginCardBackground,
      paddingBottom: 10,
    },
    headerContent: {
      width: contentWidth,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      paddingHorizontal: 24,
    },
    backButton: {
      position: "absolute",
      left: 24,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.dashboardBottomIcon,
    },
    headerTitleImage: {
      width: 180,
      height: 30,
    },
    feedWrap: {
      flex: 1,
      width: contentWidth,
      backgroundColor: colors.loginCardBackground,
    },
    feedContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
    },
    listHeader: {
      marginBottom: 10,
    },
    newPostsButton: {
      alignSelf: "center",
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    newPostsText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
    },
    postGap: {
      height: 12,
    },
    pressed: {
      opacity: 0.82,
    },
  });
