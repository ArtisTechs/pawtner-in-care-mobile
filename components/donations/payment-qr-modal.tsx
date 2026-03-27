import React, { useMemo } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { DonationPaymentMethod } from "@/features/donations/donations.types";
import { useColorScheme } from "@/hooks/use-color-scheme";

type PaymentQrModalProps = {
  visible: boolean;
  method: DonationPaymentMethod | null;
  isSavingQr?: boolean;
  onClose: () => void;
  onCopyDetails: (method: DonationPaymentMethod) => void;
  onSaveQr: (method: DonationPaymentMethod) => void;
};

export function PaymentQrModal({
  visible,
  method,
  isSavingQr = false,
  onClose,
  onCopyDetails,
  onSaveQr,
}: PaymentQrModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!visible || !method) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{method.name.toUpperCase()}</Text>
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>X</Text>
            </Pressable>
          </View>

          <Image
            source={{ uri: method.qrImage }}
            style={styles.qrImage}
            resizeMode="cover"
          />

          <Text style={styles.accountName}>{method.accountName}</Text>
          <Text style={styles.accountNumber}>{method.accountNumber}</Text>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => onSaveQr(method)}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {isSavingQr ? "Saving..." : "Save QR"}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => onCopyDetails(method)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>Copy Details</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(8, 27, 53, 0.38)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 18,
    },
    card: {
      width: "100%",
      maxWidth: 360,
      borderRadius: 14,
      borderWidth: 3,
      borderColor: "#2D86DB",
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 16,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 24,
      position: "relative",
    },
    title: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 27,
      lineHeight: 30,
      fontWeight: "900",
      textAlign: "center",
    },
    closeButton: {
      position: "absolute",
      right: -4,
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    closeText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 18,
      lineHeight: 20,
      fontWeight: "900",
    },
    qrImage: {
      width: "100%",
      aspectRatio: 1,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "rgba(45, 116, 195, 0.32)",
    },
    accountName: {
      marginTop: 10,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 22,
      lineHeight: 24,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: 0.8,
    },
    accountNumber: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: "#1E6FBD",
      fontSize: 24,
      lineHeight: 26,
      fontWeight: "900",
      textAlign: "center",
      letterSpacing: 0.4,
    },
    actionRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#9CC4ED",
      backgroundColor: "#EFF6FF",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    primaryButton: {
      flex: 1,
      minHeight: 40,
      borderRadius: 999,
      backgroundColor: "#2D74C3",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    secondaryButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIconActive,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "800",
    },
    primaryButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "800",
    },
    pressed: {
      opacity: 0.84,
    },
  });
