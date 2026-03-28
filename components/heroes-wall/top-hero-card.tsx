import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  HEROES_WALL_ASSETS,
  formatHeroDonationAmount,
} from "@/features/heroes-wall/heroes-wall.data";
import type { HeroLeaderboardEntry } from "@/features/heroes-wall/heroes-wall.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type TopHeroCardProps = {
  hero: HeroLeaderboardEntry;
  isTopRank?: boolean;
};

const resolveAvatarSource = (avatar?: HeroLeaderboardEntry["avatar"]) => {
  if (!avatar) {
    return HEROES_WALL_ASSETS.defaultAvatar;
  }

  if (typeof avatar === "string") {
    const normalized = avatar.trim();

    return normalized ? { uri: normalized } : HEROES_WALL_ASSETS.defaultAvatar;
  }

  return avatar;
};

export function TopHeroCard({ hero, isTopRank = false }: TopHeroCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors, isTopRank), [colors, isTopRank]);
  const avatarSource = resolveAvatarSource(hero.avatar);

  return (
    <View style={styles.container}>
      {isTopRank ? (
        <Image
          source={HEROES_WALL_ASSETS.crownIcon}
          style={styles.crownIcon}
          resizeMode="contain"
        />
      ) : null}

      <View style={styles.avatarWrap}>
        <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />

        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>{hero.rank}</Text>
        </View>
      </View>

      <Text numberOfLines={1} style={styles.nameText}>
        {hero.name}
      </Text>
      <Text style={styles.amountText}>{formatHeroDonationAmount(hero.donatedAmount)}</Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, isTopRank: boolean) =>
  StyleSheet.create({
    container: {
      width: isTopRank ? 132 : 96,
      alignItems: "center",
      paddingTop: isTopRank ? 16 : 30,
    },
    crownIcon: {
      position: "absolute",
      top: -6,
      width: 36,
      height: 36,
      zIndex: 2,
    },
    avatarWrap: {
      width: isTopRank ? 92 : 76,
      height: isTopRank ? 92 : 76,
      borderRadius: 999,
      borderWidth: 3,
      borderColor: "#8CBCEB",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
    },
    avatar: {
      width: isTopRank ? 84 : 68,
      height: isTopRank ? 84 : 68,
      borderRadius: 999,
      backgroundColor: "#E2EEF9",
    },
    rankBadge: {
      position: "absolute",
      bottom: -7,
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 6,
      backgroundColor: colors.loginHeaderGradientEnd,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.white,
    },
    rankText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "900",
      textAlign: "center",
    },
    nameText: {
      marginTop: 10,
      fontFamily: RoundedFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: isTopRank ? 22 : 18,
      lineHeight: isTopRank ? 24 : 20,
      fontWeight: "900",
      textAlign: "center",
    },
    amountText: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: isTopRank ? 15 : 14,
      lineHeight: isTopRank ? 18 : 16,
      fontWeight: "800",
      textAlign: "center",
    },
  });
