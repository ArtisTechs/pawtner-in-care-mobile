import { Colors, RoundedFontFamily } from "@/constants/theme";
import { VETERINARY_ASSETS } from "@/features/veterinary/veterinary.data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type VeterinarySearchHeaderProps = {
  onBack: () => void;
  onChangeSearch: (value: string) => void;
  onPressFilter: () => void;
  value: string;
};

export function VeterinarySearchHeader({
  onBack,
  onChangeSearch,
  onPressFilter,
  value,
}: VeterinarySearchHeaderProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.backButtonPressed,
        ]}
      >
        <Image
          source={VETERINARY_ASSETS.backIcon}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>

      <View style={styles.searchSurface}>
        <MaterialIcons
          color={colors.dashboardBottomIconActive}
          name="search"
          size={18}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeSearch}
          placeholder="Search Veterinary Clinic"
          placeholderTextColor="#7E8FA5"
          returnKeyType="search"
          selectionColor={colors.dashboardBottomIcon}
          style={styles.searchInput}
          value={value}
        />
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={onPressFilter}
          style={({ pressed }) => [
            styles.filterButton,
            pressed && styles.filterButtonPressed,
          ]}
        >
          <MaterialIcons
            color={colors.dashboardBottomIconActive}
            name="tune"
            size={20}
          />
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) => {
  const roundedText = { fontFamily: RoundedFontFamily } as const;

  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonPressed: {
      opacity: 0.84,
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    searchSurface: {
      flex: 1,
      minHeight: 46,
      borderRadius: 23,
      backgroundColor: colors.dashboardSectionCardBackground,
      flexDirection: "row",
      alignItems: "center",
      paddingLeft: 14,
      paddingRight: 8,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    },
    searchInput: {
      ...roundedText,
      flex: 1,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    filterButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#EEF5FD",
    },
    filterButtonPressed: {
      opacity: 0.82,
    },
  });
};
