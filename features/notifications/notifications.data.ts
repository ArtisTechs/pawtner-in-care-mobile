import type {
  NotificationAssets,
  NotificationItem,
} from "@/features/notifications/notifications.types";

const createTimestampFromHoursAgo = (hoursAgo: number) =>
  new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

export const NOTIFICATION_ASSETS: NotificationAssets = {
  backIcon: require("../../assets/images/back-icon.png"),
};

export const NOTIFICATION_MOCK_DATA: NotificationItem[] = [
  {
    iconName: "pets",
    id: "notification-1",
    isRead: false,
    message: "Your SOS has been received, Now heading to your location",
    relativeTime: "2h ago",
    timestamp: createTimestampFromHoursAgo(2),
    type: "sos",
  },
  {
    iconName: "place",
    id: "notification-2",
    isRead: false,
    message: "Your SOS has been received, Now heading to your location",
    relativeTime: "3d ago",
    timestamp: createTimestampFromHoursAgo(72),
    type: "location",
  },
  {
    iconName: "shopping-bag",
    id: "notification-3",
    isRead: true,
    message: "Your checkout is successful, product is on the way",
    relativeTime: "1w ago",
    timestamp: createTimestampFromHoursAgo(168),
    type: "checkout",
  },
  {
    iconName: "favorite-border",
    id: "notification-4",
    isRead: true,
    message: "Vaccinate your pet timely",
    relativeTime: "2w ago",
    timestamp: createTimestampFromHoursAgo(336),
    type: "health",
  },
  {
    iconName: "check",
    id: "notification-5",
    isRead: false,
    message: "Appointment request accepted",
    relativeTime: "1m ago",
    timestamp: createTimestampFromHoursAgo(24 * 30),
    type: "appointment",
  },
  {
    iconName: "shopping-bag",
    id: "notification-6",
    isRead: true,
    message: "Your checkout is successful, product is on the way",
    relativeTime: "1m ago",
    timestamp: createTimestampFromHoursAgo(24 * 31),
    type: "checkout",
  },
  {
    iconName: "military-tech",
    id: "notification-7",
    isRead: false,
    message: "Award Unlock",
    relativeTime: "2m ago",
    timestamp: createTimestampFromHoursAgo(24 * 60),
    type: "achievement",
  },
  {
    iconName: "favorite-border",
    id: "notification-8",
    isRead: true,
    message: "Vaccinate your pet timely",
    relativeTime: "3m ago",
    timestamp: createTimestampFromHoursAgo(24 * 90),
    type: "health",
  },
];
