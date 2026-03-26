import { MAP_CONFIG } from "@/config/env";
import React, { useMemo } from "react";
import {
  Image,
  StyleSheet,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

type ClinicMapMarker = {
  id: string;
  isSelected?: boolean;
  latitude: number;
  longitude: number;
  name: string;
};

type ClinicLeafletMapProps = {
  latitude: number;
  longitude: number;
  markers: ClinicMapMarker[];
  onMarkerPress?: (markerId: string) => void;
  style?: StyleProp<ViewStyle>;
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
};

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const RED_PIN_ICON = require("../../assets/images/red-pin-icon.png");
const BLUE_PIN_ICON = require("../../assets/images/blue-pin-icon.png");

const createMapHtml = ({
  bluePinIconUrl,
  googleMapsApiKey,
  latitude,
  longitude,
  markers,
  userLocation,
  redPinIconUrl,
}: {
  bluePinIconUrl: string;
  googleMapsApiKey: string;
  latitude: number;
  longitude: number;
  markers: ClinicMapMarker[];
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  redPinIconUrl: string;
}) => {
  const serializedMarkers = JSON.stringify(markers);
  const serializedRedPinIconUrl = JSON.stringify(redPinIconUrl);
  const serializedBluePinIconUrl = JSON.stringify(bluePinIconUrl);
  const serializedGoogleMapsApiKey = JSON.stringify(googleMapsApiKey);
  const serializedUserLocation = JSON.stringify(userLocation ?? null);

  return `<!DOCTYPE html>
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
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden;
      }

      body {
        background: #d8e8f8;
      }

      #map {
        position: relative;
        z-index: 1;
      }

      #map-loading {
        position: absolute;
        inset: 0;
        z-index: 2;
        display: flex;
        align-items: center;
        justify-content: center;
        background:
          radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.7), rgba(216, 232, 248, 0.92)),
          linear-gradient(180deg, #e7f1fb 0%, #d7e9fb 100%);
        color: #1f4a80;
        font-family: Arial, sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.2px;
      }

      .leaflet-control-attribution,
      .leaflet-control-zoom {
        display: none;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="map-loading">Loading map...</div>

    <script src="${LEAFLET_JS_URL}"></script>
    <script>
      (function () {
        const center = { lat: ${latitude}, lng: ${longitude} };
        const markers = ${serializedMarkers};
        const redPinIconUrl = ${serializedRedPinIconUrl};
        const bluePinIconUrl = ${serializedBluePinIconUrl};
        const googleMapsApiKey = ${serializedGoogleMapsApiKey};
        const userLocation = ${serializedUserLocation};
        const loadingOverlay = document.getElementById("map-loading");
        let hasMapInitialized = false;
        let googleInitTimeout = null;

        const postMarkerPress = (markerId) => {
          const payload = JSON.stringify({
            type: "marker_press",
            markerId,
          });

          if (
            window.ReactNativeWebView &&
            typeof window.ReactNativeWebView.postMessage === "function"
          ) {
            window.ReactNativeWebView.postMessage(payload);
          }
        };

        const escapeHtml = (value) =>
          String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        const hideLoading = () => {
          if (loadingOverlay) {
            loadingOverlay.style.display = "none";
          }
        };

        const clearGoogleTimeout = () => {
          if (googleInitTimeout) {
            clearTimeout(googleInitTimeout);
            googleInitTimeout = null;
          }
        };

        const createLeafletIcon = (isSelected) =>
          L.icon({
            iconUrl: isSelected ? redPinIconUrl : bluePinIconUrl,
            iconSize: [42, 46],
            iconAnchor: [21, 45],
            tooltipAnchor: [0, -34],
          });

        const hasValidUserLocation =
          Boolean(userLocation) &&
          Number.isFinite(userLocation.latitude) &&
          Number.isFinite(userLocation.longitude);
        const selectedMarker =
          markers.find((marker) => Boolean(marker.isSelected)) || markers[0] || null;

        const initLeafletFallbackMap = () => {
          if (hasMapInitialized) {
            return;
          }

          hasMapInitialized = true;
          clearGoogleTimeout();

          const fallbackMap = L.map("map", {
            zoomControl: false,
            attributionControl: false,
          }).setView([center.lat, center.lng], 13.5);

          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
            {
              subdomains: "abcd",
              maxZoom: 20,
            },
          ).addTo(fallbackMap);

          markers.forEach((marker) => {
            const renderedMarker = L.marker(
              [marker.latitude, marker.longitude],
              {
                icon: createLeafletIcon(Boolean(marker.isSelected)),
                keyboard: false,
              },
            ).addTo(fallbackMap);

            renderedMarker.on("click", () => {
              postMarkerPress(marker.id);
            });

            if (marker.name) {
              renderedMarker.bindTooltip(marker.name, {
                direction: "top",
                offset: [0, -34],
                opacity: 0.9,
              });

              if (marker.isSelected) {
                renderedMarker.openTooltip();
              }
            }
          });

          if (hasValidUserLocation) {
            const userMarker = L.circleMarker(
              [userLocation.latitude, userLocation.longitude],
              {
                radius: 8,
                color: "#FFFFFF",
                weight: 2,
                fillColor: "#2B7FD8",
                fillOpacity: 1,
              },
            ).addTo(fallbackMap);

            userMarker.bindTooltip("Your location", {
              direction: "top",
              offset: [0, -8],
              opacity: 0.95,
            });
          }

          if (hasValidUserLocation && selectedMarker) {
            fallbackMap.fitBounds(
              [
                [selectedMarker.latitude, selectedMarker.longitude],
                [userLocation.latitude, userLocation.longitude],
              ],
              {
              padding: [36, 36],
              maxZoom: 14,
              },
            );
          }

          hideLoading();
        };

        const initGoogleMap = () => {
          if (hasMapInitialized) {
            return;
          }

          const mapElement = document.getElementById("map");

          if (!mapElement || !window.google || !window.google.maps) {
            initLeafletFallbackMap();
            return;
          }

          hasMapInitialized = true;
          clearGoogleTimeout();

          const googleMap = new window.google.maps.Map(mapElement, {
            center,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            clickableIcons: false,
            backgroundColor: "#d8e8f8",
            styles: [
              { featureType: "poi", stylers: [{ visibility: "off" }] },
              { featureType: "transit", stylers: [{ visibility: "off" }] },
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#e4e8ef" }],
              },
              {
                featureType: "road",
                elementType: "labels.text.fill",
                stylers: [{ color: "#65748a" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#b8d9ff" }],
              },
              {
                featureType: "landscape",
                elementType: "geometry",
                stylers: [{ color: "#edf4fb" }],
              },
            ],
          });

          markers.forEach((marker) => {
            const googleMarker = new window.google.maps.Marker({
              position: { lat: marker.latitude, lng: marker.longitude },
              map: googleMap,
              title: marker.name || "",
              icon: {
                url: marker.isSelected ? redPinIconUrl : bluePinIconUrl,
                scaledSize: new window.google.maps.Size(42, 46),
                anchor: new window.google.maps.Point(21, 45),
              },
              zIndex: marker.isSelected ? 2 : 1,
              animation: marker.isSelected
                ? window.google.maps.Animation.DROP
                : null,
            });

            let infoWindow = null;

            if (marker.name) {
              infoWindow = new window.google.maps.InfoWindow({
                content:
                  '<div style="font-size:12px;font-weight:700;line-height:16px;color:#1f4a80;padding:2px 4px;">' +
                  escapeHtml(marker.name) +
                  "</div>",
              });

              if (marker.isSelected) {
                infoWindow.open({
                  anchor: googleMarker,
                  map: googleMap,
                  shouldFocus: false,
                });
              }
            }

            googleMarker.addListener("click", () => {
              postMarkerPress(marker.id);

              if (infoWindow) {
                infoWindow.open({
                  anchor: googleMarker,
                  map: googleMap,
                  shouldFocus: false,
                });
              }
            });
          });

          if (hasValidUserLocation) {
            new window.google.maps.Marker({
              position: {
                lat: userLocation.latitude,
                lng: userLocation.longitude,
              },
              map: googleMap,
              title: "Your location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#2B7FD8",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeOpacity: 1,
                strokeWeight: 2,
              },
              zIndex: 3,
            });
          }

          if (hasValidUserLocation && selectedMarker) {
            const googleBounds = new window.google.maps.LatLngBounds();

            googleBounds.extend({
              lat: selectedMarker.latitude,
              lng: selectedMarker.longitude,
            });
            googleBounds.extend({
              lat: userLocation.latitude,
              lng: userLocation.longitude,
            });

            if (!googleBounds.isEmpty()) {
              googleMap.fitBounds(googleBounds, 54);
            }
          }

          hideLoading();
        };

        window.gm_authFailure = () => {
          initLeafletFallbackMap();
        };

        window.__initClinicGoogleMap = () => {
          try {
            initGoogleMap();
          } catch (error) {
            initLeafletFallbackMap();
          }
        };

        if (!googleMapsApiKey) {
          initLeafletFallbackMap();
          return;
        }

        const googleScript = document.createElement("script");
        googleScript.src =
          "https://maps.googleapis.com/maps/api/js?key=" +
          encodeURIComponent(googleMapsApiKey) +
          "&callback=__initClinicGoogleMap";
        googleScript.async = true;
        googleScript.defer = true;
        googleScript.onerror = () => {
          initLeafletFallbackMap();
        };
        document.head.appendChild(googleScript);

        googleInitTimeout = setTimeout(() => {
          initLeafletFallbackMap();
        }, 5500);
      })();
    </script>
  </body>
</html>`;
};

export function ClinicLeafletMap({
  latitude,
  longitude,
  markers,
  onMarkerPress,
  style,
  userLocation,
}: ClinicLeafletMapProps) {
  const redPinIconUri = useMemo(
    () => Image.resolveAssetSource(RED_PIN_ICON).uri,
    [],
  );
  const bluePinIconUri = useMemo(
    () => Image.resolveAssetSource(BLUE_PIN_ICON).uri,
    [],
  );
  const googleMapsApiKey = MAP_CONFIG.googleMapsApiKey;
  const source = useMemo(
    () => ({
      html: createMapHtml({
        bluePinIconUrl: bluePinIconUri,
        googleMapsApiKey,
        latitude,
        longitude,
        markers,
        userLocation,
        redPinIconUrl: redPinIconUri,
      }),
    }),
    [
      bluePinIconUri,
      googleMapsApiKey,
      latitude,
      longitude,
      markers,
      userLocation,
      redPinIconUri,
    ],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!onMarkerPress) {
      return;
    }

    try {
      const payload = JSON.parse(event.nativeEvent.data) as {
        markerId?: unknown;
        type?: unknown;
      };

      if (
        payload.type === "marker_press" &&
        typeof payload.markerId === "string" &&
        payload.markerId.trim()
      ) {
        onMarkerPress(payload.markerId);
      }
    } catch {
      // Ignore malformed events from WebView content.
    }
  };

  return (
    <View style={[styles.container, style]}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
