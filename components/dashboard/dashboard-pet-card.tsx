import { RoundedFontFamily } from "@/constants/theme";
import type { DashboardPetItem } from "@/features/dashboard/dashboard.data";
import { PET_ASSETS } from "@/features/pets/pets.data";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import {
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
  subtitleColor: string;
  textColor: string;
};

export function DashboardPetCard({
  cardBackgroundColor,
  cardShadowColor,
  item,
  onPress,
  subtitleColor,
  textColor,
}: DashboardPetCardProps) {
  const imageSource = resolveImageSource(item.image, item.type);

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
        <View style={styles.content}>
          <Text numberOfLines={1} style={[styles.name, { color: textColor }]}>
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.detail, { color: subtitleColor }]}
          >
            {item.sex}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.detail, { color: subtitleColor }]}
          >
            {item.age}
          </Text>
          <View style={styles.metaRow}>
            <Text
              numberOfLines={1}
              style={[styles.metaText, { color: subtitleColor }]}
            >
              {item.vaccinated ? "Vaccinated" : "Not Vaccinated"}
            </Text>
            <MaterialIcons color={subtitleColor} name="pets" size={14} />
          </View>
        </View>
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
  metaText: {
    fontFamily: RoundedFontFamily,
    fontSize: 8,
    lineHeight: 11,
    fontWeight: "600",
    flex: 1,
    marginRight: 4,
  },
});
