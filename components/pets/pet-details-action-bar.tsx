import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PetDetailsActionBarProps = {
  bottomInset: number;
  onAdoptPress?: () => void;
  onCallPress?: () => void;
  onChatPress?: () => void;
};

export function PetDetailsActionBar({
  bottomInset,
  onAdoptPress,
  onCallPress,
  onChatPress,
}: PetDetailsActionBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(bottomInset, 10),
        },
      ]}
    >
      <View style={styles.bar}>
        <View style={styles.iconGroup}>
          <Pressable
            accessibilityRole="button"
            onPress={onCallPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <MaterialIcons color={colors.petDetailsActionIcon} name="call" size={30} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onChatPress}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
          >
            <MaterialIcons
              color={colors.petDetailsActionIcon}
              name="chat-bubble"
              size={30}
            />
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onAdoptPress}
          style={({ pressed }) => [
            styles.adoptButton,
            pressed && styles.adoptButtonPressed,
          ]}
        >
          <Text style={styles.adoptText}>ADOPT ME</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: "center",
      zIndex: 5,
      backgroundColor: colors.petDetailsActionBarBackground,
      borderTopWidth: 1,
      borderTopColor: "rgba(40, 80, 122, 0.22)",
    },
    bar: {
      width: "100%",
      maxWidth: 420,
      minHeight: 86,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 22,
      paddingTop: 10,
      gap: 14,
    },
    iconGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 18,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    adoptButton: {
      height: 52,
      minWidth: 172,
      borderRadius: 14,
      backgroundColor: colors.petDetailsAdoptButtonBackground,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    adoptButtonPressed: {
      opacity: 0.9,
    },
    adoptText: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsAdoptButtonText,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "900",
      letterSpacing: 0.8,
    },
    pressed: {
      opacity: 0.84,
    },
  });
