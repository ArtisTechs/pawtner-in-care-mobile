import { DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import type { DashboardPetItem } from "@/features/dashboard/dashboard.data";
import {
  IN_PROGRESS_ADOPTION_LABEL,
  isInProgressPetStatus,
} from "@/features/pets/pet-status";
import { PET_ASSETS } from "@/features/pets/pets.data";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React from "react";
import {
  type GestureResponderEvent,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DashboardPetCardProps = {
  cardBackgroundColor: string;
  cardShadowColor: string;
  item: DashboardPetItem;
  onPress?: () => void;
  onToggleFavorite?: (petId: string) => void;
  favoriteDisabled?: boolean;
  subtitleColor: string;
  textColor: string;
};

export function DashboardPetCard({
  cardBackgroundColor,
  cardShadowColor,
  item,
  onPress,
  onToggleFavorite,
  favoriteDisabled,
  subtitleColor,
  textColor,
}: DashboardPetCardProps) {
  const imageSource = resolveImageSource(item.image, item.type);
  const isFavorite = Boolean(item.isFavorite);
  const hasAge = item.age.trim().length > 0;
  const isInProgress = isInProgressPetStatus(item.status);
  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite?.(item.petId);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress || isInProgress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardPressable,
        pressed && onPress && !isInProgress && styles.cardPressed,
      ]}
    >
      <View
        style={[styles.cardSurface, { backgroundColor: cardBackgroundColor }]}
      >
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={[styles.content, !hasAge && styles.contentNoAge]}>
          <Text numberOfLines={1} style={[styles.name, { color: textColor }]}>
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.detail, { color: subtitleColor }]}
          >
            {item.sex}
          </Text>
          {hasAge ? (
            <Text
              numberOfLines={1}
              style={[styles.detail, { color: subtitleColor }]}
            >
              {item.age}
            </Text>
          ) : null}
          <View style={[styles.metaRow, !hasAge && styles.metaRowNoAge]}>
            <Text
              numberOfLines={1}
              style={[styles.metaText, { color: subtitleColor }]}
            >
              {item.vaccinated ? "Vaccinated" : "Not Vaccinated"}
            </Text>
          </View>
        </View>
        {isInProgress ? (
          <View pointerEvents="none" style={styles.statusOverlay}>
            <Text numberOfLines={2} style={styles.statusOverlayText}>
              {IN_PROGRESS_ADOPTION_LABEL}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={favoriteDisabled || !onToggleFavorite || isInProgress}
          hitSlop={8}
          onPress={handleFavoritePress}
          style={({ pressed }) => [
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
            pressed && styles.favoriteButtonPressed,
          ]}
        >
          <MaterialCommunityIcons
            color={isFavorite ? textColor : subtitleColor}
            name={isFavorite ? "paw" : "paw-outline"}
            size={14}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const resolveImageSource = (
  image: DashboardPetItem["image"],
  petType: DashboardPetItem["type"],
): ImageSourcePropType => {
  const defaultImage =
    petType === "cat" ? PET_ASSETS.catDefault : PET_ASSETS.dogDefault;

  if (!image) {
    return defaultImage;
  }

  if (typeof image === "string") {
    const normalized = image.trim();

    return normalized ? { uri: normalized } : defaultImage;
  }

  return image;
};

const styles = StyleSheet.create({
  cardPressable: {
    width: 102,
    height: 164,
    alignSelf: "flex-start",
    marginVertical: 3,
    borderRadius: 12,
    overflow: "visible",
  },
  cardSurface: {
    height: "100%",
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.92,
  },
  image: {
    width: "100%",
    height: 92,
  },
  content: {
    paddingHorizontal: 7,
    paddingTop: 6,
    paddingBottom: 7,
    gap: 3,
    paddingRight: 26,
  },
  contentNoAge: {
    gap: 1,
  },
  name: {
    fontFamily: RoundedFontFamily,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: "800",
  },
  detail: {
    fontFamily: RoundedFontFamily,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "600",
  },
  metaRow: {
    marginTop: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaRowNoAge: {
    marginTop: 0,
  },
  metaText: {
    fontFamily: RoundedFontFamily,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "600",
    flex: 1,
    marginRight: 2,
  },
  statusOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(16, 28, 47, 0.56)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    zIndex: 2,
  },
  statusOverlayText: {
    fontFamily: DisplayFontFamily,
    color: "#FFFFFF",
    fontSize: 12,
    lineHeight: 9,
    fontWeight: "400",
    textAlign: "center",
    letterSpacing: 0.1,
  },
  favoriteButton: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(218, 234, 254, 0.9)",
    position: "absolute",
    right: 7,
    bottom: 7,
    zIndex: 1,
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(198, 223, 254, 0.95)",
  },
  favoriteButtonPressed: {
    opacity: 0.85,
  },
});
