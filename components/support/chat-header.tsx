import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ChatHeaderProps = {
  avatarSource: ImageSourcePropType;
  backIconSource?: ImageSourcePropType;
  onPressBack?: () => void;
  titleText: string;
  topInset: number;
};

export function ChatHeader({
  avatarSource,
  backIconSource,
  onPressBack,
  titleText,
  topInset,
}: ChatHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topInset + 8,
        },
      ]}
      >
        <View style={styles.sideSlot}>
        {onPressBack && backIconSource ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onPressBack}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Image source={backIconSource} style={styles.backIcon} resizeMode="contain" />
          </Pressable>
        ) : (
          <View style={styles.emptySlot} />
        )}
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.titleText}>{titleText}</Text>
        <Text style={styles.status}>
          <Text style={styles.statusDot}>{"\u2022 "}</Text>
          Online
        </Text>
      </View>

      <View style={styles.sideSlot}>
        <Image source={avatarSource} style={styles.avatar} resizeMode="contain" />
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      width: "100%",
      minHeight: 92,
      paddingHorizontal: 20,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sideSlot: {
      width: 46,
      alignItems: "center",
      justifyContent: "center",
    },
    emptySlot: {
      width: 36,
      height: 36,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 22,
      height: 22,
      tintColor: colors.dashboardHeaderText,
    },
    titleWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    titleText: {
      fontFamily: DisplayFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 32,
      lineHeight: 34,
      letterSpacing: 0.4,
      textAlign: "center",
    },
    status: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
      textAlign: "center",
    },
    statusDot: {
      color: "#A9F28E",
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
    },
    avatar: {
      width: 42,
      height: 42,
    },
    pressed: {
      opacity: 0.84,
    },
  });
