import { ClinicInfoBadge } from "@/components/veterinary/clinic-info-badge";
import { ClinicMediaPreviewCard } from "@/components/veterinary/clinic-media-preview-card";
import { ClinicProfileCard } from "@/components/veterinary/clinic-profile-card";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { VeterinaryClinicItem } from "@/features/veterinary/veterinary.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Linking from "expo-linking";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

type ClinicDetailsBottomSheetProps = {
  bottomInset: number;
  clinic: VeterinaryClinicItem;
  distanceKm?: number | null;
};

const formatDistance = (distanceKm?: number | null) => {
  if (typeof distanceKm !== "number" || !Number.isFinite(distanceKm)) {
    return "Distance unavailable";
  }

  return `${distanceKm.toFixed(1)} kilometers Away from you`;
};

const normalizePhoneToTelHref = (phone: string) =>
  `tel:${phone.replace(/[^\d+]/g, "")}`;

export function ClinicDetailsBottomSheet({
  bottomInset,
  clinic,
  distanceKm,
}: ClinicDetailsBottomSheetProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const snapPoints = useMemo(() => ["28%", "86%"], []);
  const distanceLabel = formatDistance(distanceKm ?? clinic.distanceKm);

  const handleCallClinic = () => {
    void Linking.openURL(normalizePhoneToTelHref(clinic.phone));
  };

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={styles.sheetBackground}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handleIndicator}
      style={styles.sheetShadow}
    >
      <BottomSheetScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: bottomInset + 18 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroTextWrap}>
          <Text numberOfLines={2} style={styles.title}>
            {clinic.name}
          </Text>

          <View style={styles.addressRow}>
            <MaterialIcons
              color={colors.petDetailsTextPrimary}
              name="location-on"
              size={15}
            />
            <Text style={styles.address}>{clinic.address}</Text>
          </View>

          <Text style={styles.distance}>{distanceLabel}</Text>
        </View>

        <View style={styles.badgesRow}>
          <ClinicInfoBadge
            value={clinic.rating.toFixed(1)}
            label="Ratings"
            iconName="star"
          />
          <ClinicInfoBadge value={clinic.openingHours} label="Time" />
          <ClinicInfoBadge
            value="Call us"
            iconName="call"
            onPress={handleCallClinic}
          />
        </View>

        <ClinicProfileCard clinic={clinic} />

        <Text style={styles.mediaTitle}>Media</Text>

        <View style={styles.mediaRow}>
          {clinic.media.map((mediaItem) => (
            <ClinicMediaPreviewCard key={mediaItem.id} item={mediaItem} />
          ))}
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    sheetShadow: {
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
    },
    sheetBackground: {
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      backgroundColor: colors.petDetailsSheetBackground,
      borderWidth: 1.2,
      borderBottomWidth: 0,
      borderColor: colors.petDetailsOutline,
      overflow: "hidden",
    },
    handleIndicator: {
      width: 44,
      height: 5,
      backgroundColor: "rgba(29, 78, 136, 0.42)",
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },
    heroTextWrap: {
      paddingRight: 2,
    },
    title: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 42,
      lineHeight: 46,
      fontWeight: "900",
    },
    addressRow: {
      marginTop: 4,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 4,
      paddingRight: 10,
    },
    address: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "600",
    },
    distance: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
    },
    badgesRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "stretch",
      justifyContent: "space-between",
      gap: 10,
    },
    mediaTitle: {
      marginTop: 18,
      marginBottom: 10,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: "800",
    },
    mediaRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 2,
    },
  });
