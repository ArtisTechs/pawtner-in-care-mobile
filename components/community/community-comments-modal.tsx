import { VerifiedBadge } from "@/components/community/verified-badge";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { resolveOptionalImageSource } from "@/features/community/community.data";
import type {
  CommunityComment,
  CommunityImageSource,
} from "@/features/community/community.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import type { ListRenderItem } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CommunityCommentsModalProps = {
  comments: CommunityComment[];
  currentUserAvatar?: CommunityImageSource | null;
  draft: string;
  isLoading: boolean;
  isSubmitting: boolean;
  onChangeDraft: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  postOwnerName?: string;
  visible: boolean;
};

export function CommunityCommentsModal({
  comments,
  currentUserAvatar,
  draft,
  isLoading,
  isSubmitting,
  onChangeDraft,
  onClose,
  onSubmit,
  postOwnerName,
  visible,
}: CommunityCommentsModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const canSubmit = draft.trim().length > 0 && !isSubmitting;
  const composerAvatarSource = resolveOptionalImageSource(currentUserAvatar);

  const renderCommentItem: ListRenderItem<CommunityComment> = ({ item }) => {
    const avatarSource = resolveOptionalImageSource(item.userAvatar);

    return (
      <View style={styles.commentRow}>
        {avatarSource ? (
          <Image source={avatarSource} style={styles.commentAvatar} resizeMode="cover" />
        ) : (
          <View style={styles.commentAvatarFallback}>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="person"
              size={18}
            />
          </View>
        )}

        <View style={styles.commentBubble}>
          <View style={styles.commentNameRow}>
            <Text style={styles.commentName}>{item.userName}</Text>
            {item.isVerified ? <VerifiedBadge /> : null}
          </View>
          <Text style={styles.commentContent}>{item.content}</Text>
          <Text style={styles.commentMeta}>{item.createdAtLabel}</Text>
        </View>
      </View>
    );
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalRoot}
      >
        <View style={styles.overlay}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close comments"
            onPress={onClose}
            style={styles.backdrop}
          />

          <View
            style={[
              styles.sheet,
              {
                paddingBottom: Math.max(insets.bottom, 10),
              },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <View style={styles.headerTextWrap}>
                <Text style={styles.headerTitle}>Comments</Text>
                <Text style={styles.headerSubtitle}>
                  {postOwnerName ? `On ${postOwnerName}'s post` : "Community discussion"}
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close comments"
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
              >
                <MaterialIcons
                  color={colors.dashboardBottomIcon}
                  name="close"
                  size={22}
                />
              </Pressable>
            </View>

            <View style={styles.contentWrap}>
              {isLoading ? (
                <View style={styles.centerWrap}>
                  <ActivityIndicator
                    color={colors.dashboardBottomIconActive}
                    size="small"
                  />
                  <Text style={styles.centerText}>Loading comments...</Text>
                </View>
              ) : comments.length > 0 ? (
                <FlatList
                  data={comments}
                  keyExtractor={(item) => item.id}
                  renderItem={renderCommentItem}
                  ItemSeparatorComponent={() => <View style={styles.commentGap} />}
                  contentContainerStyle={styles.commentListContent}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.centerWrap}>
                  <Text style={styles.centerText}>No comments yet. Be the first one.</Text>
                </View>
              )}
            </View>

            <View style={styles.composerRow}>
              {composerAvatarSource ? (
                <Image
                  source={composerAvatarSource}
                  style={styles.composerAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.composerAvatarFallback}>
                  <MaterialIcons
                    color={colors.dashboardBottomIcon}
                    name="person"
                    size={20}
                  />
                </View>
              )}

              <View style={styles.composerInputWrap}>
                <TextInput
                  autoCorrect
                  editable={!isSubmitting}
                  onChangeText={onChangeDraft}
                  placeholder="Write a comment..."
                  placeholderTextColor="rgba(42, 102, 171, 0.56)"
                  style={styles.composerInput}
                  value={draft}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send comment"
                disabled={!canSubmit}
                onPress={onSubmit}
                style={({ pressed }) => [
                  styles.sendButton,
                  !canSubmit && styles.sendButtonDisabled,
                  pressed && canSubmit && styles.pressed,
                ]}
              >
                <MaterialIcons
                  color={colors.white}
                  name={isSubmitting ? "hourglass-top" : "send"}
                  size={18}
                />
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(8, 24, 44, 0.48)",
    },
    centerText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "700",
      textAlign: "center",
      opacity: 0.82,
    },
    centerWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 20,
      paddingVertical: 22,
    },
    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(44, 110, 184, 0.12)",
    },
    commentAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
      marginTop: 2,
    },
    commentAvatarFallback: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
      marginTop: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    commentBubble: {
      flex: 1,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 8,
      backgroundColor: "rgba(44, 110, 184, 0.12)",
      borderWidth: 1,
      borderColor: "rgba(44, 110, 184, 0.16)",
      gap: 4,
    },
    commentContent: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "500",
    },
    commentGap: {
      height: 8,
    },
    commentListContent: {
      paddingBottom: 4,
    },
    commentMeta: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      opacity: 0.72,
    },
    commentName: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: "900",
    },
    commentNameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    commentRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    composerAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
    },
    composerAvatarFallback: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(44, 110, 184, 0.14)",
      alignItems: "center",
      justifyContent: "center",
    },
    composerInput: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
    },
    composerInputWrap: {
      flex: 1,
      minHeight: 40,
      borderRadius: 999,
      backgroundColor: "rgba(44, 110, 184, 0.1)",
      borderWidth: 1,
      borderColor: "rgba(44, 110, 184, 0.22)",
      justifyContent: "center",
    },
    composerRow: {
      marginTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(29, 78, 136, 0.18)",
      paddingTop: 10,
      paddingHorizontal: 2,
    },
    contentWrap: {
      minHeight: 180,
      maxHeight: 410,
    },
    handle: {
      alignSelf: "center",
      width: 48,
      height: 5,
      borderRadius: 999,
      backgroundColor: "rgba(44, 110, 184, 0.28)",
      marginBottom: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
      gap: 10,
    },
    headerSubtitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "700",
      opacity: 0.74,
    },
    headerTextWrap: {
      flex: 1,
      gap: 2,
    },
    headerTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
    },
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    pressed: {
      opacity: 0.84,
    },
    sendButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.dashboardBottomIconActive,
    },
    sendButtonDisabled: {
      opacity: 0.42,
    },
    sheet: {
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      paddingHorizontal: 14,
      paddingTop: 10,
      backgroundColor: "#D7E6F7",
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: "rgba(38, 96, 163, 0.28)",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 7,
      elevation: 8,
    },
  });
