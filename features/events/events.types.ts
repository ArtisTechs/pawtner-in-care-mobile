import type { ImageSourcePropType } from "react-native";

export type EventType = "events" | "local";

export type EventMetaLabel = "Time" | "Date";

export type EventItem = {
  id: string;
  title: string;
  type: EventType;
  image?: ImageSourcePropType | string;
  description: string;
  eventDate: string;
  startDate: string;
  endDate: string;
  timeLabel: EventMetaLabel;
  timeValue: string;
  facebookUrl?: string;
  isFeatured: boolean;
  month: number;
  year: number;
  day: number;
};
