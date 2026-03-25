import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

const LOGO_SIZE = width * 0.24;
const CIRCLE_SIZE = LOGO_SIZE + 60;
const RING_SIZE = CIRCLE_SIZE;
const RIPPLE_BASE = LOGO_SIZE;
const MAX_RIPPLE = Math.sqrt(width * width + height * height) * 2;
const RIPPLE_SCALE_TARGET = MAX_RIPPLE / RIPPLE_BASE;

export default function Index() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { isHydrating, session } = useAuth();
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(0)).current;
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
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

    // Spinning ring
    const ringLoop = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    ringLoop.start();

    // After 2s: ripple expands
    const rippleTimer = setTimeout(() => {
      ringLoop.stop();

      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rippleScale, {
          toValue: RIPPLE_SCALE_TARGET,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Ripple done: fade out the logo circle
        Animated.timing(logoOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setIsAnimationComplete(true);
        });
      });
    }, 2000);

    return () => {
      clearTimeout(rippleTimer);
    };
  }, [
    logoOpacity,
    logoScale,
    ringOpacity,
    ringRotate,
    rippleScale,
  ]);

  useEffect(() => {
    if (isHydrating || !isAnimationComplete) {
      return;
    }

    router.replace(session ? "/(tabs)" : "/(auth)/login");
  }, [isAnimationComplete, isHydrating, session]);

  const spin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.splashBackground }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Ripple */}
      <Animated.View
        style={[
          styles.ripple,
          {
            backgroundColor: colors.splashRipple,
            transform: [{ scale: rippleScale }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Logo circle with spinning ring */}
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
            style={[styles.ringTrack, { borderColor: colors.splashRingTrack }]}
          />
          <Animated.View
            style={[
              styles.ringArcWrapper,
              { opacity: ringOpacity, transform: [{ rotate: spin }] },
            ]}
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
            source={require("../assets/images/logo-transparent.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ripple: {
    position: "absolute",
    width: RIPPLE_BASE,
    height: RIPPLE_BASE,
    borderRadius: RIPPLE_BASE / 2,
    zIndex: 0,
  },
  centerWrap: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  logoCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
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
});
