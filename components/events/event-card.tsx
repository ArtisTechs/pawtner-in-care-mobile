import { Colors, RoundedFontFamily } from "@/constants/theme";
import { EVENTS_ASSETS } from "@/features/events/events.data";
import type { EventItem } from "@/features/events/events.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import {
  type GestureResponderEvent,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type EventCardProps = {
  event: EventItem;
  onPress?: (event: EventItem) => void;
  onPressFacebook?: (event: EventItem) => void;
  onPressVisitNow?: (event: EventItem) => void;
};

const resolveEventImageSource = (eventImage?: EventItem["image"]) => {
  if (!eventImage) {
    return EVENTS_ASSETS.eventPlaceholder;
  }

  if (typeof eventImage === "string") {
    const normalized = eventImage.trim();

    return normalized ? { uri: normalized } : EVENTS_ASSETS.eventPlaceholder;
  }

  return eventImage;
};

export function EventCard({
  event,
  onPress,
  onPressFacebook,
  onPressVisitNow,
}: EventCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const imageSource = resolveEventImageSource(event.image);

  const handleFacebookPress = (nativeEvent: GestureResponderEvent) => {
    nativeEvent.stopPropagation();
    onPressFacebook?.(event);
  };

  const handleVisitNowPress = (nativeEvent: GestureResponderEvent) => {
    nativeEvent.stopPropagation();
    onPressVisitNow?.(event);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={() => onPress?.(event)}
      style={({ pressed }) => [styles.cardPressable, pressed && styles.cardPressed]}
    >
      <View
        style={[
          styles.card,
          {
            shadowColor: colors.dashboardShadow,
          },
        ]}
      >
        <View style={styles.topRow}>
          <Text numberOfLines={1} style={styles.title}>
            {event.title}
          </Text>

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleFacebookPress}
            style={({ pressed }) => [
              styles.facebookButton,
              pressed && styles.facebookButtonPressed,
            ]}
          >
            <FontAwesome color={colors.socialFacebook} name="facebook" size={21} />
          </Pressable>
        </View>

        <View style={styles.contentRow}>
          <View style={styles.thumbnailWrap}>
            <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" />
          </View>

          <View style={styles.contentWrap}>
            <Text numberOfLines={1} style={styles.eventDate}>
              {event.eventDate}
            </Text>
            <Text numberOfLines={3} style={styles.description}>
              {event.description}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.metaWrap}>
            <Text style={styles.metaLabel}>{event.timeLabel}</Text>
            <Text style={styles.metaBullet}>{"\u2022"}</Text>
            <Text numberOfLines={1} style={styles.metaValue}>
              {event.timeValue}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleVisitNowPress}
            style={({ pressed }) => [
              styles.visitNowButton,
              pressed && styles.visitNowButtonPressed,
            ]}
          >
            <Text style={styles.visitNowLabel}>VISIT NOW</Text>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="chevron-right"
              size={18}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    cardPressable: {
      borderRadius: 20,
    },
    cardPressed: {
      opacity: 0.94,
    },
    card: {
      width: "100%",
      borderRadius: 20,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 8,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 5,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    title: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      color: "#0F0F10",
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "900",
    },
    facebookButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    facebookButtonPressed: {
      opacity: 0.8,
    },
    contentRow: {
      marginTop: 5,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },
    thumbnailWrap: {
      width: 52,
      height: 52,
      borderRadius: 10,
      overflow: "hidden",
      backgroundColor: "#DDE8F8",
    },
    thumbnail: {
      width: "100%",
      height: "100%",
    },
    contentWrap: {
      flex: 1,
    },
    eventDate: {
      fontFamily: RoundedFontFamily,
      color: "#2B73BD",
      fontSize: 8,
      lineHeight: 14,
      fontWeight: "800",
    },
    description: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: "#78A2D6",
      fontSize: 8,
      lineHeight: 13,
      fontWeight: "600",
    },
    footerRow: {
      marginTop: 7,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    metaWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      flex: 1,
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
      flex: 1,
      fontFamily: RoundedFontFamily,
      color: "rgba(44, 56, 73, 0.72)",
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "700",
    },
    visitNowButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 1,
    },
    visitNowButtonPressed: {
      opacity: 0.82,
    },
    visitNowLabel: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 14,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
  });
