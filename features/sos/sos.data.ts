import type { ImageSourcePropType } from "react-native";
import type { SosCoordinate, SosReportTypeId } from "@/features/sos/sos.types";

type SosReportTypeOption = {
  id: SosReportTypeId;
  label: string;
};

type SosAssets = {
  backIcon: ImageSourcePropType;
  emergencyVehicle: ImageSourcePropType;
  previewPlaceholder: ImageSourcePropType;
  responderAvatar: ImageSourcePropType;
  shelterIllustration: ImageSourcePropType;
};

export const SOS_ASSETS: SosAssets = {
  backIcon: require("../../assets/images/back-icon.png"),
  emergencyVehicle: require("../../assets/images/emergency-vehicle.png"),
  previewPlaceholder: require("../../assets/images/dog.png"),
  responderAvatar: require("../../assets/images/dog-bot-icon.png"),
  shelterIllustration: require("../../assets/images/center-outline.png"),
};

export const SOS_REPORT_TYPE_OPTIONS: SosReportTypeOption[] = [
  { id: "injured-or-diseased-stray", label: "Injured or Diseased stray" },
  { id: "accidents", label: "Accidents" },
  { id: "random-stray", label: "Random Stray" },
];

export const SOS_DEFAULT_LOCATION = {
  label: "San Fernando Market, near the Church.",
  latitude: 15.0349,
  longitude: 120.6844,
} as const;

export const SOS_DEFAULT_RESPONDER = {
  responderMessageAvailable: false,
  responderName: "Kuya Ken",
  responderPhone: "+63 917 012 3456",
} as const;

export const SOS_DEFAULT_ROUTE_POINTS: SosCoordinate[] = [
  { latitude: 15.0748, longitude: 120.6272 },
  { latitude: 15.0669, longitude: 120.6436 },
  { latitude: 15.0589, longitude: 120.6584 },
  { latitude: 15.0502, longitude: 120.6721 },
  {
    latitude: SOS_DEFAULT_LOCATION.latitude,
    longitude: SOS_DEFAULT_LOCATION.longitude,
  },
];
