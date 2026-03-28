import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  DASHBOARD_ASSETS,
  type DashboardBottomNavKey,
} from "@/features/dashboard/dashboard.data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DashboardBottomNavbarProps = {
  activeKey?: DashboardBottomNavKey;
};

type NavItem = {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  imageSize?: number;
  imageSource?: ImageSourcePropType;
  key: DashboardBottomNavKey;
};

const NAV_ITEMS: NavItem[] = [
  { key: "home", icon: "home-filled" },
  {
    key: "chat",
    icon: "chat-bubble-outline",
    imageSize: 24,
    imageSource: DASHBOARD_ASSETS.navChat,
  },
  {
    key: "community",
    icon: "public",
    imageSize: 24,
    imageSource: DASHBOARD_ASSETS.categoryCommunity,
  },
  { key: "profile", icon: "person-outline" },
];

const ROUTE_MAP: Partial<Record<DashboardBottomNavKey, Href>> = {
  home: "/(tabs)",
  chat: "/support",
  sos: "/sos",
  community: "/community",
  profile: "/profile",
};

export function DashboardBottomNavbar({
  activeKey = "home",
}: DashboardBottomNavbarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handlePress = (key: DashboardBottomNavKey) => {
    if (key === activeKey) {
      return;
    }

    const route = ROUTE_MAP[key];

    if (!route) {
      return;
    }

    if (key === "sos") {
      router.push(route);
      return;
    }

    router.replace(route);
  };

  const renderNavIcon = (item: NavItem) => {
    if (item.imageSource) {
      return (
        <Image
          source={item.imageSource}
          style={[
            styles.navImage,
            {
              width: item.imageSize ?? 24,
              height: item.imageSize ?? 24,
              opacity: activeKey === item.key ? 1 : 0.88,
            },
          ]}
          resizeMode="contain"
        />
      );
    }

    return (
      <MaterialIcons
        color={
          activeKey === item.key
            ? colors.dashboardBottomIconActive
            : colors.dashboardBottomIcon
        }
        name={item.icon}
        size={26}
      />
    );
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.barContent}>
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <View key={item.key} style={styles.navItemWrap}>
              <Pressable
                accessibilityRole="button"
                onPress={() => handlePress(item.key)}
                style={({ pressed }) => [
                  styles.navButton,
                  pressed && styles.pressed,
                ]}
              >
                {renderNavIcon(item)}
              </Pressable>
              <View
                style={[
                  styles.activeDot,
                  activeKey === item.key && styles.activeDotVisible,
                ]}
              />
            </View>
          ))}

          <View style={styles.sosWrap}>
            <Pressable
              accessibilityRole="button"
              onPress={() => handlePress("sos")}
              style={({ pressed }) => [
                styles.sosButton,
                activeKey === "sos" && styles.sosButtonActive,
                pressed && styles.sosPressed,
              ]}
            >
              <Text style={styles.sosText}>SOS</Text>
            </Pressable>
          </View>

          {NAV_ITEMS.slice(2).map((item) => (
            <View key={item.key} style={styles.navItemWrap}>
              <Pressable
                accessibilityRole="button"
                onPress={() => handlePress(item.key)}
                style={({ pressed }) => [
                  styles.navButton,
                  pressed && styles.pressed,
                ]}
              >
                {renderNavIcon(item)}
              </Pressable>
              <View
                style={[
                  styles.activeDot,
                  activeKey === item.key && styles.activeDotVisible,
                ]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: colors.dashboardBottomBarBackground,
    },
    bar: {
      width: "100%",
      height: 66,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: colors.dashboardBottomBarBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    barContent: {
      width: "100%",
      maxWidth: 420,
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      paddingHorizontal: 18,
    },
    navItemWrap: {
      width: 42,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 3,
    },
    navButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
    },
    navImage: {},
    activeDot: {
      width: 5,
      height: 5,
      borderRadius: 999,
      backgroundColor: "transparent",
      marginBottom: 1,
    },
    activeDotVisible: {
      backgroundColor: colors.dashboardBottomIconActive,
    },
    sosWrap: {
      alignItems: "center",
      justifyContent: "flex-end",
      marginHorizontal: 10,
      transform: [{ translateY: 4 }],
    },
    sosButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.dashboardSosButton,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.24,
      shadowRadius: 7,
      elevation: 6,
    },
    sosButtonActive: {
      borderWidth: 2,
      borderColor: colors.dashboardBottomIconActive,
    },
    sosPressed: {
      opacity: 0.9,
    },
    sosText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSosText,
      fontWeight: "900",
      fontSize: 16,
      lineHeight: 20,
    },
    pressed: {
      opacity: 0.82,
    },
  });
