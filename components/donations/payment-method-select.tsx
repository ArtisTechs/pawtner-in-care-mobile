import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  View,
  type ViewStyle,
} from "react-native";

import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { DonationPaymentMethod } from "@/features/donations/donations.types";
import { useColorScheme } from "@/hooks/use-color-scheme";

type PaymentMethodSelectProps = {
  methods: DonationPaymentMethod[];
  selectedMethod: DonationPaymentMethod | null;
  onSelectMethod: (method: DonationPaymentMethod) => void;
  style?: StyleProp<ViewStyle>;
};

export function PaymentMethodSelect({
  methods,
  selectedMethod,
  onSelectMethod,
  style,
}: PaymentMethodSelectProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const referenceValue =
    selectedMethod?.accountNumber || selectedMethod?.referenceLabel || "**********";

  return (
    <View
      style={[
        styles.wrapper,
        isDropdownOpen && styles.wrapperOpen,
        style,
      ]}
    >
      <View style={styles.fieldRow}>
        <View style={styles.dropdownWrap}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsDropdownOpen((currentValue) => !currentValue)}
            style={({ pressed }) => [
              styles.dropdownButton,
              pressed && styles.pressed,
            ]}
          >
            <Text numberOfLines={1} style={styles.dropdownLabel}>
              {selectedMethod ? selectedMethod.name : "Payment:"}
            </Text>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name={isDropdownOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={18}
            />
          </Pressable>

          {isDropdownOpen ? (
            <View style={styles.dropdownMenu}>
              {methods.map((method) => (
                <Pressable
                  key={method.id}
                  accessibilityRole="button"
                  onPress={() => {
                    onSelectMethod(method);
                    setIsDropdownOpen(false);
                  }}
                  style={({ pressed }) => [
                    styles.dropdownOption,
                    selectedMethod?.id === method.id && styles.dropdownOptionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.dropdownOptionText}>{method.name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.referenceField}>
          <Text numberOfLines={1} style={styles.referenceLabel}>
            {referenceValue}
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    wrapper: {
      zIndex: 2,
    },
    wrapperOpen: {
      zIndex: 8,
    },
    fieldRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    dropdownWrap: {
      flex: 0.92,
      position: "relative",
    },
    dropdownButton: {
      minHeight: 30,
      borderRadius: 8,
      backgroundColor: colors.dashboardSectionCardBackground,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 8,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    dropdownLabel: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      flex: 1,
      marginRight: 6,
    },
    dropdownMenu: {
      position: "absolute",
      top: 34,
      left: 0,
      right: 0,
      borderRadius: 8,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: "rgba(45, 116, 195, 0.28)",
      backgroundColor: colors.dashboardSectionCardBackground,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.24,
      shadowRadius: 6,
      elevation: 4,
    },
    dropdownOption: {
      minHeight: 30,
      justifyContent: "center",
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(45, 116, 195, 0.16)",
    },
    dropdownOptionSelected: {
      backgroundColor: "#EAF2FD",
    },
    dropdownOptionText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
    },
    referenceField: {
      flex: 2.2,
      minHeight: 30,
      borderRadius: 8,
      backgroundColor: "rgba(172, 209, 245, 0.6)",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    referenceLabel: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSectionCardBackground,
      fontSize: 10,
      lineHeight: 12,
      fontWeight: "700",
      letterSpacing: 1.1,
    },
    pressed: {
      opacity: 0.88,
    },
  });
