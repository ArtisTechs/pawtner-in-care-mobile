import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { ProfileBadgeItem } from "@/features/profile/profile.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type BadgeListProps = {
  badges: ProfileBadgeItem[];
  onPressAdd: () => void;
};

export function BadgeList({ badges, onPressAdd }: BadgeListProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.card}>
      <ScrollView
        horizontal
        contentContainerStyle={styles.content}
        showsHorizontalScrollIndicator={false}
      >
        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeWrap}>
            <View
              style={[
                styles.badgeIconWrap,
                {
                  backgroundColor: badge.badgeColor,
                },
              ]}
            >
              <MaterialIcons
                color={badge.iconColor}
                name={badge.iconName}
                size={22}
              />
            </View>
          </View>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={onPressAdd}
          style={({ pressed }) => [
            styles.addButtonWrap,
            pressed && styles.addButtonPressed,
          ]}
        >
          <View style={styles.addButtonCircle}>
            <MaterialIcons color={colors.dashboardBottomIcon} name="add" size={24} />
          </View>
          <Text style={styles.addLabel}>ADD</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      marginTop: 16,
      borderRadius: 28,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingVertical: 12,
      paddingHorizontal: 12,
    },
    content: {
      alignItems: "center",
      paddingHorizontal: 2,
      gap: 12,
    },
    badgeWrap: {
      width: 52,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: "rgba(255, 255, 255, 0.92)",
      shadowColor: "rgba(16, 55, 96, 0.35)",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.24,
      shadowRadius: 5,
      elevation: 4,
    },
    addButtonWrap: {
      width: 58,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: 2,
    },
    addButtonCircle: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.dashboardBottomBarBackground,
      shadowColor: "rgba(21, 67, 116, 0.38)",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.24,
      shadowRadius: 4,
      elevation: 3,
    },
    addLabel: {
      marginTop: 3,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 8,
      lineHeight: 11,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    addButtonPressed: {
      opacity: 0.84,
    },
  });
