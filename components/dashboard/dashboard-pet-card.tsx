import { RoundedFontFamily } from "@/constants/theme";
import type { DashboardPetItem } from "@/features/dashboard/dashboard.data";
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
  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite?.(item.petId);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardPressable,
        pressed && onPress && styles.cardPressed,
        {
          backgroundColor: cardBackgroundColor,
          shadowColor: cardShadowColor,
        },
      ]}
    >
      <View style={styles.cardSurface}>
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
        <Pressable
          accessibilityRole="button"
          disabled={favoriteDisabled || !onToggleFavorite}
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
    marginVertical: 3,
    borderRadius: 12,
    overflow: "visible",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 8,
    elevation: 6,
  },
  cardSurface: {
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
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(198, 223, 254, 0.95)",
  },
  favoriteButtonPressed: {
    opacity: 0.85,
  },
});
