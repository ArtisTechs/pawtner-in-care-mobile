import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import { EVENTS_ASSETS } from "@/features/events/events.data";
import type { EventItem } from "@/features/events/events.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useRef } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type EventDetailsModalProps = {
  event: EventItem | null;
  onClose: () => void;
  onPressFacebook?: (event: EventItem) => void;
};

const resolveEventImageSource = (eventImage?: EventItem["image"]) => {
  if (!eventImage) {
    return null;
  }

  if (typeof eventImage === "string") {
    const normalized = eventImage.trim();

    return normalized ? { uri: normalized } : null;
  }

  return eventImage;
};

const AnimatedPosterLayer = Animated.createAnimatedComponent(Pressable);

const createEventMeta = (event: EventItem) => {
  const hashBase = event.id
    .split("")
    .reduce((total, current) => total + current.charCodeAt(0), 0);

  return {
    participants: 80 + (hashBase % 140),
    responded: 110 + (hashBase % 180),
    days: Math.max(1, Math.round((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / 86400000) + 1),
  };
};

export function EventDetailsModal({
  event,
  onClose,
  onPressFacebook,
}: EventDetailsModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const snapPoints = useMemo(() => ["22%", "82%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const bottomSheetAnimatedIndex = useSharedValue(0);
  const posterAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      bottomSheetAnimatedIndex.value,
      [0, 1],
      [0, -120],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  if (!event) {
    return null;
  }

  const imageSource = resolveEventImageSource(event.image);
  const eventMeta = createEventMeta(event);
  const handleExpandDetails = () => {
    bottomSheetRef.current?.snapToIndex(1);
  };

  return (
    <Modal
      visible
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.modalGestureRoot}>
        <View style={styles.root}>
          <Pressable style={styles.backdrop} onPress={onClose} />

          <AnimatedPosterLayer
            onPress={handleExpandDetails}
            style={[styles.posterLayer, posterAnimatedStyle]}
          >
            {imageSource ? (
              <Image source={imageSource} style={styles.posterImage} resizeMode="cover" />
            ) : (
              <View style={styles.posterFallback} />
            )}

            <Pressable style={styles.swipeHintWrap} onPress={handleExpandDetails}>
              <MaterialIcons color={colors.white} name="keyboard-arrow-up" size={22} />
              <Text style={styles.swipeHintText}>SWIPE UP FOR MORE INFO</Text>
            </Pressable>
          </AnimatedPosterLayer>

          <View
            style={[
              styles.posterTopBar,
              {
                paddingTop: insets.top + 8,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.topIconButton, pressed && styles.iconPressed]}
            >
              <Image
                source={EVENTS_ASSETS.backIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => onPressFacebook?.(event)}
              style={({ pressed }) => [styles.topIconButton, pressed && styles.iconPressed]}
            >
              <FontAwesome color={colors.white} name="facebook" size={20} />
            </Pressable>
          </View>

          <BottomSheet
            animatedIndex={bottomSheetAnimatedIndex}
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
            enableDynamicSizing={false}
            enablePanDownToClose={false}
            style={styles.sheetShadow}
          >
            <BottomSheetScrollView
              contentContainerStyle={[
                styles.sheetContent,
                {
                  paddingBottom: insets.bottom + 18,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.eventTitle}>{event.title.toUpperCase()}</Text>
              <Text style={styles.eventDate}>{event.eventDate}</Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>{event.timeLabel}</Text>
                <Text style={styles.metaBullet}>{"\u2022"}</Text>
                <Text style={styles.metaValue}>{event.timeValue}</Text>
              </View>

              <Text style={styles.description}>{event.description}</Text>
              <Text style={styles.description}>
                Join us for support sessions, community networking, and rescue-focused activities.
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{String(eventMeta.participants).padStart(2, "0")}</Text>
                  <Text style={styles.statLabel}>Participants</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{String(eventMeta.responded).padStart(2, "0")}</Text>
                  <Text style={styles.statLabel}>Responded</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{String(eventMeta.days).padStart(2, "0")}</Text>
                  <Text style={styles.statLabel}>Days</Text>
                </View>
              </View>

              <View style={styles.organizationRow}>
                <View style={styles.organizationBadge} />
                <Text style={styles.organizationText}>Noah&apos;s Ark Dog and Cat Shelter</Text>
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={() => {}}
                style={({ pressed }) => [styles.joinButton, pressed && styles.joinButtonPressed]}
              >
                <Text style={styles.joinButtonText}>Join Us!</Text>
              </Pressable>
            </BottomSheetScrollView>
          </BottomSheet>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    modalGestureRoot: {
      flex: 1,
    },
    root: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    posterLayer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#122944",
    },
    posterImage: {
      width: "100%",
      height: "100%",
      opacity: 0.95,
    },
    posterFallback: {
      flex: 1,
      backgroundColor: "#203C60",
    },
    posterTopBar: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    topIconButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "rgba(8, 21, 37, 0.34)",
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    iconPressed: {
      opacity: 0.82,
    },
    swipeHintWrap: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: "24%",
      alignItems: "center",
      justifyContent: "center",
      gap: 2,
    },
    swipeHintText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    sheetShadow: {
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 9,
      elevation: 12,
    },
    sheetBackground: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: colors.loginCardBackground,
      overflow: "hidden",
    },
    handleIndicator: {
      width: 44,
      height: 5,
      backgroundColor: "rgba(29, 78, 136, 0.4)",
    },
    sheetContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    eventTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "900",
    },
    eventDate: {
      marginTop: 4,
      fontFamily: RoundedFontFamily,
      color: "#2B73BD",
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "800",
    },
    metaRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    metaLabel: {
      fontFamily: RoundedFontFamily,
      color: "rgba(44, 56, 73, 0.78)",
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "700",
    },
    metaBullet: {
      color: "rgba(44, 56, 73, 0.48)",
      fontSize: 14,
      lineHeight: 14,
      fontWeight: "800",
    },
    metaValue: {
      fontFamily: RoundedFontFamily,
      color: "rgba(44, 56, 73, 0.72)",
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "700",
    },
    description: {
      marginTop: 8,
      fontFamily: RoundedFontFamily,
      color: "#4A6F9B",
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "600",
    },
    statsRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statValue: {
      fontFamily: DisplayFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 32,
      lineHeight: 38,
      fontWeight: "900",
    },
    statLabel: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: "#4A6F9B",
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
    organizationRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderWidth: 1,
      borderColor: "rgba(41, 104, 172, 0.42)",
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 7,
      backgroundColor: "rgba(146, 189, 236, 0.2)",
    },
    organizationBadge: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "#E2B400",
    },
    organizationText: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
    },
    joinButton: {
      marginTop: 16,
      alignSelf: "center",
      minWidth: 120,
      minHeight: 38,
      borderRadius: 999,
      backgroundColor: colors.dashboardScreenBackground,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    joinButtonPressed: {
      opacity: 0.84,
    },
    joinButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 20,
      lineHeight: 22,
      fontWeight: "900",
    },
  });
