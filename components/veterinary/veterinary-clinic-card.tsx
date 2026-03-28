import { Colors, RoundedFontFamily } from "@/constants/theme";
import { VETERINARY_ASSETS } from "@/features/veterinary/veterinary.data";
import type { VeterinaryClinicItem } from "@/features/veterinary/veterinary.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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

type VeterinaryClinicCardProps = {
  item: VeterinaryClinicItem;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

const resolveClinicImageSource = (
  image?: VeterinaryClinicItem["image"],
) => {
  if (!image) {
    return VETERINARY_ASSETS.clinicPlaceholder;
  }

  if (typeof image === "string") {
    const normalized = image.trim();

    return normalized
      ? { uri: normalized }
      : VETERINARY_ASSETS.clinicPlaceholder;
  }

  return image;
};

export function VeterinaryClinicCard({
  item,
  onPress,
  style,
}: VeterinaryClinicCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const imageSource = resolveClinicImageSource(item.image);

  const handleActionPress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress?.();
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
        <View style={styles.thumbnailWrap}>
          <Image
            source={imageSource}
            style={styles.thumbnail}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text numberOfLines={2} style={styles.name}>
              {item.name}
            </Text>

            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={handleActionPress}
              style={({ pressed }) => [
                styles.actionButton,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <View style={styles.actionDiamond}>
                <MaterialIcons
                  color={colors.dashboardSectionCardBackground}
                  name="north-east"
                  size={14}
                  style={styles.actionIcon}
                />
              </View>
            </Pressable>
          </View>

          <Text numberOfLines={2} style={styles.services}>
            {item.services}
          </Text>
          <Text style={styles.typeLabel}>{item.clinicType}</Text>

          <View style={styles.ratingRow}>
            <MaterialIcons color="#F4B234" name="star" size={13} />
            <Text numberOfLines={1} style={styles.ratingText}>
              {`${item.rating.toFixed(1)}/5 (${item.reviewCount} Reviews) by google`}
            </Text>
          </View>

          <View style={styles.addressRow}>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="location-on"
              size={13}
            />
            <Text numberOfLines={2} style={styles.address}>
              {item.address}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    cardPressable: {
      borderRadius: 14,
    },
    cardPressed: {
      opacity: 0.95,
    },
    card: {
      minHeight: 140,
      backgroundColor: colors.dashboardSectionCardBackground,
      borderRadius: 14,
      padding: 10,
      flexDirection: "row",
      alignItems: "stretch",
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 9,
      elevation: 5,
      gap: 12,
    },
    thumbnailWrap: {
      width: 96,
      height: 96,
      borderRadius: 12,
      backgroundColor: "#FF6A00",
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      padding: 10,
    },
    thumbnail: {
      width: "100%",
      height: "100%",
    },
    content: {
      flex: 1,
      paddingVertical: 2,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    name: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      fontSize: 20,
      lineHeight: 23,
      fontWeight: "800",
      color: colors.dashboardBottomIconActive,
    },
    actionButton: {
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    actionButtonPressed: {
      opacity: 0.82,
    },
    actionDiamond: {
      width: 22,
      height: 22,
      borderRadius: 4,
      backgroundColor: colors.dashboardBottomIconActive,
      alignItems: "center",
      justifyContent: "center",
      transform: [{ rotate: "45deg" }],
    },
    actionIcon: {
      transform: [{ rotate: "-45deg" }],
    },
    services: {
      marginTop: 6,
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
      color: colors.dashboardBottomIconActive,
    },
    typeLabel: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
      color: colors.dashboardBottomIcon,
    },
    ratingRow: {
      marginTop: 6,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingText: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      fontSize: 8,
      lineHeight: 14,
      fontWeight: "600",
      color: colors.dashboardBottomIconActive,
    },
    addressRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 4,
      paddingRight: 4,
    },
    address: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      fontSize: 8,
      lineHeight: 14,
      fontWeight: "600",
      color: colors.dashboardBottomIcon,
    },
  });
