import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ImageSourcePropType } from "react-native";

export type ProfileBadgeItem = {
  badgeColor: string;
  iconColor: string;
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  id: string;
};

export type ProfileSettingsKey =
  | "profile-settings"
  | "change-password";

export type ProfileSettingsItem = {
  key: ProfileSettingsKey;
  label: string;
};

export type ProfileAssets = {
  backIcon: ImageSourcePropType;
};
