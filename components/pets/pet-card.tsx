import { Colors, RoundedFontFamily } from "@/constants/theme";
import { PET_ASSETS } from "@/features/pets/pets.data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { PetListingItem } from "@/features/pets/pets.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import {
  type GestureResponderEvent,
  Image,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";

type PetCardProps = {
  item: PetListingItem;
  onPress?: () => void;
  onToggleFavorite: (petId: string) => void;
  style?: StyleProp<ViewStyle>;
};

export function PetCard({ item, onPress, onToggleFavorite, style }: PetCardProps) {
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

  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite(item.id);
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardPressable,
        pressed && onPress && styles.cardPressed,
      ]}
    >
      <View
        style={[
          styles.card,
          {
            shadowColor: colors.dashboardShadow,
          },
          style,
        ]}
      >
        <Image source={imageSource} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>

          <Text style={styles.meta}>{item.sex}</Text>
          <Text style={styles.meta}>{item.age}</Text>
          <Text style={styles.secondary}>
            {item.vaccinated ? "Vaccinated" : "Not Vaccinated"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
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
      minHeight: 106,
      backgroundColor: colors.dashboardSectionCardBackground,
      borderRadius: 12,
      padding: 8,
      flexDirection: "row",
      alignItems: "center",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
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
    },
    name: {
      fontFamily: RoundedFontFamily,
      fontSize: 23,
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
      fontSize: 13,
      lineHeight: 15,
      fontWeight: "600",
      color: colors.dashboardBottomIcon,
      marginTop: 4,
    },
    favoriteButton: {
      width: 32,
      height: 32,
      borderRadius: 999,
      backgroundColor: "#DAEAFE",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 4,
      alignSelf: "flex-start",
      marginTop: 8,
    },
    favoriteButtonActive: {
      backgroundColor: "#C6DFFE",
    },
    favoritePressed: {
      opacity: 0.85,
    },
  });
