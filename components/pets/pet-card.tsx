import {
  Colors,
  DisplayFontFamily,
  RoundedFontFamily,
} from "@/constants/theme";
import {
  IN_PROGRESS_ADOPTION_LABEL,
  isInProgressPetStatus,
} from "@/features/pets/pet-status";
import { PET_ASSETS } from "@/features/pets/pets.data";
import type { PetListingItem } from "@/features/pets/pets.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import {
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PetCardProps = {
  item: PetListingItem;
  onPress?: () => void;
  onToggleFavorite: (petId: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function PetCard({
  item,
  onPress,
  onToggleFavorite,
  style,
}: PetCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const defaultImage =
    item.type === "cat" ? PET_ASSETS.catDefault : PET_ASSETS.dogDefault;
  const imageSource =
    typeof item.image === "string"
      ? item.image.trim()
        ? { uri: item.image }
        : defaultImage
      : item.image || defaultImage;
  const hasAge = item.age.trim().length > 0;
  const isInProgress = isInProgressPetStatus(item.status);

  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite(item.id);
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
      <View style={[styles.card, style]}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.meta}>{item.sex}</Text>
          {hasAge ? <Text style={styles.meta}>{item.age}</Text> : null}
          <Text style={[styles.secondary, !hasAge && styles.secondaryNoAge]}>
            {item.vaccinated ? "Vaccinated" : "Not Vaccinated"}
          </Text>
        </View>
        {isInProgress ? (
          <View pointerEvents="none" style={styles.statusOverlay}>
            <Text numberOfLines={1} style={styles.statusOverlayText}>
              {IN_PROGRESS_ADOPTION_LABEL}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={isInProgress}
          hitSlop={8}
          onPress={handleFavoritePress}
          style={({ pressed }) => [
            styles.favoriteButton,
            item.isFavorite && styles.favoriteButtonActive,
            pressed && styles.favoritePressed,
          ]}
        >
          <MaterialCommunityIcons
            color={
              item.isFavorite
                ? colors.dashboardBottomIconActive
                : colors.dashboardBottomIcon
            }
            name={item.isFavorite ? "paw" : "paw-outline"}
            size={19}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    cardPressable: {
      borderRadius: 12,
    },
    cardPressed: {
      opacity: 0.95,
    },
    card: {
      position: "relative",
      minHeight: 106,
      backgroundColor: colors.dashboardSectionCardBackground,
      borderRadius: 12,
      padding: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    image: {
      width: 84,
      height: 84,
      borderRadius: 10,
    },
    content: {
      flex: 1,
      alignSelf: "stretch",
      justifyContent: "center",
      paddingRight: 40,
    },
    name: {
      fontFamily: RoundedFontFamily,
      fontSize: 20,
      lineHeight: 26,
      fontWeight: "800",
      color: colors.dashboardBottomIconActive,
      marginBottom: 3,
    },
    meta: {
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "600",
      color: colors.dashboardBottomIconActive,
    },
    secondary: {
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "600",
      color: colors.dashboardBottomIcon,
      marginTop: 4,
    },
    secondaryNoAge: {
      marginTop: 0,
    },
    statusOverlay: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      borderRadius: 12,
      backgroundColor: "rgba(16, 28, 47, 0.56)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      zIndex: 2,
    },
    statusOverlayText: {
      fontFamily: DisplayFontFamily,
      color: "#FFFFFF",
      fontSize: 16,
      lineHeight: 19,
      fontWeight: "400",
      textAlign: "center",
      letterSpacing: 0.15,
    },
    favoriteButton: {
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: "#DAEAFE",
      alignItems: "center",
      justifyContent: "center",
      position: "absolute",
      right: 8,
      bottom: 8,
      zIndex: 1,
    },
    favoriteButtonActive: {
      backgroundColor: "#C6DFFE",
    },
    favoritePressed: {
      opacity: 0.85,
    },
  });
