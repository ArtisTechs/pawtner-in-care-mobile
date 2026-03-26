import Constants from "expo-constants";
import { Platform } from "react-native";

type ExpoExtra = {
  apiBaseUrl?: string;
  googleMapsApiKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

const fallbackBaseUrl =
  Platform.OS === "android"
    ? "http://192.168.0.229:8080/api"
    : "http://192.168.0.229:8080/api";

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? fallbackBaseUrl;

export const API_CONFIG = {
  baseUrl: configuredBaseUrl.replace(/\/+$/, ""),
} as const;

const configuredGoogleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? extra.googleMapsApiKey ?? "";

export const MAP_CONFIG = {
  googleMapsApiKey: configuredGoogleMapsApiKey.trim(),
} as const;
