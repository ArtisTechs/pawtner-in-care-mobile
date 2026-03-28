import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  HEROES_WALL_ASSETS,
  formatHeroDonationAmount,
} from "@/features/heroes-wall/heroes-wall.data";
import type { HeroLeaderboardEntry } from "@/features/heroes-wall/heroes-wall.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

type LeaderboardRowProps = {
  hero: HeroLeaderboardEntry;
  onPress?: (hero: HeroLeaderboardEntry) => void;
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

export function LeaderboardRow({ hero, onPress }: LeaderboardRowProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const avatarSource = resolveAvatarSource(hero.avatar);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress?.(hero)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.rankText}>{hero.rank}</Text>

      <View style={styles.userWrap}>
        <Image source={avatarSource} style={styles.avatar} resizeMode="cover" />
        <Text numberOfLines={1} style={styles.nameText}>
          {hero.name}
        </Text>
      </View>

      <Text style={styles.amountText}>{formatHeroDonationAmount(hero.donatedAmount)}</Text>
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    row: {
      minHeight: 54,
      borderRadius: 10,
      backgroundColor: colors.loginHeaderGradientStart,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    rankText: {
      width: 40,
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 26,
      lineHeight: 27,
      fontWeight: "900",
      textAlign: "center",
    },
    userWrap: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 4,
      gap: 8,
      minWidth: 0,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.72)",
      backgroundColor: "#D8E8FA",
    },
    nameText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "700",
      flex: 1,
    },
    amountText: {
      width: 84,
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "800",
      textAlign: "right",
    },
    pressed: {
      opacity: 0.9,
    },
  });
