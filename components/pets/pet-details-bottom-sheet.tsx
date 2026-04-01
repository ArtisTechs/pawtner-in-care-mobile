import { PetDetailAttributeCard } from "@/components/pets/pet-detail-attribute-card";
import { PetFosterInfoRow } from "@/components/pets/pet-foster-info-row";
import { PetMediaPreviewCard } from "@/components/pets/pet-media-preview-card";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import type { PetDetailsItem } from "@/features/pets/pets.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";

type PetDetailsBottomSheetProps = {
  animatedIndex?: SharedValue<number>;
  bottomInset: number;
  isFavorite: boolean;
  onSheetChange?: (index: number) => void;
  onToggleFavorite: () => void;
  pet: PetDetailsItem;
};

export function PetDetailsBottomSheet({
  animatedIndex,
  bottomInset,
  isFavorite,
  onSheetChange,
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
  const detailsUnderVaccinated = useMemo(() => {
    const items: string[] = [];

    if (pet.adoptionDate?.trim()) {
      items.push(`Adoption: ${pet.adoptionDate}`);
    }

    if (pet.rescuedDate?.trim()) {
      items.push(`Rescued: ${pet.rescuedDate}`);
    }

    if (pet.birthDate?.trim()) {
      items.push(`Birth: ${pet.birthDate}`);
    }

    if (pet.breed?.trim()) {
      items.push(`Breed: ${pet.breed}`);
    }

    if (pet.status?.trim()) {
      items.push(`Status: ${pet.status}`);
    }

    return items;
  }, [pet.adoptionDate, pet.birthDate, pet.breed, pet.rescuedDate, pet.status]);
  const attributeItems = useMemo(() => {
    const items: { label: string; value: string }[] = [
      { label: "Gender", value: pet.sex },
    ];

    if (pet.age.trim()) {
      items.push({ label: "Age", value: pet.age });
    }

    if (pet.weight.trim()) {
      items.push({ label: "Weight", value: pet.weight });
    }

    if (pet.height.trim()) {
      items.push({ label: "Height", value: pet.height });
    }

    return items;
  }, [pet.age, pet.height, pet.sex, pet.weight]);
  const hasFosterInfo = Boolean(pet.fosterName?.trim() && pet.fosterRole?.trim());
  const hasDescription = pet.description.trim().length > 0;

  return (
    <BottomSheet
      animatedIndex={animatedIndex}
      index={0}
      snapPoints={snapPoints}
      backgroundStyle={styles.sheetBackground}
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={onSheetChange}
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
            {detailsUnderVaccinated.length > 0 ? (
              <Text style={styles.metricDetails}>
                {detailsUnderVaccinated.join(" | ")}
              </Text>
            ) : null}
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
          {attributeItems.map((item) => (
            <PetDetailAttributeCard
              key={item.label}
              label={item.label}
              value={item.value}
            />
          ))}
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

        {hasDescription ? (
          <Text style={styles.description}>{pet.description}</Text>
        ) : null}

        <Text
          style={[
            styles.mediaTitle,
            !hasDescription && styles.mediaTitleCompactTopSpacing,
          ]}
        >
          Video
        </Text>

        {videoItems.length > 0 ? (
          <View style={styles.mediaList}>
            {videoItems.map((item) => (
              <PetMediaPreviewCard
                key={item.id}
                videoUrl={item.videoUrl}
              />
            ))}
          </View>
        ) : (
          <Text style={styles.noMediaText}>No video</Text>
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
      fontFamily: DisplayFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 48,
      lineHeight: 54,
      fontWeight: "900",
    },
    metric: {
      marginTop: 1,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "700",
    },
    metricDetails: {
      marginTop: 2,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "600",
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
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "600",
    },
    mediaTitle: {
      marginTop: 24,
      marginBottom: 10,
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextPrimary,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "800",
    },
    mediaTitleCompactTopSpacing: {
      marginTop: 16,
    },
    mediaList: {
      rowGap: 12,
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
