import type {
  HeroLeaderboardEntry,
  HeroesWallAssets,
  HeroesWallPeriod,
} from "@/features/heroes-wall/heroes-wall.types";

export const HEROES_WALL_ASSETS: HeroesWallAssets = {
  backIcon: require("../../assets/images/back-icon.png"),
  crownIcon: require("../../assets/images/crown-icon.png"),
  defaultAvatar: require("../../assets/images/cat.png"),
};

export const HEROES_WALL_MOCK_DATA: HeroLeaderboardEntry[] = [
  {
    id: "weekly-hero-1",
    name: "Sarah Lee",
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 6000,
    rank: 1,
    period: "weekly",
  },
  {
    id: "weekly-hero-2",
    name: "Mia Santos",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 4000,
    rank: 2,
    period: "weekly",
  },
  {
    id: "weekly-hero-3",
    name: "Luna Reyes",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 1000,
    rank: 3,
    period: "weekly",
  },
  {
    id: "weekly-hero-4",
    name: "Ava Cruz",
    avatar:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 1000,
    rank: 4,
    period: "weekly",
  },
  {
    id: "weekly-hero-5",
    name: "Noah Lim",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 789,
    rank: 5,
    period: "weekly",
  },
  {
    id: "weekly-hero-6",
    name: "Eli Torres",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 657,
    rank: 6,
    period: "weekly",
  },
  {
    id: "weekly-hero-7",
    name: "Ariana Dela Cruz",
    avatar:
      "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 456,
    rank: 7,
    period: "weekly",
  },
  {
    id: "weekly-hero-8",
    name: "Chloe Ramos",
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 345,
    rank: 8,
    period: "weekly",
  },
  {
    id: "weekly-hero-9",
    name: "Sophia Velasco",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 234,
    rank: 9,
    period: "weekly",
  },
  {
    id: "monthly-hero-1",
    name: "Sarah Lee",
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 20000,
    rank: 1,
    period: "monthly",
  },
  {
    id: "monthly-hero-2",
    name: "Mia Santos",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 15000,
    rank: 2,
    period: "monthly",
  },
  {
    id: "monthly-hero-3",
    name: "Ava Cruz",
    avatar:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 11000,
    rank: 3,
    period: "monthly",
  },
  {
    id: "monthly-hero-4",
    name: "Noah Lim",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 9500,
    rank: 4,
    period: "monthly",
  },
  {
    id: "monthly-hero-5",
    name: "Luna Reyes",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 9000,
    rank: 5,
    period: "monthly",
  },
  {
    id: "monthly-hero-6",
    name: "Eli Torres",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 8200,
    rank: 6,
    period: "monthly",
  },
  {
    id: "monthly-hero-7",
    name: "Ariana Dela Cruz",
    avatar:
      "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 7900,
    rank: 7,
    period: "monthly",
  },
  {
    id: "monthly-hero-8",
    name: "Chloe Ramos",
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 6400,
    rank: 8,
    period: "monthly",
  },
  {
    id: "monthly-hero-9",
    name: "Sophia Velasco",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 5400,
    rank: 9,
    period: "monthly",
  },
  {
    id: "all-time-hero-1",
    name: "Sarah Lee",
    avatar:
      "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 92000,
    rank: 1,
    period: "allTime",
  },
  {
    id: "all-time-hero-2",
    name: "Mia Santos",
    avatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 88000,
    rank: 2,
    period: "allTime",
  },
  {
    id: "all-time-hero-3",
    name: "Ava Cruz",
    avatar:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 81000,
    rank: 3,
    period: "allTime",
  },
  {
    id: "all-time-hero-4",
    name: "Noah Lim",
    avatar:
      "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 76000,
    rank: 4,
    period: "allTime",
  },
  {
    id: "all-time-hero-5",
    name: "Luna Reyes",
    avatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 71000,
    rank: 5,
    period: "allTime",
  },
  {
    id: "all-time-hero-6",
    name: "Eli Torres",
    avatar:
      "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 66000,
    rank: 6,
    period: "allTime",
  },
  {
    id: "all-time-hero-7",
    name: "Ariana Dela Cruz",
    avatar:
      "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 60000,
    rank: 7,
    period: "allTime",
  },
  {
    id: "all-time-hero-8",
    name: "Chloe Ramos",
    avatar:
      "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 52000,
    rank: 8,
    period: "allTime",
  },
  {
    id: "all-time-hero-9",
    name: "Sophia Velasco",
    avatar:
      "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2",
    donatedAmount: 47000,
    rank: 9,
    period: "allTime",
  },
];

export const getHeroesLeaderboardByPeriod = (
  period: HeroesWallPeriod,
): HeroLeaderboardEntry[] =>
  HEROES_WALL_MOCK_DATA.filter((item) => item.period === period).sort(
    (left, right) => {
      if (left.rank !== right.rank) {
        return left.rank - right.rank;
      }

      return right.donatedAmount - left.donatedAmount;
    },
  );

export const formatHeroDonationAmount = (amount: number) =>
  `$${amount.toLocaleString("en-US")}`;
