import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ImageSourcePropType } from "react-native";

export type NotificationType =
  | "sos"
  | "location"
  | "checkout"
  | "health"
  | "appointment"
  | "achievement";

export type NotificationFilterKey = "updates" | "unread";

export type NotificationItem = {
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  id: string;
  isRead: boolean;
  message: string;
  relativeTime: string;
  timestamp: string;
  type: NotificationType;
};

export type NotificationAssets = {
  backIcon: ImageSourcePropType;
};
