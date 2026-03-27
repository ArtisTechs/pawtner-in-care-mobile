import { MAP_CONFIG } from "@/config/env";
import React, { useMemo } from "react";
import {
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

const createMapHtml = ({
  googleMapsApiKey,
  latitude,
  longitude,
  markers,
  userLocation,
}: {
  googleMapsApiKey: string;
  latitude: number;
  longitude: number;
  markers: ClinicMapMarker[];
  userLocation?: {
    latitude: number;
    longitude: number;
  } | null;
}) => {
  const serializedMarkers = JSON.stringify(markers);
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

      .clinic-name-tooltip {
        font-size: 11px;
        font-weight: 700;
        line-height: 14px;
        padding: 3px 6px;
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
        const googleMapsApiKey = ${serializedGoogleMapsApiKey};
        const userLocation = ${serializedUserLocation};
        const loadingOverlay = document.getElementById("map-loading");
        let hasMapInitialized = false;
        let googleInitTimeout = null;
        const pinIconCache = {
          selected: null,
          default: null,
        };

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

        const createPinIconUrl = (isSelected) => {
          const primaryStart = isSelected ? "#FF6B72" : "#56A5FF";
          const primaryEnd = isSelected ? "#EA3B45" : "#1C76E8";
          const ringColor = isSelected ? "#FFD9DC" : "#D8EAFF";
          const innerColor = isSelected ? "#FFF7F8" : "#F9FCFF";
          const shadowOpacity = isSelected ? "0.30" : "0.24";
          const svg =
            '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="62" viewBox="0 0 50 62">' +
            '<defs>' +
            '<linearGradient id="pinGrad" x1="25" y1="4" x2="25" y2="40" gradientUnits="userSpaceOnUse">' +
            '<stop offset="0" stop-color="' +
            primaryStart +
            '"/>' +
            '<stop offset="1" stop-color="' +
            primaryEnd +
            '"/>' +
            "</linearGradient>" +
            "</defs>" +
            '<ellipse cx="25" cy="57" rx="10" ry="4.5" fill="#0F172A" fill-opacity="' +
            shadowOpacity +
            '"/>' +
            '<path d="M25 4c-8.8 0-16 7.2-16 16 0 11.4 13.6 26.4 16 29.1 2.4-2.7 16-17.7 16-29.1 0-8.8-7.2-16-16-16z" fill="url(#pinGrad)"/>' +
            '<circle cx="25" cy="20" r="8.3" fill="' +
            innerColor +
            '" fill-opacity="0.98"/>' +
            '<circle cx="25" cy="20" r="11.5" fill="none" stroke="' +
            ringColor +
            '" stroke-opacity="0.94" stroke-width="2"/>' +
            "</svg>";

          return (
            "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg)
          );
        };

        const getPinIconUrl = (isSelected) => {
          const cacheKey = isSelected ? "selected" : "default";

          if (!pinIconCache[cacheKey]) {
            pinIconCache[cacheKey] = createPinIconUrl(isSelected);
          }

          return pinIconCache[cacheKey];
        };

        const createLeafletIcon = (isSelected) =>
          L.icon({
            iconUrl: getPinIconUrl(isSelected),
            iconSize: isSelected ? [50, 62] : [46, 58],
            iconAnchor: isSelected ? [25, 50] : [23, 47],
            tooltipAnchor: isSelected ? [0, -30] : [0, -28],
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
                className: "clinic-name-tooltip",
                direction: "top",
                offset: [0, -4],
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
                url: getPinIconUrl(Boolean(marker.isSelected)),
                scaledSize: marker.isSelected
                  ? new window.google.maps.Size(50, 62)
                  : new window.google.maps.Size(46, 58),
                anchor: marker.isSelected
                  ? new window.google.maps.Point(25, 50)
                  : new window.google.maps.Point(23, 47),
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
                  '<div style="font-size:11px;font-weight:700;line-height:14px;color:#1f4a80;padding:2px 4px;">' +
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
  const googleMapsApiKey = MAP_CONFIG.googleMapsApiKey;
  const source = useMemo(
    () => ({
      html: createMapHtml({
        googleMapsApiKey,
        latitude,
        longitude,
        markers,
        userLocation,
      }),
    }),
    [
      googleMapsApiKey,
      latitude,
      longitude,
      markers,
      userLocation,
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
