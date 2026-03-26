import type { ImageSourcePropType } from "react-native";

export type VeterinaryClinicFilter = "all" | "popular" | "recommended";

export type VeterinaryClinicMediaType = "photo" | "video";

export type VeterinaryClinicMediaItem = {
  id: string;
  type: VeterinaryClinicMediaType;
  thumbnail?: ImageSourcePropType | string;
};

export type VeterinaryClinicItem = {
  id: string;
  name: string;
  services: string;
  clinicType: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  distanceKm: number;
  openingHours: string;
  phone: string;
  description: string;
  latitude: number;
  longitude: number;
  media: VeterinaryClinicMediaItem[];
  image?: ImageSourcePropType | string;
  logo?: ImageSourcePropType | string;
  isPopular: boolean;
  isRecommended: boolean;
};
