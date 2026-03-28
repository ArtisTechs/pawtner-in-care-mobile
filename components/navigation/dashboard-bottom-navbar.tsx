import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  DASHBOARD_ASSETS,
  type DashboardBottomNavKey,
} from "@/features/dashboard/dashboard.data";
import { SUPPORT_ASSETS } from "@/features/support/support.data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  type ImageSourcePropType,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DashboardBottomNavbarProps = {
  activeKey?: DashboardBottomNavKey;
  showDogBotFab?: boolean;
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

const DOG_BOT_FAB_SIZE = 58;
const DOG_BOT_FAB_RIGHT_MARGIN = 18;
const DOG_BOT_HELP_SHOW_INTERVAL_MS = 12000;
const DOG_BOT_HELP_VISIBLE_MS = 5000;
const DOG_BOT_HELP_SHOW_CHANCE = 0.42;
const DOG_BOT_HELP_PROMPTS = [
  "Need help?\nChat with Dog Bot",
  "Need help?\nAsk about donations",
  "Need help?\nFind nearby events",
  "Need help?\nAsk about volunteer tasks",
  "Need help?\nGet rescue support info",
  "Need help?\nTap to start chatting",
] as const;

export function DashboardBottomNavbar({
  activeKey = "home",
  showDogBotFab = true,
}: DashboardBottomNavbarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navbarBottomPadding = Math.max(insets.bottom, 8);
  const dogBotDrag = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const didDragRef = useRef(false);
  const dragValueRef = useRef({ x: 0, y: 0 });
  const [showHelpBubble, setShowHelpBubble] = useState(false);
  const [helpBubbleSide, setHelpBubbleSide] = useState<"left" | "right">(
    "left",
  );
  const [helpBubbleMessage, setHelpBubbleMessage] = useState<string>(
    DOG_BOT_HELP_PROMPTS[0],
  );
  const helpBubbleVisibleRef = useRef(false);
  const lastPromptIndexRef = useRef<number>(0);
  const helpBubbleHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const helpBubbleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  useEffect(() => {
    helpBubbleVisibleRef.current = showHelpBubble;
  }, [showHelpBubble]);

  useEffect(() => {
    const listenerId = dogBotDrag.addListener((value) => {
      dragValueRef.current = value;
    });

    return () => {
      dogBotDrag.removeListener(listenerId);
    };
  }, [dogBotDrag]);

  useEffect(() => {
    if (!showDogBotFab || activeKey === "chat") {
      setShowHelpBubble(false);
      return;
    }

    const clearHideTimer = () => {
      if (!helpBubbleHideTimerRef.current) {
        return;
      }

      clearTimeout(helpBubbleHideTimerRef.current);
      helpBubbleHideTimerRef.current = null;
    };

    const maybeShowHelpBubble = () => {
      if (helpBubbleVisibleRef.current) {
        return;
      }

      if (Math.random() > DOG_BOT_HELP_SHOW_CHANCE) {
        return;
      }

      let nextPromptIndex = Math.floor(
        Math.random() * DOG_BOT_HELP_PROMPTS.length,
      );

      if (
        DOG_BOT_HELP_PROMPTS.length > 1 &&
        nextPromptIndex === lastPromptIndexRef.current
      ) {
        nextPromptIndex = (nextPromptIndex + 1) % DOG_BOT_HELP_PROMPTS.length;
      }

      lastPromptIndexRef.current = nextPromptIndex;
      setHelpBubbleMessage(DOG_BOT_HELP_PROMPTS[nextPromptIndex]);
      const fabCenterX =
        width -
        DOG_BOT_FAB_RIGHT_MARGIN -
        DOG_BOT_FAB_SIZE / 2 +
        dragValueRef.current.x;
      setHelpBubbleSide(fabCenterX < width / 2 ? "right" : "left");
      setShowHelpBubble(true);
      clearHideTimer();
      helpBubbleHideTimerRef.current = setTimeout(() => {
        setShowHelpBubble(false);
      }, DOG_BOT_HELP_VISIBLE_MS);
    };

    helpBubbleIntervalRef.current = setInterval(
      maybeShowHelpBubble,
      DOG_BOT_HELP_SHOW_INTERVAL_MS,
    );

    return () => {
      clearHideTimer();

      if (helpBubbleIntervalRef.current) {
        clearInterval(helpBubbleIntervalRef.current);
        helpBubbleIntervalRef.current = null;
      }
    };
  }, [activeKey, showDogBotFab, width]);

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

  const handlePressDogBot = () => {
    setShowHelpBubble(false);

    if (didDragRef.current) {
      didDragRef.current = false;
      return;
    }

    if (activeKey === "chat") {
      return;
    }

    router.replace("/support");
  };

  const panResponder = useMemo(() => {
    const maxLeftTravel = Math.max(
      0,
      width - DOG_BOT_FAB_SIZE - DOG_BOT_FAB_RIGHT_MARGIN * 2,
    );
    const maxUpTravel = Math.max(120, height - 220);
    const clamp = (value: number, min: number, max: number) =>
      Math.max(min, Math.min(max, value));

    const clampAndAnimate = () => {
      dogBotDrag.flattenOffset();
      const currentX = dragValueRef.current.x;
      const currentY = dragValueRef.current.y;
      const clampedX = clamp(currentX, -maxLeftTravel, 0);
      const snappedX =
        Math.abs(clampedX - 0) <= Math.abs(clampedX + maxLeftTravel)
          ? 0
          : -maxLeftTravel;
      const clampedY = clamp(currentY, -maxUpTravel, 0);

      Animated.spring(dogBotDrag, {
        toValue: { x: snappedX, y: clampedY },
        useNativeDriver: false,
        tension: 70,
        friction: 9,
      }).start();
    };

    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        setShowHelpBubble(false);
        didDragRef.current = false;
        dogBotDrag.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        didDragRef.current = true;
        dogBotDrag.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: clampAndAnimate,
      onPanResponderTerminate: clampAndAnimate,
      onPanResponderTerminationRequest: () => false,
    });
  }, [dogBotDrag, height, width]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          paddingBottom: navbarBottomPadding,
        },
      ]}
    >
      {showDogBotFab ? (
        <Animated.View
          style={[
            styles.dogBotFab,
            {
              bottom: navbarBottomPadding + 68,
            },
            activeKey === "chat" && styles.dogBotFabActive,
            {
              transform: dogBotDrag.getTranslateTransform(),
            },
          ]}
          {...panResponder.panHandlers}
        >
          {showHelpBubble ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Dog Bot support"
              onPress={handlePressDogBot}
              style={({ pressed }) => [
                styles.helpBubble,
                helpBubbleSide === "right"
                  ? styles.helpBubbleRightOfFab
                  : styles.helpBubbleLeftOfFab,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.helpBubbleText}>{helpBubbleMessage}</Text>
              <View
                style={[
                  styles.helpBubbleTipOutline,
                  helpBubbleSide === "right"
                    ? styles.helpBubbleTipOutlineLeft
                    : styles.helpBubbleTipOutlineRight,
                ]}
              />
              <View
                style={[
                  styles.helpBubbleTip,
                  helpBubbleSide === "right"
                    ? styles.helpBubbleTipLeft
                    : styles.helpBubbleTipRight,
                ]}
              />
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open Dog Bot support"
            onPress={handlePressDogBot}
            style={({ pressed }) => [
              styles.dogBotFabPressable,
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={SUPPORT_ASSETS.dogBotIcon}
              style={styles.dogBotFabImage}
              resizeMode="contain"
            />
          </Pressable>
        </Animated.View>
      ) : null}

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
    dogBotFab: {
      position: "absolute",
      right: DOG_BOT_FAB_RIGHT_MARGIN,
      width: DOG_BOT_FAB_SIZE,
      height: DOG_BOT_FAB_SIZE,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F1F7FF",
      borderWidth: 2,
      borderColor: "rgba(45, 116, 195, 0.52)",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
      elevation: 8,
    },
    dogBotFabActive: {
      borderWidth: 2,
      borderColor: colors.dashboardBottomIconActive,
    },
    dogBotFabPressable: {
      width: "100%",
      height: "100%",
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    dogBotFabImage: {
      width: 36,
      height: 36,
    },
    helpBubble: {
      position: "absolute",
      top: -2,
      minHeight: 44,
      width: 180,
      borderRadius: 14,
      backgroundColor: colors.white,
      borderWidth: 2,
      borderColor: "rgba(45, 116, 195, 0.44)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.26,
      shadowRadius: 10,
      elevation: 10,
      zIndex: 3,
    },
    helpBubbleLeftOfFab: {
      right: DOG_BOT_FAB_SIZE + 10,
    },
    helpBubbleRightOfFab: {
      left: DOG_BOT_FAB_SIZE + 10,
    },
    helpBubbleTip: {
      position: "absolute",
      top: "50%",
      marginTop: -7,
      width: 0,
      height: 0,
      borderTopWidth: 7,
      borderBottomWidth: 7,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    helpBubbleTipOutline: {
      position: "absolute",
      top: "50%",
      marginTop: -8,
      width: 0,
      height: 0,
      borderTopWidth: 8,
      borderBottomWidth: 8,
      borderLeftWidth: 0,
      borderRightWidth: 0,
      borderTopColor: "transparent",
      borderBottomColor: "transparent",
    },
    helpBubbleTipRight: {
      right: -8,
      borderLeftWidth: 9,
      borderLeftColor: colors.white,
      borderRightColor: "transparent",
    },
    helpBubbleTipLeft: {
      left: -8,
      borderRightWidth: 9,
      borderRightColor: colors.white,
      borderLeftColor: "transparent",
    },
    helpBubbleTipOutlineRight: {
      right: -10,
      borderLeftWidth: 10,
      borderLeftColor: "rgba(45, 116, 195, 0.44)",
      borderRightColor: "transparent",
    },
    helpBubbleTipOutlineLeft: {
      left: -10,
      borderRightWidth: 10,
      borderRightColor: "rgba(45, 116, 195, 0.44)",
      borderLeftColor: "transparent",
    },
    helpBubbleText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "800",
      textAlign: "center",
    },
    pressed: {
      opacity: 0.82,
    },
  });
