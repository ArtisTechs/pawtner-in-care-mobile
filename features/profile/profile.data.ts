import type {
  ProfileAssets,
  ProfileBadgeItem,
  ProfileSettingsItem,
} from "@/features/profile/profile.types";

export const PROFILE_ASSETS: ProfileAssets = {
  backIcon: require("../../assets/images/back-icon.png"),
  defaultAvatar: require("../../assets/images/cat.png"),
};

export const PROFILE_BADGES: ProfileBadgeItem[] = [
  {
    id: "badge-supporter",
    iconName: "emoji-events",
    badgeColor: "#F5CC3A",
    iconColor: "#FFFFFF",
  },
  {
    id: "badge-community",
    iconName: "stars",
    badgeColor: "#7E54F5",
    iconColor: "#FFFFFF",
  },
  {
    id: "badge-volunteer",
    iconName: "verified",
    badgeColor: "#31A8FF",
    iconColor: "#FFFFFF",
  },
  {
    id: "badge-donor",
    iconName: "shield",
    badgeColor: "#ED597C",
    iconColor: "#FFFFFF",
  },
];

export const PROFILE_SETTINGS_ITEMS: ProfileSettingsItem[] = [
  { key: "profile-settings", label: "Profile Settings" },
  { key: "change-password", label: "Change Password" },
  { key: "notification", label: "Notification" },
];
