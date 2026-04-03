import Constants from "expo-constants";
import { Platform } from "react-native";

type ExpoExtra = {
  apiBaseUrl?: string;
  cloudinaryCloudName?: string;
  cloudinaryFolder?: string;
  cloudinaryUploadPreset?: string;
  googleMapsApiKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;

const fallbackBaseUrl =
  Platform.OS === "android"
    ? "http://192.168.0.229:8081/api"
    : "http://192.168.0.229:8081/api";

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

const configuredCloudinaryCloudName =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  extra.cloudinaryCloudName ??
  "";

const configuredCloudinaryUploadPreset =
  process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET ??
  extra.cloudinaryUploadPreset ??
  "";

const configuredCloudinaryFolder =
  process.env.EXPO_PUBLIC_CLOUDINARY_FOLDER ?? extra.cloudinaryFolder ?? "";

export const CLOUDINARY_CONFIG = {
  cloudName: configuredCloudinaryCloudName.trim(),
  folder: configuredCloudinaryFolder.trim(),
  uploadPreset: configuredCloudinaryUploadPreset.trim(),
} as const;
