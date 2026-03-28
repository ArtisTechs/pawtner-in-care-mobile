import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

type GlowingCircleProps = {
  color?: string;
  glowColor?: string;
  glowRadius?: number;
  pulseAnimation?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function GlowingCircle({
  color = "#FFFFFF",
  glowColor = "#FFFFFF",
  glowRadius = 80,
  pulseAnimation = true,
  size = 120,
  style,
}: GlowingCircleProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!pulseAnimation) {
      return;
    }

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.07,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [opacityAnim, pulseAnim, pulseAnimation]);

  const glowLayers = useMemo(() => {
    const layers = 8;

    return Array.from({ length: layers }, (_, index) => {
      const progress = index / (layers - 1);
      const spread = 3.1 - progress * 2.5;
      const opacity = 0.03 + (1 - progress) * 0.13;

      return {
        size: size + glowRadius * spread,
        opacity,
      };
    });
  }, [glowRadius, size]);

  const containerSize = size + glowRadius * 2.8 + 20;
  const outerAnimatedSize = size + glowRadius * 2.2;
  const innerAnimatedSize = size + glowRadius * 0.5;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }, style]}>
      {glowLayers.map((layer, index) => (
        <View
          key={index}
          style={{
            position: "absolute",
            width: layer.size,
            height: layer.size,
            borderRadius: layer.size / 2,
            backgroundColor: glowColor,
            opacity: layer.opacity,
          }}
        />
      ))}

      <Animated.View
        style={{
          position: "absolute",
          width: outerAnimatedSize,
          height: outerAnimatedSize,
          borderRadius: outerAnimatedSize / 2,
          backgroundColor: glowColor,
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.02, 0.055],
          }),
          transform: [{ scale: pulseAnim }],
        }}
      />

      <Animated.View
        style={{
          position: "absolute",
          width: innerAnimatedSize,
          height: innerAnimatedSize,
          borderRadius: innerAnimatedSize / 2,
          backgroundColor: glowColor,
          opacity: opacityAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.1, 0.18],
          }),
          transform: [{ scale: pulseAnim }],
        }}
      />

      <View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: glowColor,
          opacity: 0.3,
        }}
      />

      <View
        style={{
          position: "absolute",
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: (size * 0.6) / 2,
          backgroundColor: color,
          opacity: 0.55,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
