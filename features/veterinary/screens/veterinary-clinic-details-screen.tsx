import { ClinicDetailsBottomSheet } from "@/components/veterinary/clinic-details-bottom-sheet";
import { ClinicLeafletMap } from "@/components/veterinary/clinic-leaflet-map";
import { Colors } from "@/constants/theme";
import {
  getDistanceInKilometers,
} from "@/features/veterinary/veterinary-distance";
import {
  getVeterinaryClinicById,
  VETERINARY_ASSETS,
  VETERINARY_CLINICS_MOCK_DATA,
} from "@/features/veterinary/veterinary.data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

type CurrentLocation = {
  latitude: number;
  longitude: number;
};

export default function VeterinaryClinicDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ clinicId?: string }>();
  const clinicId = normalizeParam(params.clinicId);
  const fallbackClinicId = VETERINARY_CLINICS_MOCK_DATA[0]?.id;
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(() => {
    if (clinicId && getVeterinaryClinicById(clinicId)) {
      return clinicId;
    }

    return fallbackClinicId ?? null;
  });
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    const loadCurrentLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!isMounted || permission.status !== "granted") {
          return;
        }

        const lastKnown = await Location.getLastKnownPositionAsync();

        if (
          isMounted &&
          lastKnown?.coords &&
          Number.isFinite(lastKnown.coords.latitude) &&
          Number.isFinite(lastKnown.coords.longitude)
        ) {
          setCurrentLocation({
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          });
        }

        const currentPosition = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted || !currentPosition?.coords) {
          return;
        }

        setCurrentLocation({
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        });
      } catch {
        // Keep fallback clinic distance when location is unavailable.
      }
    };

    void loadCurrentLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!clinicId) {
      return;
    }

    if (getVeterinaryClinicById(clinicId)) {
      setSelectedClinicId(clinicId);
    }
  }, [clinicId]);

  const clinic = useMemo(
    () => (selectedClinicId ? getVeterinaryClinicById(selectedClinicId) : null),
    [selectedClinicId],
  );

  const markers = useMemo(
    () =>
      VETERINARY_CLINICS_MOCK_DATA.map((clinicItem) => ({
        id: clinicItem.id,
        name: clinicItem.name,
        latitude: clinicItem.latitude,
        longitude: clinicItem.longitude,
        isSelected: clinicItem.id === selectedClinicId,
      })),
    [selectedClinicId],
  );

  const computedDistanceKm = useMemo(() => {
    if (!clinic || !currentLocation) {
      return null;
    }

    return getDistanceInKilometers(
      currentLocation.latitude,
      currentLocation.longitude,
      clinic.latitude,
      clinic.longitude,
    );
  }, [clinic, currentLocation]);

  const handleMarkerPress = useCallback((markerId: string) => {
    if (!getVeterinaryClinicById(markerId)) {
      return;
    }

    setSelectedClinicId(markerId);
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/veterinary-clinics");
  };

  if (!clinic) {
    return (
      <View style={styles.notFoundScreen}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.fallbackBackButton}
        >
          <Image
            source={VETERINARY_ASSETS.backIcon}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={styles.fallbackText}>
          Veterinary clinic details not available.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <ClinicLeafletMap
        latitude={clinic.latitude}
        longitude={clinic.longitude}
        markers={markers}
        onMarkerPress={handleMarkerPress}
        userLocation={currentLocation}
      />

      <Pressable
        accessibilityRole="button"
        hitSlop={10}
        onPress={handleBack}
        style={[
          styles.backButton,
          {
            top: insets.top + 8,
          },
        ]}
      >
        <Image
          source={VETERINARY_ASSETS.backIcon}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>

      <ClinicDetailsBottomSheet
        bottomInset={Math.max(insets.bottom, 14)}
        clinic={clinic}
        distanceKm={computedDistanceKm}
      />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    backButton: {
      position: "absolute",
      left: 18,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(14, 49, 84, 0.28)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    notFoundScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 20,
    },
    fallbackBackButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      backgroundColor: colors.dashboardSubtleText,
    },
    fallbackText: {
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "700",
      textAlign: "center",
    },
  });
