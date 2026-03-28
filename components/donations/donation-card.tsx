import { DonationProgressBar } from "@/components/donations/donation-progress-bar";
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

type DonationCardProps = {
  item: DonationCauseItem;
  onPressAction?: (item: DonationCauseItem) => void;
  style?: StyleProp<ViewStyle>;
};

const resolveCauseImage = (image?: DonationCauseItem["image"]) => {
  if (!image) {
    return DONATION_ASSETS.defaultCauseImage;
  }

  if (typeof image === "string") {
    const normalized = image.trim();

    return normalized ? { uri: normalized } : DONATION_ASSETS.defaultCauseImage;
  }

  return image;
};

const formatAmount = (amount: number) => `\u20b1 ${amount.toLocaleString("en-PH")}`;

export function DonationCard({ item, onPressAction, style }: DonationCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const imageSource = resolveCauseImage(item.image);
  const progress = item.targetAmount > 0 ? item.raisedAmount / item.targetAmount : 0;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPressAction?.(item)}
      style={({ pressed }) => [
        styles.card,
        {
          shadowColor: colors.dashboardShadow,
        },
        style,
        pressed && styles.cardPressed,
      ]}
    >
      <Image source={imageSource} style={styles.thumbnail} resizeMode="cover" />

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>

        <View style={styles.progressWrap}>
          <DonationProgressBar progress={progress} />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.amount}>
            <Text style={styles.raisedAmount}>{formatAmount(item.raisedAmount)}</Text>
            <Text style={styles.amountDivider}> / </Text>
            <Text style={styles.targetAmount}>{formatAmount(item.targetAmount)}</Text>
          </Text>

          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => onPressAction?.(item)}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
          >
            <Image
              source={DONATION_ASSETS.donateIcon}
              style={styles.actionIcon}
              resizeMode="contain"
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: "100%",
      minHeight: 124,
      borderRadius: 12,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingVertical: 8,
      paddingHorizontal: 8,
      flexDirection: "row",
      alignItems: "center",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
      gap: 12,
    },
    cardPressed: {
      opacity: 0.92,
    },
    thumbnail: {
      width: 88,
      height: 88,
      borderRadius: 10,
      backgroundColor: "#DDE8F8",
    },
    content: {
      flex: 1,
      alignSelf: "stretch",
      justifyContent: "space-between",
      paddingVertical: 4,
      paddingRight: 4,
    },
    title: {
      fontFamily: DisplayFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    progressWrap: {
      marginTop: 6,
    },
    footerRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    amount: {
      fontFamily: RoundedFontFamily,
      fontSize: 8,
      lineHeight: 14,
      fontWeight: "800",
      flex: 1,
    },
    raisedAmount: {
      color: "#22B45D",
    },
    amountDivider: {
      color: "rgba(65, 73, 86, 0.6)",
    },
    targetAmount: {
      color: "#CE4C4C",
    },
    actionButton: {
      width: 30,
      height: 30,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EAF2FD",
    },
    actionIcon: {
      width: 20,
      height: 20,
    },
    actionPressed: {
      opacity: 0.84,
    },
  });
