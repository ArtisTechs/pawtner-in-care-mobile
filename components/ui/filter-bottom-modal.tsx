import { Colors, RoundedFontFamily } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type BottomFilterOption = {
  key: string;
  label: string;
};

export type BottomFilterSection = {
  key: string;
  title: string;
  options: BottomFilterOption[];
  selectedKeys: string[];
};

type FilterBottomModalProps = {
  visible: boolean;
  sections: BottomFilterSection[];
  onClose: () => void;
  onToggleOption: (sectionKey: string, optionKey: string) => void;
  onReset: () => void;
  onConfirm: () => void;
  title?: string;
  resetLabel?: string;
  confirmLabel?: string;
};

const defaultTitle = "Filter";
const defaultResetLabel = "Reset";
const defaultConfirmLabel = "Confirm";

export function FilterBottomModal({
  visible,
  sections,
  onClose,
  onToggleOption,
  onReset,
  onConfirm,
  title = defaultTitle,
  resetLabel = defaultResetLabel,
  confirmLabel = defaultConfirmLabel,
}: FilterBottomModalProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />

        <View
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + 12,
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <View style={styles.separator} />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section) => (
              <View key={section.key} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <View style={styles.chipsWrap}>
                  {section.options.map((option) => {
                    const isSelected = section.selectedKeys.includes(option.key);

                    return (
                      <Pressable
                        key={option.key}
                        accessibilityRole="button"
                        onPress={() => onToggleOption(section.key, option.key)}
                        style={({ pressed }) => [
                          styles.chip,
                          isSelected && styles.chipSelected,
                          pressed && styles.chipPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipLabel,
                            isSelected && styles.chipLabelSelected,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              onPress={onReset}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Text style={styles.secondaryButtonLabel}>{resetLabel}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.actionPressed,
              ]}
            >
              <Text style={styles.primaryButtonLabel}>{confirmLabel}</Text>
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
      justifyContent: "flex-end",
      backgroundColor: "rgba(10, 25, 43, 0.32)",
    },
    sheet: {
      minHeight: 320,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 18,
      paddingTop: 10,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 12,
    },
    handle: {
      alignSelf: "center",
      width: 38,
      height: 4,
      borderRadius: 99,
      backgroundColor: "rgba(29, 78, 136, 0.24)",
    },
    title: {
      marginTop: 8,
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "900",
      color: colors.dashboardBottomIconActive,
    },
    separator: {
      marginTop: 10,
      height: 1,
      width: "100%",
      backgroundColor: "rgba(39, 88, 145, 0.13)",
    },
    scrollContent: {
      paddingTop: 16,
      paddingBottom: 14,
      rowGap: 16,
    },
    section: {
      rowGap: 9,
    },
    sectionTitle: {
      fontFamily: RoundedFontFamily,
      fontSize: 24,
      lineHeight: 28,
      fontWeight: "900",
      color: colors.dashboardBottomIconActive,
    },
    chipsWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      minHeight: 34,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#D7E7FA",
      backgroundColor: "#F3F8FF",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    chipSelected: {
      backgroundColor: "#79B2EC",
      borderColor: "#79B2EC",
    },
    chipPressed: {
      opacity: 0.85,
    },
    chipLabel: {
      fontFamily: RoundedFontFamily,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "700",
      color: colors.dashboardBottomIcon,
    },
    chipLabelSelected: {
      color: colors.dashboardSectionCardBackground,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    secondaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 24,
      backgroundColor: "#A9CFFD",
      alignItems: "center",
      justifyContent: "center",
    },
    primaryButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 24,
      backgroundColor: "#62A8EF",
      alignItems: "center",
      justifyContent: "center",
    },
    secondaryButtonLabel: {
      fontFamily: RoundedFontFamily,
      fontSize: 22,
      lineHeight: 25,
      fontWeight: "800",
      color: colors.dashboardSectionCardBackground,
    },
    primaryButtonLabel: {
      fontFamily: RoundedFontFamily,
      fontSize: 22,
      lineHeight: 25,
      fontWeight: "800",
      color: colors.dashboardSectionCardBackground,
    },
    actionPressed: {
      opacity: 0.88,
    },
  });
