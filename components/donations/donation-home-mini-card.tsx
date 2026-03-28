import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import { DONATION_ASSETS } from "@/features/donations/donations.data";
import type { DonationCauseItem } from "@/features/donations/donations.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";

type DonationHomeMiniCardProps = {
  item: DonationCauseItem;
  onPress?: (item: DonationCauseItem) => void;
  style?: StyleProp<ViewStyle>;
};

const resolveImageSource = (image?: DonationCauseItem["image"]) => {
  if (!image) {
    return DONATION_ASSETS.defaultCauseImage;
  }

  if (typeof image === "string") {
    const normalized = image.trim();

    return normalized ? { uri: normalized } : DONATION_ASSETS.defaultCauseImage;
  }

  return image;
};

export function DonationHomeMiniCard({
  item,
  onPress,
  style,
}: DonationHomeMiniCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const imageSource = resolveImageSource(item.image);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
    >
      <View style={styles.imageWrap}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
      </View>
      <Text numberOfLines={2} style={styles.title}>
        {item.title}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: 126,
      borderRadius: 12,
      backgroundColor: colors.dashboardSectionCardBackground,
      overflow: "hidden",
    },
    pressed: {
      opacity: 0.88,
    },
    imageWrap: {
      width: "100%",
      height: 108,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    title: {
      fontFamily: DisplayFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 15,
      fontWeight: "900",
      textAlign: "center",
      minHeight: 56,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 12,
    },
  });
