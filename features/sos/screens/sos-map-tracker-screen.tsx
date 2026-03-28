import { SosActionButton } from "@/components/sos/sos-action-button";
import { SosTrackerLeafletMap } from "@/components/sos/sos-tracker-leaflet-map";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { SOS_ASSETS, SOS_DEFAULT_LOCATION } from "@/features/sos/sos.data";
import type { SosCoordinate } from "@/features/sos/sos.types";
import {
  normalizeSosParam,
  parseSosFlowDataParam,
} from "@/features/sos/sos.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const ORIGIN_PROXIMITY_THRESHOLD = 0.00018;

const getFallbackRoute = (origin: SosCoordinate): SosCoordinate[] => [
  { latitude: origin.latitude + 0.0204, longitude: origin.longitude - 0.0462 },
  { latitude: origin.latitude + 0.0159, longitude: origin.longitude - 0.031 },
  { latitude: origin.latitude + 0.0098, longitude: origin.longitude - 0.0174 },
  { latitude: origin.latitude + 0.0054, longitude: origin.longitude - 0.0073 },
  origin,
];

const getDistanceSquared = (a: SosCoordinate, b: SosCoordinate) =>
  (a.latitude - b.latitude) ** 2 + (a.longitude - b.longitude) ** 2;

const isNearCoordinate = (a: SosCoordinate, b: SosCoordinate) =>
  getDistanceSquared(a, b) <= ORIGIN_PROXIMITY_THRESHOLD ** 2;

const normalizeRouteTowardsOrigin = (
  rawRoutePoints: SosCoordinate[] | undefined,
  origin: SosCoordinate,
): SosCoordinate[] => {
  const baseRoute = rawRoutePoints?.length
    ? [...rawRoutePoints]
    : getFallbackRoute(origin);

  if (!baseRoute.length) {
    return getFallbackRoute(origin);
  }

  const firstPoint = baseRoute[0];
  const lastPoint = baseRoute[baseRoute.length - 1];
  const shouldReverse =
    getDistanceSquared(firstPoint, origin) < getDistanceSquared(lastPoint, origin);

  const orderedRoute = shouldReverse ? [...baseRoute].reverse() : baseRoute;

  const routeEndingAtOrigin = isNearCoordinate(
    orderedRoute[orderedRoute.length - 1],
    origin,
  )
    ? orderedRoute
    : [...orderedRoute, origin];

  return routeEndingAtOrigin.length > 1
    ? routeEndingAtOrigin
    : getFallbackRoute(origin);
};

export default function SosMapTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    flowData?: string | string[];
  }>();
  const serializedFlowData = normalizeSosParam(params.flowData);
  const parsedFlowData = parseSosFlowDataParam(params.flowData);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { height, width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const availableHeight = Math.max(height - insets.top - insets.bottom, 560);
  const mapHeight = Math.min(
    430,
    Math.max(252, Math.round(availableHeight * 0.52)),
  );
  const styles = useMemo(
    () => createStyles(colors, contentWidth, mapHeight),
    [colors, contentWidth, mapHeight],
  );

  const origin = useMemo<SosCoordinate>(() => {
    if (
      parsedFlowData &&
      Number.isFinite(parsedFlowData.latitude) &&
      Number.isFinite(parsedFlowData.longitude)
    ) {
      return {
        latitude: parsedFlowData.latitude,
        longitude: parsedFlowData.longitude,
      };
    }

    return {
      latitude: SOS_DEFAULT_LOCATION.latitude,
      longitude: SOS_DEFAULT_LOCATION.longitude,
    };
  }, [parsedFlowData]);

  const routePoints = useMemo(() => {
    return normalizeRouteTowardsOrigin(parsedFlowData?.routePoints, origin);
  }, [origin, parsedFlowData?.routePoints]);

  const responderPoint = routePoints[0] ?? origin;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/sos/waiting",
      params: serializedFlowData
        ? {
            flowData: serializedFlowData,
          }
        : undefined,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.dashboardSectionCardBackground}
      />

      <View
        style={[
          styles.header,
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
            { top: insets.top + 8 },
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={SOS_ASSETS.backIcon}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>

        <Text style={styles.title}>
          Pet Rescue and Respondent{"\n"}are on the way
        </Text>
      </View>

      <View style={styles.mapWrap}>
        <SosTrackerLeafletMap
          origin={origin}
          responder={responderPoint}
          routePoints={routePoints}
        />
      </View>

      <View
        style={[
          styles.bottomCard,
          {
            paddingBottom: insets.bottom + 10,
          },
        ]}
      >
        <Text style={styles.bottomTitle}>While waiting, would you like to...</Text>

        <SosActionButton
          label="Check nearby vet clinics"
          onPress={() => router.push("/veterinary-clinics")}
          style={styles.bottomButton}
          variant="primary"
        />

        <SosActionButton
          label="Ask Dog Bot for first aid"
          onPress={() => router.push("/support")}
          style={styles.bottomButton}
          variant="primary"
        />

        <SosActionButton
          label="Ask for help from the community"
          onPress={() => router.push("/community")}
          style={styles.bottomButton}
          variant="primary"
        />
      </View>
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
  mapHeight: number,
) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardSectionCardBackground,
      alignItems: "center",
    },
    header: {
      width: contentWidth,
      minHeight: 130,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 14,
      top: 12,
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.dashboardScreenBackground,
    },
    title: {
      maxWidth: 318,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardScreenBackground,
      fontSize: 20,
      lineHeight: 30,
      fontWeight: "900",
      textAlign: "center",
    },
    mapWrap: {
      width: contentWidth,
      minHeight: mapHeight,
      flexGrow: 1,
      backgroundColor: "#DFEAF5",
    },
    bottomCard: {
      width: contentWidth,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 16,
      paddingTop: 14,
      rowGap: 10,
    },
    bottomTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardScreenBackground,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 3,
    },
    bottomButton: {
      minHeight: 42,
      borderRadius: 10,
    },
    pressed: {
      opacity: 0.84,
    },
  });
