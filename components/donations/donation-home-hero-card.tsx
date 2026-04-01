import { DonationProgressBar } from "@/components/donations/donation-progress-bar";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  DONATION_ASSETS,
  formatDonationAmount,
  formatDonationCampaignDate,
  formatDonationCampaignStatus,
  formatDonationCampaignType,
  getDonationProgress,
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

type DonationHomeHeroCardProps = {
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

export function DonationHomeHeroCard({
  item,
  onPress,
  style,
}: DonationHomeHeroCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const imageSource = resolveImageSource(item.image);
  const progress = getDonationProgress(item);
  const statusLabel = formatDonationCampaignStatus(item.status);
  const typeLabel = formatDonationCampaignType(item.type);
  const categoryChipLabel = item.isUrgent ? "Urgent" : typeLabel;
  const deadlineLabel = formatDonationCampaignDate(item.deadline);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.card,
        {
          shadowColor: colors.dashboardShadow,
        },
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={imageSource} style={styles.image} resizeMode="cover" />
        <View style={styles.categoryChip}>
          <Text numberOfLines={1} style={styles.categoryChipText}>
            {categoryChipLabel}
          </Text>
        </View>
        <View style={styles.statusChip}>
          <Text numberOfLines={1} style={styles.statusChipText}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {item.title}
        </Text>
        <Text numberOfLines={2} style={styles.description}>
          {item.description || "Your support helps this campaign reach its goal."}
        </Text>

        <View style={styles.progressWrap}>
          <DonationProgressBar progress={progress} />
        </View>

        <Text style={styles.amount}>
          <Text style={styles.raisedAmount}>
            {formatDonationAmount(item.totalDonatedCost)}
          </Text>
          <Text style={styles.amountDivider}> / </Text>
          <Text style={styles.targetAmount}>{formatDonationAmount(item.totalCost)}</Text>
        </Text>
        {deadlineLabel ? (
          <Text style={styles.deadlineText}>{`Deadline: ${deadlineLabel}`}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      width: 292,
      borderRadius: 20,
      backgroundColor: colors.dashboardSectionCardBackground,
      overflow: "hidden",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.22,
      shadowRadius: 8,
      elevation: 4,
    },
    pressed: {
      opacity: 0.9,
    },
    imageWrap: {
      width: "100%",
      height: 188,
      justifyContent: "flex-end",
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      width: "100%",
      height: "100%",
    },
    categoryChip: {
      marginBottom: 14,
      marginLeft: 14,
      alignSelf: "flex-start",
      minHeight: 28,
      maxWidth: "62%",
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    statusChip: {
      position: "absolute",
      top: 14,
      right: 14,
      minHeight: 24,
      borderRadius: 999,
      backgroundColor: "rgba(31, 53, 80, 0.74)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    statusChipText: {
      fontFamily: RoundedFontFamily,
      color: "#F4F8FD",
      fontSize: 8,
      lineHeight: 12,
      fontWeight: "800",
    },
    categoryChipText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 8,
      lineHeight: 13,
      fontWeight: "800",
    },
    content: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 16,
    },
    title: {
      fontFamily: DisplayFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
    },
    description: {
      marginTop: 6,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      minHeight: 38,
    },
    progressWrap: {
      marginTop: 10,
    },
    amount: {
      marginTop: 8,
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "900",
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
    deadlineText: {
      marginTop: 6,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "700",
    },
  });
