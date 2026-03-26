import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

type FullScreenLoaderProps = {
  absolute?: boolean;
  backgroundColor?: string;
  subtitle?: string;
  visible?: boolean;
};

const { width } = Dimensions.get("window");

const LOGO_SIZE = width * 0.16;
const CIRCLE_SIZE = LOGO_SIZE + 42;
const RING_SIZE = CIRCLE_SIZE;

export function FullScreenLoader({
  absolute = false,
  backgroundColor,
  subtitle = "Please wait while we load everything for you.",
  visible = true,
}: FullScreenLoaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const logoScale = useRef(new Animated.Value(0.96)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    const ringLoop = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    ringLoop.start();

    return () => {
      ringLoop.stop();
      ringRotate.setValue(0);
      logoScale.setValue(0.96);
      logoOpacity.setValue(0);
    };
  }, [logoOpacity, logoScale, ringRotate, visible]);

  if (!visible) {
    return null;
  }

  const spin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        styles.container,
        absolute && styles.absoluteContainer,
        {
          backgroundColor: backgroundColor ?? colors.splashBackground,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.centerWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors.splashCircle,
                shadowColor: colors.splashShadow,
              },
            ]}
          >
            <View
              style={[
                styles.ringTrack,
                { borderColor: colors.splashRingTrack },
              ]}
            />
            <Animated.View
              style={[styles.ringArcWrapper, { transform: [{ rotate: spin }] }]}
            >
              <View
                style={[
                  styles.ringArc,
                  {
                    borderColor: colors.transparent,
                    borderTopColor: colors.splashRingArc,
                    borderRightColor: colors.splashRingArc,
                    borderBottomColor: colors.splashRingArc,
                  },
                ]}
              />
            </Animated.View>

            <Image
              source={require("../../assets/images/logo-transparent.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Image
          source={require("../../assets/images/loading-text.png")}
          style={styles.loadingTextImage}
          resizeMode="contain"
        />
        <Text style={[styles.subtitle, { color: colors.white }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  absoluteContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  content: {
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
    justifyContent: "center",
  },
  centerWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  logoCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  ringTrack: {
    position: "absolute",
    width: RING_SIZE - 8,
    height: RING_SIZE - 8,
    borderRadius: (RING_SIZE - 8) / 2,
    borderWidth: 1.5,
  },
  ringArcWrapper: {
    position: "absolute",
    width: RING_SIZE - 20,
    height: RING_SIZE - 20,
    alignItems: "center",
    justifyContent: "center",
  },
  ringArc: {
    position: "absolute",
    width: RING_SIZE - 20,
    height: RING_SIZE - 20,
    borderRadius: (RING_SIZE - 20) / 2,
    borderWidth: 2,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  loadingTextImage: {
    width: 120,
    height: 20,
    marginTop: 12,
  },
  subtitle: {
    fontFamily: RoundedFontFamily,
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },
});
