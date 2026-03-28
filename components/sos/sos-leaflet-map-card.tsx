import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { SosCoordinate } from "@/features/sos/sos.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type SosLeafletMapCardProps = {
  latitude: number;
  longitude: number;
  locationDescription?: string;
  isResolvingLocationDescription?: boolean;
  onLocationChange?: (coordinate: SosCoordinate) => void;
};

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const createMapHtml = ({
  latitude,
  longitude,
  markerIconUri,
}: {
  latitude: number;
  longitude: number;
  markerIconUri: string;
}) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"
    />
    <link rel="stylesheet" href="${LEAFLET_CSS_URL}" />
    <style>
      html,
      body,
      #map {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      .leaflet-control-attribution,
      .leaflet-control-zoom {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>

    <script src="${LEAFLET_JS_URL}"></script>
    <script>
      (function () {
        const initialCoordinates = {
          latitude: ${latitude},
          longitude: ${longitude},
        };
        const markerIconUri = ${JSON.stringify(markerIconUri)};

        const map = L.map("map", {
          attributionControl: false,
          zoomControl: false,
        }).setView(
          [initialCoordinates.latitude, initialCoordinates.longitude],
          14.8,
        );

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 20,
            subdomains: "abcd",
          },
        ).addTo(map);

        const selectedMarker = markerIconUri
          ? L.marker([initialCoordinates.latitude, initialCoordinates.longitude], {
              icon: L.icon({
                iconUrl: markerIconUri,
                iconSize: [40, 55],
                iconAnchor: [20, 50],
              }),
              keyboard: false,
            }).addTo(map)
          : L.circleMarker([initialCoordinates.latitude, initialCoordinates.longitude], {
              radius: 9,
              color: "#FFFFFF",
              weight: 2,
              fillColor: "#2C6EB8",
              fillOpacity: 1,
            }).addTo(map);

        const postCoordinates = (nextLatitude, nextLongitude) => {
          if (
            window.ReactNativeWebView &&
            typeof window.ReactNativeWebView.postMessage === "function"
          ) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                latitude: nextLatitude,
                longitude: nextLongitude,
                type: "location_select",
              }),
            );
          }
        };

        map.on("click", (event) => {
          const nextLatitude = event.latlng.lat;
          const nextLongitude = event.latlng.lng;

          selectedMarker.setLatLng([nextLatitude, nextLongitude]);
          postCoordinates(nextLatitude, nextLongitude);
        });
      })();
    </script>
  </body>
</html>`;

export function SosLeafletMapCard({
  latitude,
  longitude,
  locationDescription,
  isResolvingLocationDescription,
  onLocationChange,
}: SosLeafletMapCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const markerIconUri = useMemo(
    () =>
      Image.resolveAssetSource(require("../../assets/images/sos-pin-icon.png"))
        .uri ?? "",
    [],
  );
  const source = useMemo(
    () => ({
      html: createMapHtml({
        latitude,
        longitude,
        markerIconUri,
      }),
    }),
    [latitude, longitude, markerIconUri],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!onLocationChange) {
      return;
    }

    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        latitude?: unknown;
        longitude?: unknown;
        type?: unknown;
      };

      if (
        payload.type !== "location_select" ||
        typeof payload.latitude !== "number" ||
        !Number.isFinite(payload.latitude) ||
        typeof payload.longitude !== "number" ||
        !Number.isFinite(payload.longitude)
      ) {
        return;
      }

      onLocationChange({
        latitude: payload.latitude,
        longitude: payload.longitude,
      });
    } catch {
      // Ignore malformed map events from WebView.
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.mapWrap}>
        <WebView
          originWhitelist={["*"]}
          source={source}
          onMessage={handleMessage}
          style={styles.webView}
          javaScriptEnabled
          domStorageEnabled
          cacheEnabled={false}
          setSupportMultipleWindows={false}
        />
      </View>

      <View style={styles.addressSection}>
        <Text style={styles.addressTitle}>Address</Text>
        <Text style={styles.addressValue}>
          {isResolvingLocationDescription
            ? "Locating exact address..."
            : locationDescription?.trim() ||
              "Tap the map pin to get the exact address."}
        </Text>
      </View>

      <Text style={styles.locationTitle}>Specify the Location</Text>
      <Text style={styles.locationHelper}>
        Example: I saw him at San Fernando Market, near the Church.
      </Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      borderRadius: 12,
      backgroundColor: "rgba(163, 196, 231, 0.58)",
      padding: 8,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.36)",
    },
    mapWrap: {
      borderRadius: 10,
      overflow: "hidden",
      height: 158,
      backgroundColor: "#D7E7F6",
    },
    webView: {
      flex: 1,
      backgroundColor: "transparent",
    },
    locationTitle: {
      marginTop: 8,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "900",
    },
    locationHelper: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
    },
    addressSection: {
      marginTop: 10,
      borderRadius: 8,
      paddingVertical: 7,
      paddingHorizontal: 8,
      backgroundColor: "rgba(255, 255, 255, 0.46)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.55)",
    },
    addressTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 11,
      lineHeight: 13,
      fontWeight: "900",
    },
    addressValue: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 10,
      lineHeight: 13,
      fontWeight: "700",
    },
  });
