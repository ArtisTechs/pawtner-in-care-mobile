import { NotificationIconBadge } from "@/components/notifications/notification-icon-badge";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { NotificationItem } from "@/features/notifications/notifications.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type NotificationCardProps = {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
};

export function NotificationCard({
  notification,
  onPress,
}: NotificationCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(notification)}
      style={({ pressed }) => [styles.cardPressable, pressed && styles.pressed]}
    >
      <View style={[styles.card, { shadowColor: colors.dashboardShadow }]}>
        <View style={styles.row}>
          <NotificationIconBadge iconName={notification.iconName} />

          <View style={styles.content}>
            <Text style={styles.message}>{notification.message}</Text>

            <View style={styles.timeRow}>
              <MaterialIcons color="#9ABCE2" name="access-time" size={16} />
              <Text style={styles.timeText}>{notification.relativeTime}</Text>
            </View>
          </View>
        </View>

        {!notification.isRead ? <View style={styles.unreadDot} /> : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    cardPressable: {
      borderRadius: 12,
    },
    card: {
      borderRadius: 12,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 12,
      paddingVertical: 12,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.16,
      shadowRadius: 6,
      elevation: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    content: {
      flex: 1,
    },
    message: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "800",
    },
    timeRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 3,
    },
    timeText: {
      fontFamily: RoundedFontFamily,
      color: "#9ABCE2",
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    unreadDot: {
      position: "absolute",
      right: 10,
      top: 16,
      width: 12,
      height: 12,
      borderRadius: 999,
      backgroundColor: colors.loginHeaderGradientEnd,
    },
    pressed: {
      opacity: 0.9,
    },
  });
