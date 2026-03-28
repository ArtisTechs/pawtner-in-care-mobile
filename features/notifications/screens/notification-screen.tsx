import { NotificationCard } from "@/components/notifications/notification-card";
import { NotificationTabs } from "@/components/notifications/notification-tabs";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  NOTIFICATION_ASSETS,
  NOTIFICATION_MOCK_DATA,
} from "@/features/notifications/notifications.data";
import type {
  NotificationFilterKey,
  NotificationItem,
} from "@/features/notifications/notifications.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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

export default function NotificationScreen() {
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
  const [activeTab, setActiveTab] = useState<NotificationFilterKey>("updates");
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    () => NOTIFICATION_MOCK_DATA,
  );

  const visibleNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications;
  }, [activeTab, notifications]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handlePressNotification = (item: NotificationItem) => {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === item.id
          ? {
              ...notification,
              isRead: true,
            }
          : notification,
      ),
    );

    if (item.type === "sos") {
      router.push("/sos/waiting");
      return;
    }

    if (item.type === "location") {
      router.push("/sos/tracker");
      return;
    }

    if (item.type === "checkout") {
      router.push("/donations/listing");
      return;
    }

    if (item.type === "health") {
      router.push("/veterinary-clinics");
      return;
    }

    if (item.type === "achievement") {
      router.push("/profile");
      return;
    }

    // TODO: route appointment notification to the dedicated appointments screen once the flow is available.
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.loginCardBackground}
      />

      <View
        style={[
          styles.contentWrap,
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
              source={NOTIFICATION_ASSETS.backIcon}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Text style={styles.headerTitle}>NOTIFICATION</Text>
        </View>

        <View style={styles.tabsWrap}>
          <NotificationTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        </View>

        <FlatList
          data={visibleNotifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={handlePressNotification}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.cardGap} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No unread notifications.</Text>
            </View>
          }
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + 20,
            },
          ]}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.loginCardBackground,
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
      paddingHorizontal: 12,
    },
    headerContent: {
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 0,
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
    headerTitle: {
      fontFamily: DisplayFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: 36,
      lineHeight: 36,
      letterSpacing: 0.6,
      textAlign: "center",
    },
    tabsWrap: {
      marginTop: 12,
      marginBottom: 10,
      paddingHorizontal: 2,
    },
    listContent: {
      paddingTop: 2,
      paddingHorizontal: 2,
      flexGrow: 1,
    },
    cardGap: {
      height: 10,
    },
    emptyState: {
      marginTop: 12,
      minHeight: 120,
      borderRadius: 14,
      backgroundColor: "rgba(255, 255, 255, 0.62)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
    },
    emptyStateText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    pressed: {
      opacity: 0.84,
    },
  });
