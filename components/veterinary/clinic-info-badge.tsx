import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ClinicInfoBadgeProps = {
  iconName?: React.ComponentProps<typeof MaterialIcons>["name"];
  label?: string;
  onPress?: () => void;
  value: string;
};

export function ClinicInfoBadge({
  iconName,
  label,
  onPress,
  value,
}: ClinicInfoBadgeProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const badgeContentColor = colors.petDetailsTextPrimary;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const isCompactValue = value.length > 8;

  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress && styles.pressed,
      ]}
    >
      {iconName ? (
        <View style={styles.iconWrap}>
          <MaterialIcons color={badgeContentColor} name={iconName} size={16} />
        </View>
      ) : null}
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[styles.value, isCompactValue && styles.valueCompact]}
      >
        {value}
      </Text>
      {label ? (
        <Text numberOfLines={1} style={styles.label}>
          {label}
        </Text>
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      flex: 1,
      minHeight: 72,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.petDetailsOutline,
      backgroundColor: "rgba(255, 255, 255, 0.28)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 8,
      shadowColor: "rgba(255, 255, 255, 0.28)",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    iconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.45)",
      marginBottom: 2,
    },
    value: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 20,
      lineHeight: 24,
      fontWeight: "900",
      textAlign: "center",
    },
    valueCompact: {
      fontSize: 17,
      lineHeight: 21,
    },
    label: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 12,
      lineHeight: 15,
      fontWeight: "700",
      textAlign: "center",
    },
    pressed: {
      opacity: 0.85,
    },
  });
