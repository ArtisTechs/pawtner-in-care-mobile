import { RoundedFontFamily } from "@/constants/theme";
import React from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type DashboardCategoryButtonProps = {
  bubbleColor: string;
  iconSource: ImageSourcePropType;
  label: string;
  labelColor: string;
  onPress?: () => void;
};

export function DashboardCategoryButton({
  bubbleColor,
  iconSource,
  label,
  labelColor,
  onPress,
}: DashboardCategoryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.circle, { backgroundColor: bubbleColor }]}>
        <Image source={iconSource} style={styles.iconImage} resizeMode="contain" />
      </View>
      <Text numberOfLines={2} style={[styles.label, { color: labelColor }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 72,
    alignItems: "center",
    gap: 8,
  },
  pressed: {
    opacity: 0.88,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  iconImage: {
    width: 30,
    height: 30,
  },
  label: {
    fontFamily: RoundedFontFamily,
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "700",
    textAlign: "center",
    minHeight: 28,
  },
});
