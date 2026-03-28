import type { ImageSourcePropType } from "react-native";

export type HeroesWallPeriod = "weekly" | "monthly" | "allTime";

export type HeroLeaderboardEntry = {
  id: string;
  name: string;
  avatar?: ImageSourcePropType | string;
  donatedAmount: number;
  rank: number;
  period: HeroesWallPeriod;
};

export type HeroesWallAssets = {
  backIcon: ImageSourcePropType;
  crownIcon: ImageSourcePropType;
  defaultAvatar: ImageSourcePropType;
};
