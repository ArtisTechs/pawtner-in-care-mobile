import { PetDetailAttributeCard } from "@/components/pets/pet-detail-attribute-card";
import { PetFosterInfoRow } from "@/components/pets/pet-foster-info-row";
import { PetMediaPreviewCard } from "@/components/pets/pet-media-preview-card";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import type { PetDetailsItem } from "@/features/pets/pets.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type PetDetailsBottomSheetProps = {
  bottomInset: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  pet: PetDetailsItem;
};

export function PetDetailsBottomSheet({
  bottomInset,
  isFavorite,
  onToggleFavorite,
  pet,
}: PetDetailsBottomSheetProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const snapPoints = useMemo(() => ["52%", "94%"], []);
  const videoItems = useMemo(
    () => pet.media.filter((item) => item.type === "video"),
    [pet.media],
  );
  const hasFosterInfo = Boolean(pet.fosterName?.trim() && pet.fosterRole?.trim());

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
          { paddingBottom: bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <View style={styles.nameWrap}>
            <Text numberOfLines={1} style={styles.petName}>
              {pet.name}
            </Text>
            <Text style={styles.metric}>
              {pet.vaccinated ? "Vaccinated" : "Not Vaccinated"}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onToggleFavorite}
            style={({ pressed }) => [
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive,
              pressed && styles.favoritePressed,
            ]}
          >
            <MaterialCommunityIcons
              color={colors.petDetailsOutline}
              name={isFavorite ? "paw" : "paw-outline"}
              size={30}
            />
          </Pressable>
        </View>

        <View style={styles.attributesRow}>
          <PetDetailAttributeCard label="Gender" value={pet.sex} />
          <PetDetailAttributeCard label="Age" value={pet.age} />
          <PetDetailAttributeCard label="Weight" value={pet.weight} />
          <PetDetailAttributeCard label="Height" value={pet.height} />
        </View>

        {hasFosterInfo ? (
          <PetFosterInfoRow
            avatar={pet.fosterAvatar}
            name={pet.fosterName ?? ""}
            role={pet.fosterRole ?? ""}
          />
        ) : (
          <View style={styles.adoptionMessageWrap}>
            <Text style={styles.adoptionMessageTitle}>
              No foster/adoption handler yet
            </Text>
            <Text style={styles.adoptionMessageBody}>
              This pet has not been adopted or assigned to a foster handler.
            </Text>
          </View>
        )}

        <Text style={styles.description}>{pet.description}</Text>

        <Text style={styles.mediaTitle}>Videos</Text>

        {videoItems.length > 0 ? (
          <View style={styles.mediaGrid}>
            {videoItems.map((item) => (
              <PetMediaPreviewCard key={item.id} />
            ))}
          </View>
        ) : (
          <Text style={styles.noMediaText}>No videos</Text>
        )}
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
      backgroundColor: "rgba(29, 78, 136, 0.4)",
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 14,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    nameWrap: {
      flex: 1,
      paddingRight: 10,
    },
    petName: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 48,
      lineHeight: 54,
      fontWeight: "900",
    },
    metric: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
    },
    favoriteButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255, 255, 255, 0.25)",
      marginTop: 2,
    },
    favoriteButtonActive: {
      backgroundColor: "rgba(255, 255, 255, 0.4)",
    },
    favoritePressed: {
      opacity: 0.85,
    },
    attributesRow: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    description: {
      marginTop: 20,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "500",
    },
    adoptionMessageWrap: {
      marginTop: 18,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.petDetailsOutline,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
    },
    adoptionMessageTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
    },
    adoptionMessageBody: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
    },
    mediaTitle: {
      marginTop: 24,
      marginBottom: 10,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "800",
    },
    mediaGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      rowGap: 16,
    },
    noMediaText: {
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      marginTop: 2,
    },
  });
