import type { SosCoordinate } from "@/features/sos/sos.types";
import React, { useMemo } from "react";
import { Image, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

type SosTrackerLeafletMapProps = {
  origin: SosCoordinate;
  responder: SosCoordinate;
  routePoints: SosCoordinate[];
};

const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

const createMapHtml = ({
  origin,
  responder,
  routePoints,
  originMarkerIconUri,
  responderMarkerIconUri,
}: SosTrackerLeafletMapProps & {
  originMarkerIconUri: string;
  responderMarkerIconUri: string;
}) => {
  const serializedOrigin = JSON.stringify(origin);
  const serializedResponder = JSON.stringify(responder);
  const serializedRoutePoints = JSON.stringify(routePoints);
  const serializedOriginMarkerIconUri = JSON.stringify(originMarkerIconUri);
  const serializedResponderMarkerIconUri = JSON.stringify(
    responderMarkerIconUri,
  );

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
        const origin = ${serializedOrigin};
        const responder = ${serializedResponder};
        const routePoints = ${serializedRoutePoints};
        const originMarkerIconUri = ${serializedOriginMarkerIconUri};
        const responderMarkerIconUri = ${serializedResponderMarkerIconUri};

        const map = L.map("map", {
          attributionControl: false,
          zoomControl: false,
        }).setView([origin.latitude, origin.longitude], 13.5);

        map.createPane("routePane");
        map.getPane("routePane").style.zIndex = "390";

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 20,
            subdomains: "abcd",
          },
        ).addTo(map);

        const fallbackPathCoordinates = routePoints.map((point) => [
          point.latitude,
          point.longitude,
        ]);
        let routeLayer = null;

        const fitToCoordinates = (coordinates) => {
          const coordinatesToFit = [
            ...coordinates,
            [origin.latitude, origin.longitude],
            [responder.latitude, responder.longitude],
          ];
          const bounds = L.latLngBounds(coordinatesToFit);

          if (bounds.isValid()) {
            map.fitBounds(bounds, { maxZoom: 15, padding: [34, 34] });
          }
        };

        const drawRouteLine = (coordinates) => {
          if (routeLayer) {
            map.removeLayer(routeLayer);
            routeLayer = null;
          }

          if (coordinates.length > 1) {
            routeLayer = L.polyline(coordinates, {
              pane: "routePane",
              color: "#1F6FD1",
              opacity: 0.95,
              weight: 7,
              lineCap: "round",
              lineJoin: "round",
            }).addTo(map);
          }

          fitToCoordinates(coordinates);
        };

        const fetchRoadRouteCoordinates = async () => {
          if (routePoints.length < 2) {
            return null;
          }

          const deduplicatedRoutePoints = routePoints.filter((point, index) => {
            if (index === 0) {
              return true;
            }

            const previousPoint = routePoints[index - 1];
            return (
              previousPoint.latitude !== point.latitude ||
              previousPoint.longitude !== point.longitude
            );
          });

          if (deduplicatedRoutePoints.length < 2) {
            return null;
          }

          const routePathParam = deduplicatedRoutePoints
            .map(
              (point) =>
                point.longitude.toFixed(6) + "," + point.latitude.toFixed(6),
            )
            .join(";");
          const requestUrl =
            "https://router.project-osrm.org/route/v1/driving/" +
            routePathParam +
            "?overview=full&geometries=geojson";

          try {
            const response = await fetch(requestUrl);

            if (!response.ok) {
              return null;
            }

            const payload = await response.json();

            if (
              !payload ||
              payload.code !== "Ok" ||
              !Array.isArray(payload.routes) ||
              !payload.routes.length ||
              !payload.routes[0] ||
              !payload.routes[0].geometry ||
              !Array.isArray(payload.routes[0].geometry.coordinates)
            ) {
              return null;
            }

            const roadCoordinates = payload.routes[0].geometry.coordinates
              .filter(
                (coordinate) =>
                  Array.isArray(coordinate) &&
                  coordinate.length >= 2 &&
                  Number.isFinite(coordinate[0]) &&
                  Number.isFinite(coordinate[1]),
              )
              .map((coordinate) => [coordinate[1], coordinate[0]]);

            return roadCoordinates.length > 1 ? roadCoordinates : null;
          } catch {
            return null;
          }
        };

        drawRouteLine(fallbackPathCoordinates);

        void fetchRoadRouteCoordinates().then((roadCoordinates) => {
          if (roadCoordinates) {
            drawRouteLine(roadCoordinates);
          }
        });

        const createPinMarker = (coordinate, iconUri, titleText, fallbackColor) => {
          let marker = null;

          if (iconUri) {
            const pinIcon = L.icon({
              iconUrl: iconUri,
              iconSize: [40, 50],
              iconAnchor: [20, 52],
              tooltipAnchor: [0, -42],
            });

            marker = L.marker([coordinate.latitude, coordinate.longitude], {
              icon: pinIcon,
              keyboard: false,
            }).addTo(map);
          } else {
            marker = L.circleMarker([coordinate.latitude, coordinate.longitude], {
              radius: 11,
              color: "#FFFFFF",
              weight: 2.5,
              fillColor: fallbackColor,
              fillOpacity: 1,
            }).addTo(map);
          }

          if (titleText) {
            marker.bindTooltip(titleText, {
              direction: "top",
              offset: [0, -8],
              opacity: 0.95,
            });
          }

          return marker;
        };

        createPinMarker(origin, originMarkerIconUri, "Your location", "#0E70CF");
        createPinMarker(responder, responderMarkerIconUri, "Responder", "#1DB37F");
      })();
    </script>
  </body>
</html>`;
};

export function SosTrackerLeafletMap({
  origin,
  responder,
  routePoints,
}: SosTrackerLeafletMapProps) {
  const originMarkerIconUri = useMemo(
    () =>
      Image.resolveAssetSource(require("../../assets/images/sos-pin-icon.png"))
        .uri ?? "",
    [],
  );
  const responderMarkerIconUri = useMemo(
    () =>
      Image.resolveAssetSource(require("../../assets/images/blue-pin-icon.png"))
        .uri ?? "",
    [],
  );

  const source = useMemo(
    () => ({
      html: createMapHtml({
        origin,
        responder,
        routePoints,
        originMarkerIconUri,
        responderMarkerIconUri,
      }),
    }),
    [
      origin,
      originMarkerIconUri,
      responder,
      responderMarkerIconUri,
      routePoints,
    ],
  );

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={source}
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
    flex: 1,
    backgroundColor: "#E9EEF5",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
