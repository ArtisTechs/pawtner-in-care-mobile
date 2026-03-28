import { Colors, RoundedFontFamily } from "@/constants/theme";
import { VETERINARY_ASSETS } from "@/features/veterinary/veterinary.data";
import type { VeterinaryClinicItem } from "@/features/veterinary/veterinary.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

type ClinicProfileCardProps = {
  clinic: VeterinaryClinicItem;
};

const resolveClinicLogoSource = (
  source?: VeterinaryClinicItem["logo"] | VeterinaryClinicItem["image"],
) => {
  if (!source) {
    return VETERINARY_ASSETS.clinicPlaceholder;
  }

  if (typeof source === "string") {
    const normalized = source.trim();

    return normalized
      ? { uri: normalized }
      : VETERINARY_ASSETS.clinicPlaceholder;
  }

  return source;
};

export function ClinicProfileCard({ clinic }: ClinicProfileCardProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const logoSource = resolveClinicLogoSource(clinic.logo ?? clinic.image);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.logoWrap}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.headerTextWrap}>
          <Text numberOfLines={1} style={styles.name}>
            {clinic.name}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {clinic.category}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>{clinic.description}</Text>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    card: {
      marginTop: 16,
      borderRadius: 12,
      borderWidth: 1.2,
      borderColor: colors.petDetailsOutline,
      backgroundColor: "rgba(255,255,255,0.36)",
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    logoWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FF7F2A",
      padding: 6,
    },
    logo: {
      width: "100%",
      height: "100%",
    },
    headerTextWrap: {
      flex: 1,
    },
    name: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
    },
    subtitle: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
    },
    description: {
      marginTop: 10,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "500",
    },
  });
