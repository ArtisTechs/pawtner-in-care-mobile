import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PostActionRowProps = {
  commentCount: number;
  likeCount: number;
  liked?: boolean;
  onPressComment: () => void;
  onPressLike: () => void;
};

export function PostActionRow({
  commentCount,
  likeCount,
  liked = false,
  onPressComment,
  onPressLike,
}: PostActionRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={onPressComment}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      >
        <MaterialIcons
          color={colors.dashboardBottomIcon}
          name="chat-bubble-outline"
          size={20}
        />
        <Text style={styles.count}>{commentCount}</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onPressLike}
        style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
      >
        <MaterialIcons
          color={liked ? colors.dashboardBottomIconActive : colors.dashboardBottomIcon}
          name={liked ? "favorite" : "favorite-border"}
          size={20}
        />
        <Text style={[styles.count, liked && styles.likedCount]}>{likeCount}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: 16,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: "rgba(29, 78, 136, 0.14)",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    count: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    likedCount: {
      color: colors.dashboardBottomIconActive,
    },
    pressed: {
      opacity: 0.82,
    },
  });
