import { SosFormFooterActions } from "@/components/sos/sos-form-footer-actions";
import { SosLeafletMapCard } from "@/components/sos/sos-leaflet-map-card";
import { SosTypeOptionCard } from "@/components/sos/sos-type-option-card";
import { AppToast } from "@/components/ui/app-toast";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  SOS_ASSETS,
  SOS_DEFAULT_LOCATION,
  SOS_DEFAULT_RESPONDER,
  SOS_DEFAULT_ROUTE_POINTS,
  SOS_REPORT_TYPE_OPTIONS,
} from "@/features/sos/sos.data";
import type {
  SosCoordinate,
  SosFlowData,
  SosReportTypeId,
} from "@/features/sos/sos.types";
import {
  normalizeSosParam,
  serializeSosFlowData,
} from "@/features/sos/sos.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;

const formatCoordinateFallback = (coordinate: SosCoordinate) =>
  `Pinned: ${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;

const formatReverseGeocodedAddress = (
  address?: Location.LocationGeocodedAddress,
) => {
  if (!address) {
    return "";
  }

  const streetLine = [address.streetNumber, address.street]
    .filter((part): part is string => Boolean(part?.trim()))
    .join(" ")
    .trim();

  const segments = [
    address.name?.trim(),
    streetLine,
    address.district?.trim(),
    address.city?.trim(),
    address.subregion?.trim(),
    address.region?.trim(),
    address.postalCode?.trim(),
    address.country?.trim(),
  ].filter((segment): segment is string => Boolean(segment));

  if (!segments.length) {
    return "";
  }

  const uniqueSegments = segments.filter(
    (segment, index) =>
      segments.findIndex(
        (candidate) => candidate.toLowerCase() === segment.toLowerCase(),
      ) === index,
  );

  return uniqueSegments.join(", ");
};

export default function SosDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const params = useLocalSearchParams<{
    imageUri?: string | string[];
  }>();
  const imageUri = normalizeSosParam(params.imageUri)?.trim() ?? "";
  const { hideToast, showToast, toast } = useToast();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const [selectedTypeId, setSelectedTypeId] = useState<SosReportTypeId | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<SosCoordinate>({
    latitude: SOS_DEFAULT_LOCATION.latitude,
    longitude: SOS_DEFAULT_LOCATION.longitude,
  });
  const [locationDescription, setLocationDescription] = useState<string>(
    SOS_DEFAULT_LOCATION.label,
  );
  const [isResolvingLocationDescription, setIsResolvingLocationDescription] =
    useState(false);
  const [situationDescription, setSituationDescription] = useState("");
  const reverseGeocodeRequestRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();

        if (!isMounted || permission.status !== "granted") {
          return;
        }

        const lastKnownPosition = await Location.getLastKnownPositionAsync();

        if (
          isMounted &&
          lastKnownPosition?.coords &&
          Number.isFinite(lastKnownPosition.coords.latitude) &&
          Number.isFinite(lastKnownPosition.coords.longitude)
        ) {
          setSelectedLocation({
            latitude: lastKnownPosition.coords.latitude,
            longitude: lastKnownPosition.coords.longitude,
          });
        }
      } catch {
        // Keep the default SOS location if device location is unavailable.
      }
    };

    void loadCurrentLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const requestId = reverseGeocodeRequestRef.current + 1;
    reverseGeocodeRequestRef.current = requestId;

    const resolveLocationDescription = async () => {
      setIsResolvingLocationDescription(true);

      try {
        const results = await Location.reverseGeocodeAsync({
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
        });
        const formattedAddress = formatReverseGeocodedAddress(results[0]);

        if (!isMounted || reverseGeocodeRequestRef.current !== requestId) {
          return;
        }

        setLocationDescription(
          formattedAddress || formatCoordinateFallback(selectedLocation),
        );
      } catch {
        if (!isMounted || reverseGeocodeRequestRef.current !== requestId) {
          return;
        }

        setLocationDescription(formatCoordinateFallback(selectedLocation));
      } finally {
        if (isMounted && reverseGeocodeRequestRef.current === requestId) {
          setIsResolvingLocationDescription(false);
        }
      }
    };

    void resolveLocationDescription();

    return () => {
      isMounted = false;
    };
  }, [selectedLocation.latitude, selectedLocation.longitude]);

  const displayName = useMemo(() => {
    const firstName = session?.user.firstName?.trim() ?? "";
    const lastName = session?.user.lastName?.trim() ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || "Sarah Lee";
  }, [session?.user.firstName, session?.user.lastName]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/sos");
  };

  const handleProceed = () => {
    if (!imageUri) {
      showToast("Please capture or upload an image first.", "error");
      return;
    }

    if (!selectedTypeId) {
      showToast("Please choose the SOS type.", "error");
      return;
    }

    const normalizedDescription = situationDescription.trim();

    if (!normalizedDescription) {
      showToast("Please explain the situation before proceeding.", "error");
      return;
    }

    const normalizedLocationDescription = locationDescription.trim();

    if (!normalizedLocationDescription) {
      showToast("Please specify the location details.", "error");
      return;
    }

    const routePoints = [
      ...SOS_DEFAULT_ROUTE_POINTS.slice(0, -1),
      {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      },
    ];

    const flowData: SosFlowData = {
      description: normalizedDescription,
      imageUri,
      latitude: selectedLocation.latitude,
      location: normalizedLocationDescription,
      longitude: selectedLocation.longitude,
      reportType: selectedTypeId,
      responderMessageAvailable:
        SOS_DEFAULT_RESPONDER.responderMessageAvailable,
      responderName: SOS_DEFAULT_RESPONDER.responderName,
      responderPhone: SOS_DEFAULT_RESPONDER.responderPhone,
      routePoints,
      submittedAt: new Date().toISOString(),
    };

    router.push({
      pathname: "/sos/waiting",
      params: {
        flowData: serializeSosFlowData(flowData),
      },
    });
  };

  const handleLocationChange = (coordinate: SosCoordinate) => {
    setSelectedLocation(coordinate);
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.loginHeaderGradientStart}
      />
      <AppToast onDismiss={hideToast} toast={toast} />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientStart,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.textureOverlay} />

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={insets.top}
        >
          <View
            style={[
              styles.contentWrap,
              {
                paddingTop: insets.top + 8,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={SOS_ASSETS.backIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </Pressable>

            <ScrollView
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: insets.bottom + 20,
                },
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.heroWrap}>
                <Image
                  source={SOS_ASSETS.shelterIllustration}
                  style={styles.shelterIllustration}
                  resizeMode="contain"
                />

                <Text style={styles.shelterName}>
                  Noah's Ark Dog And Cat Shelter
                </Text>
                <Text style={styles.greetingText}>
                  {`Hi ${displayName}, thank you for your SOS report!`}
                </Text>
                <Text style={styles.supportText}>
                  Please fill out the details below while waiting.
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.optionList}>
                  {SOS_REPORT_TYPE_OPTIONS.map((option) => (
                    <SosTypeOptionCard
                      key={option.id}
                      isSelected={selectedTypeId === option.id}
                      label={option.label}
                      onPress={() => setSelectedTypeId(option.id)}
                    />
                  ))}
                </View>

                <View style={styles.mapSection}>
                  <SosLeafletMapCard
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    locationDescription={locationDescription}
                    isResolvingLocationDescription={
                      isResolvingLocationDescription
                    }
                    onLocationChange={handleLocationChange}
                  />
                </View>

                <View style={styles.descriptionSection}>
                  <Text style={styles.descriptionLabel}>
                    Explain the situation
                  </Text>
                  <TextInput
                    multiline
                    onChangeText={setSituationDescription}
                    placeholder="Type here..."
                    placeholderTextColor="rgba(20, 60, 106, 0.34)"
                    style={styles.descriptionInput}
                    textAlignVertical="top"
                    value={situationDescription}
                  />
                </View>
              </View>

              <SosFormFooterActions
                onCancel={handleBack}
                onProceed={handleProceed}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
      alignItems: "center",
    },
    textureOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    keyboardAvoidingView: {
      flex: 1,
      width: "100%",
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
      paddingHorizontal: 10,
    },
    backButton: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.white,
    },
    scrollContent: {
      flexGrow: 1,
      marginTop: 0,
    },
    heroWrap: {
      alignItems: "center",
      paddingHorizontal: 14,
    },
    shelterIllustration: {
      width: 100,
      height: 80,
      opacity: 0.96,
    },
    shelterName: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "900",
      textAlign: "center",
    },
    greetingText: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "800",
      textAlign: "center",
    },
    supportText: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
      textAlign: "center",
    },
    sectionCard: {
      marginTop: 12,
      borderRadius: 22,
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 12,
      backgroundColor: "rgba(100, 155, 216, 0.24)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.16)",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 5,
    },
    optionList: {
      rowGap: 8,
    },
    mapSection: {
      marginTop: 12,
    },
    descriptionSection: {
      marginTop: 12,
      borderRadius: 10,
      padding: 9,
      backgroundColor: colors.dashboardSectionCardBackground,
    },
    descriptionLabel: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 17,
      lineHeight: 20,
      fontWeight: "900",
    },
    descriptionInput: {
      marginTop: 7,
      minHeight: 100,
      borderRadius: 8,
      backgroundColor: "rgba(198, 214, 232, 0.64)",
      color: colors.dashboardBottomIconActive,
      fontFamily: RoundedFontFamily,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    pressed: {
      opacity: 0.84,
    },
  });
