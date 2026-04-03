import { CommunityComposer } from "@/components/community/community-composer";
import { CommunityCommentsModal } from "@/components/community/community-comments-modal";
import { CommunityImagePreviewModal } from "@/components/community/community-image-preview-modal";
import { CommunityPostCard } from "@/components/community/community-post-card";
import { CommunityPostSkeletonCard } from "@/components/community/community-post-skeleton-card";
import { DashboardBottomNavbar } from "@/components/navigation/dashboard-bottom-navbar";
import { AppToast } from "@/components/ui/app-toast";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  COMMUNITY_CURRENT_USER,
  mapCommunityCommentToViewModel,
  mapCommunityPostToViewModel,
  toRequestHashtags,
} from "@/features/community/community.data";
import type {
  CommunityComment,
  CommunityImageSource,
  CommunityPost,
  SubmitCommunityPostInput,
} from "@/features/community/community.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import {
  communityService,
  type CommunityCommentApiItem,
  type CommunityCreatePostMediaPayload,
} from "@/services/community/community.service";
import { cloudinaryService } from "@/services/media/cloudinary.service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const NAVBAR_RESERVED_SPACE = 84;

const DEFAULT_FEED_SIZE = 20;
const SKELETON_PLACEHOLDER_COUNT = 3;

const resolveDisplayName = (
  firstName?: string,
  middleName?: string | null,
  lastName?: string,
) => {
  const name = [firstName?.trim(), middleName?.trim(), lastName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || COMMUNITY_CURRENT_USER.name;
};

const mergeUniquePosts = (currentPosts: CommunityPost[], incomingPosts: CommunityPost[]) => {
  const postById = new Map(currentPosts.map((post) => [post.id, post]));

  for (const post of incomingPosts) {
    postById.set(post.id, post);
  }

  return Array.from(postById.values());
};

const hasNextPageFromPagination = (pagination: {
  ignorePagination: boolean;
  last: boolean;
  page: number;
  totalPages: number;
}) => {
  if (pagination.ignorePagination) {
    return false;
  }

  if (pagination.totalPages > 0) {
    return pagination.page < pagination.totalPages - 1;
  }

  return !pagination.last;
};

const isActivePost = (post: CommunityPost) =>
  !post.status || post.status === "ACTIVE";

const isActiveComment = (comment: CommunityComment) =>
  !comment.status || comment.status === "ACTIVE";

export default function CommunityScreen() {
  const { isHydrating, session } = useAuth();
  const { hideToast, showToast, toast } = useToast();
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
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [currentFeedPage, setCurrentFeedPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [likeSyncingPostIds, setLikeSyncingPostIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const [commentsByPostId, setCommentsByPostId] = useState<
    Record<string, CommunityComment[]>
  >({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    images: CommunityImageSource[];
    initialIndex: number;
  } | null>(null);
  const pullHintTranslateY = useSharedValue(0);
  const currentUserId = session?.user.id?.trim() ?? "";
  const currentUserAvatar = session?.user.profilePicture?.trim() ?? "";
  const currentUserName = resolveDisplayName(
    session?.user.firstName,
    session?.user.middleName,
    session?.user.lastName,
  );

  const mapPost = useCallback(
    (post: Parameters<typeof mapCommunityPostToViewModel>[0]["post"]) =>
      mapCommunityPostToViewModel({
        currentUserAvatar,
        currentUserId,
        currentUserIsVerified: COMMUNITY_CURRENT_USER.isVerified,
        currentUserName,
        post,
      }),
    [currentUserAvatar, currentUserId, currentUserName],
  );

  const mapComment = useCallback(
    (comment: CommunityCommentApiItem) =>
      mapCommunityCommentToViewModel({
        comment,
        currentUserAvatar,
        currentUserId,
        currentUserIsVerified: COMMUNITY_CURRENT_USER.isVerified,
        currentUserName,
      }),
    [currentUserAvatar, currentUserId, currentUserName],
  );

  const activeCommentPost = useMemo(
    () =>
      activeCommentPostId
        ? posts.find((post) => post.id === activeCommentPostId) ?? null
        : null,
    [activeCommentPostId, posts],
  );
  const activeComments = useMemo(
    () => (activeCommentPost ? commentsByPostId[activeCommentPost.id] ?? [] : []),
    [activeCommentPost, commentsByPostId],
  );

  const isLikeSyncing = useCallback(
    (postId: string) => likeSyncingPostIds.has(postId),
    [likeSyncingPostIds],
  );

  const setLikeSyncingState = useCallback((postId: string, syncing: boolean) => {
    setLikeSyncingPostIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (syncing) {
        nextIds.add(postId);
      } else {
        nextIds.delete(postId);
      }

      return nextIds;
    });
  }, []);

  const loadPosts = useCallback(
    async (options?: { append?: boolean; isRefresh?: boolean; page?: number }) => {
      if (!currentUserId) {
        setPosts([]);
        setIsFeedLoading(false);
        setIsRefreshing(false);
        setIsLoadingMorePosts(false);
        setCurrentFeedPage(0);
        setHasNextPage(false);
        return;
      }

      const page = Math.max(0, options?.page ?? 0);
      const shouldAppend = options?.append ?? false;
      const isRefresh = options?.isRefresh ?? false;

      if (shouldAppend) {
        setIsLoadingMorePosts(true);
      } else if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsFeedLoading(true);
      }

      try {
        const response = await communityService.getPosts({
          currentUserId,
          query: {
            page,
            size: DEFAULT_FEED_SIZE,
            sortBy: "createdAt",
            sortDir: "desc",
          },
          token: session?.accessToken,
        });
        console.log("[community] Feed fetch response", {
          requestedPage: page,
          fetchedItems: response.items.length,
          pagination: response.pagination,
          response,
        });
        const incomingPosts = response.items
          .map(mapPost)
          .filter((post) => isActivePost(post));

        setPosts((currentPosts) => {
          if (shouldAppend) {
            return mergeUniquePosts(currentPosts, incomingPosts);
          }

          return incomingPosts;
        });
        setCurrentFeedPage(response.pagination.page);
        setHasNextPage(hasNextPageFromPagination(response.pagination));
      } catch (error) {
        if (!shouldAppend) {
          setPosts([]);
          setCurrentFeedPage(0);
          setHasNextPage(false);
        }

        showToast(getErrorMessage(error, "Unable to load community feed."), "error");
      } finally {
        if (shouldAppend) {
          setIsLoadingMorePosts(false);
        } else if (isRefresh) {
          setIsRefreshing(false);
        } else {
          setIsFeedLoading(false);
        }
      }
    },
    [currentUserId, mapPost, session?.accessToken, showToast],
  );

  useEffect(() => {
    if (isHydrating) {
      setIsFeedLoading(true);
      return;
    }

    void loadPosts({ page: 0 });
  }, [isHydrating, loadPosts]);

  const handleRefresh = useCallback(async () => {
    if (isHydrating || isRefreshing || !currentUserId) {
      return;
    }

    await loadPosts({ isRefresh: true, page: 0 });
  }, [currentUserId, isHydrating, isRefreshing, loadPosts]);

  const handleLoadMorePosts = useCallback(() => {
    if (
      isHydrating ||
      isFeedLoading ||
      isRefreshing ||
      isLoadingMorePosts ||
      !currentUserId ||
      !hasNextPage
    ) {
      return;
    }

    void loadPosts({
      append: true,
      page: currentFeedPage + 1,
    });
  }, [
    currentFeedPage,
    currentUserId,
    hasNextPage,
    isFeedLoading,
    isHydrating,
    isLoadingMorePosts,
    isRefreshing,
    loadPosts,
  ]);

  const handleSubmitPost = useCallback(
    async (input: SubmitCommunityPostInput) => {
      const trimmedCaption = input.caption.trim();
      const hasMedia = input.photos.length > 0 || Boolean(input.video);

      if (!trimmedCaption && !hasMedia) {
        throw new Error("A post needs text or media.");
      }

      if (!currentUserId) {
        const error = new Error("You need to be signed in to create a post.");
        showToast(error.message, "error");
        throw error;
      }

      setIsSubmittingPost(true);

      try {
        const mediaPayload: CommunityCreatePostMediaPayload[] = [];

        if (input.photos.length > 0) {
          const uploadedPhotoUrls = await Promise.all(
            input.photos.map((photo) =>
              cloudinaryService.uploadImage({
                fileName: photo.fileName,
                mimeType: photo.mimeType,
                uri: photo.uri,
              }),
            ),
          );

          uploadedPhotoUrls.forEach((url, index) => {
            mediaPayload.push({
              mediaType: "IMAGE",
              mediaUrl: url,
              sortOrder: index,
            });
          });
        }

        if (input.video) {
          const uploadedVideoUrl = await cloudinaryService.uploadVideo({
            fileName: input.video.fileName,
            mimeType: input.video.mimeType,
            uri: input.video.uri,
          });

          mediaPayload.push({
            mediaType: "VIDEO",
            mediaUrl: uploadedVideoUrl,
            sortOrder: mediaPayload.length,
          });
        }

        const hashtags = toRequestHashtags(trimmedCaption);
        const createdPost = await communityService.createPost({
          currentUserId,
          payload: {
            content: trimmedCaption || null,
            hashtags: hashtags.length ? hashtags : undefined,
            media: mediaPayload.length ? mediaPayload : undefined,
            visibility: "PUBLIC",
          },
          token: session?.accessToken,
        });
        const mappedPost = mapPost(createdPost);

        setPosts((currentPosts) => {
          const nextPosts = currentPosts.filter((post) => post.id !== mappedPost.id);
          return [mappedPost, ...nextPosts];
        });
        setCurrentFeedPage(0);
        showToast("Post shared.");
        requestAnimationFrame(() => {
          feedListRef.current?.scrollToOffset({ animated: true, offset: 0 });
        });
      } catch (error) {
        showToast(getErrorMessage(error, "Unable to publish post."), "error");
        throw error;
      } finally {
        setIsSubmittingPost(false);
      }
    },
    [currentUserId, mapPost, session?.accessToken, showToast],
  );

  const handlePressRefreshFeed = useCallback(() => {
    void handleRefresh();
  }, [handleRefresh]);

  useEffect(() => {
    cancelAnimation(pullHintTranslateY);

    pullHintTranslateY.value = withRepeat(
      withSequence(
        withTiming(4, { duration: 420 }),
        withTiming(0, { duration: 420 }),
      ),
      -1,
      false,
    );

    return () => {
      cancelAnimation(pullHintTranslateY);
      pullHintTranslateY.value = 0;
    };
  }, [pullHintTranslateY]);

  const pullHintIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pullHintTranslateY.value }],
  }));

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!currentUserId || isLikeSyncing(postId)) {
        return;
      }

      const targetPost = posts.find((post) => post.id === postId);

      if (!targetPost) {
        return;
      }

      const previousLiked = Boolean(targetPost.liked);
      const previousLikeCount = targetPost.likeCount;
      const nextLiked = !previousLiked;

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: nextLiked,
                likeCount: nextLiked
                  ? post.likeCount + 1
                  : Math.max(0, post.likeCount - 1),
              }
            : post,
        ),
      );
      setLikeSyncingState(postId, true);

      try {
        const result = nextLiked
          ? await communityService.likePost({
              currentUserId,
              postId,
              token: session?.accessToken,
            })
          : await communityService.unlikePost({
              currentUserId,
              postId,
              token: session?.accessToken,
            });

        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: result.liked,
                  likeCount: result.likeCount ?? post.likeCount,
                }
              : post,
          ),
        );
      } catch (error) {
        setPosts((currentPosts) =>
          currentPosts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  liked: previousLiked,
                  likeCount: previousLikeCount,
                }
              : post,
          ),
        );
        showToast(getErrorMessage(error, "Unable to update like."), "error");
      } finally {
        setLikeSyncingState(postId, false);
      }
    },
    [
      currentUserId,
      isLikeSyncing,
      posts,
      session?.accessToken,
      setLikeSyncingState,
      showToast,
    ],
  );

  const loadCommentsForPost = useCallback(
    async (postId: string, options?: { force?: boolean }) => {
      if (!currentUserId || !postId) {
        return;
      }

      if (!options?.force && commentsByPostId[postId]) {
        return;
      }

      setIsCommentsLoading(true);

      try {
        const response = await communityService.getComments({
          currentUserId,
          postId,
          query: {
            ignorePagination: true,
            sortBy: "createdAt",
            sortDir: "asc",
          },
          token: session?.accessToken,
        });
        const mappedComments = response.items
          .map(mapComment)
          .filter((comment) => isActiveComment(comment));

        setCommentsByPostId((currentComments) => ({
          ...currentComments,
          [postId]: mappedComments,
        }));
      } catch (error) {
        showToast(getErrorMessage(error, "Unable to load comments."), "error");
      } finally {
        setIsCommentsLoading(false);
      }
    },
    [commentsByPostId, currentUserId, mapComment, session?.accessToken, showToast],
  );

  const handleCloseComments = useCallback(() => {
    setActiveCommentPostId(null);
    setCommentDraft("");
    setIsCommentsLoading(false);
    setIsSubmittingComment(false);
  }, []);

  const handlePressComment = useCallback(
    (postId: string) => {
      if (!currentUserId) {
        showToast("You need to be signed in to comment.", "error");
        return;
      }

      setActiveCommentPostId(postId);
      setCommentDraft("");
      void loadCommentsForPost(postId);
    },
    [currentUserId, loadCommentsForPost, showToast],
  );

  const handleSubmitComment = useCallback(async () => {
    if (!activeCommentPost || !currentUserId || isSubmittingComment) {
      return;
    }

    const trimmedDraft = commentDraft.trim();

    if (!trimmedDraft) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const createdComment = await communityService.createComment({
        currentUserId,
        postId: activeCommentPost.id,
        payload: {
          content: trimmedDraft,
        },
        token: session?.accessToken,
      });
      const mappedComment = mapComment(createdComment);

      setCommentsByPostId((currentComments) => {
        const postComments = currentComments[activeCommentPost.id] ?? [];
        const nextComments = postComments.filter(
          (comment) => comment.id !== mappedComment.id,
        );

        return {
          ...currentComments,
          [activeCommentPost.id]: [...nextComments, mappedComment],
        };
      });
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === activeCommentPost.id
            ? {
                ...post,
                commentCount: post.commentCount + 1,
              }
            : post,
        ),
      );
      setCommentDraft("");
    } catch (error) {
      showToast(getErrorMessage(error, "Unable to post comment."), "error");
    } finally {
      setIsSubmittingComment(false);
    }
  }, [
    activeCommentPost,
    commentDraft,
    currentUserId,
    isSubmittingComment,
    mapComment,
    session?.accessToken,
    showToast,
  ]);

  const handlePressImage = useCallback(
    (images: CommunityImageSource[], imageIndex: number) => {
      if (!images.length) {
        return;
      }

      setPreviewImage({
        images,
        initialIndex: Math.max(0, imageIndex),
      });
    },
    [],
  );

  const handleCloseImagePreview = useCallback(() => {
    setPreviewImage(null);
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.loginCardBackground}
      />

      <View
        style={[
          styles.headerWrap,
          {
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitleText}>COMMUNITY</Text>
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
              onPressImage={handlePressImage}
              onPressLike={handleToggleLike}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.postGap} />}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <CommunityComposer
                avatar={currentUserAvatar}
                isSubmitting={isSubmittingPost}
                onSubmitPost={handleSubmitPost}
              />

              <Pressable
                accessibilityRole="button"
                onPress={handlePressRefreshFeed}
                style={({ pressed }) => [
                  styles.newPostsButton,
                  (pressed || isRefreshing) && styles.pressed,
                ]}
              >
                <View style={styles.newPostsButtonContent}>
                  <Animated.View style={pullHintIconAnimatedStyle}>
                    <MaterialIcons
                      color={colors.dashboardBottomIconActive}
                      name="keyboard-arrow-down"
                      size={17}
                    />
                  </Animated.View>

                  <Text style={styles.newPostsText}>
                    {isRefreshing ? "Refreshing..." : "Pull down to refresh"}
                  </Text>
                </View>
              </Pressable>
            </View>
          }
          ListEmptyComponent={
            isFeedLoading ? (
              <View style={styles.skeletonListWrap}>
                {Array.from({ length: SKELETON_PLACEHOLDER_COUNT }).map((_, index) => (
                  <CommunityPostSkeletonCard key={`community-skeleton-${index}`} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No posts yet.</Text>
              </View>
            )
          }
          ListFooterComponent={
            isLoadingMorePosts ? (
              <View style={styles.loadMoreFooter}>
                <ActivityIndicator
                  color={colors.dashboardBottomIconActive}
                  size="small"
                />
                <Text style={styles.loadMoreText}>Loading more posts...</Text>
              </View>
            ) : null
          }
          onEndReached={handleLoadMorePosts}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              colors={[colors.dashboardBottomIconActive]}
              onRefresh={handleRefresh}
              progressBackgroundColor={colors.dashboardSectionCardBackground}
              refreshing={isRefreshing}
              tintColor={colors.dashboardBottomIconActive}
            />
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

      <CommunityCommentsModal
        comments={activeComments}
        currentUserAvatar={currentUserAvatar}
        draft={commentDraft}
        isLoading={isCommentsLoading}
        isSubmitting={isSubmittingComment}
        onChangeDraft={setCommentDraft}
        onClose={handleCloseComments}
        onSubmit={() => {
          void handleSubmitComment();
        }}
        postOwnerName={activeCommentPost?.userName}
        visible={Boolean(activeCommentPost)}
      />
      <DashboardBottomNavbar activeKey="community" />
      <AppToast onDismiss={hideToast} toast={toast} />
      <FullScreenLoader
        absolute
        backgroundColor="rgba(10, 19, 35, 0.72)"
        subtitle="Uploading media and publishing your post..."
        visible={isSubmittingPost}
      />
      <CommunityImagePreviewModal
        images={previewImage?.images ?? []}
        initialIndex={previewImage?.initialIndex}
        onClose={handleCloseImagePreview}
        visible={Boolean(previewImage)}
      />
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
) =>
  StyleSheet.create({
    emptyText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      opacity: 0.86,
    },
    emptyWrap: {
      marginTop: 18,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingVertical: 18,
    },
    feedContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      flexGrow: 1,
    },
    feedWrap: {
      flex: 1,
      width: contentWidth,
      backgroundColor: colors.loginCardBackground,
    },
    headerContent: {
      width: contentWidth,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    headerTitleText: {
      fontFamily: DisplayFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: 32,
      lineHeight: 32,
      letterSpacing: 0.6,
      textAlign: "center",
    },
    headerWrap: {
      width: "100%",
      alignItems: "center",
      backgroundColor: colors.loginCardBackground,
      paddingBottom: 10,
    },
    listHeader: {
      marginBottom: 10,
    },
    loadMoreFooter: {
      paddingTop: 8,
      paddingBottom: 10,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    loadMoreText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      opacity: 0.82,
    },
    newPostsButton: {
      alignSelf: "center",
      marginTop: 12,
      paddingHorizontal: 2,
      paddingVertical: 2,
    },
    newPostsButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    newPostsText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "700",
    },
    postGap: {
      height: 12,
    },
    pressed: {
      opacity: 0.82,
    },
    screen: {
      flex: 1,
      backgroundColor: colors.loginCardBackground,
      alignItems: "center",
    },
    skeletonListWrap: {
      marginTop: 10,
      gap: 12,
      paddingBottom: 8,
    },
  });
