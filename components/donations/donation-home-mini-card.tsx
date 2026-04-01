import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  DONATION_ASSETS,
  formatDonationAmount,
  formatDonationCampaignType,
} from "@/features/donations/donations.data";
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
  const typeLabel = formatDonationCampaignType(item.type);

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
      <Text numberOfLines={1} style={styles.meta}>
        {item.isUrgent ? "Urgent" : typeLabel}
      </Text>
      <Text numberOfLines={1} style={styles.amount}>
        {`${formatDonationAmount(item.totalDonatedCost)} / ${formatDonationAmount(item.totalCost)}`}
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
      minHeight: 40,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 4,
    },
    meta: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      textAlign: "center",
      paddingHorizontal: 8,
    },
    amount: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 9,
      lineHeight: 11,
      fontWeight: "700",
      textAlign: "center",
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 10,
    },
  });
