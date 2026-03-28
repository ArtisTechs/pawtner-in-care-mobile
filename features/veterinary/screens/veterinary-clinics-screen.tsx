import {
  type BottomFilterOption,
  type BottomFilterSection,
  FilterBottomModal,
} from "@/components/ui/filter-bottom-modal";
import { VeterinaryClinicCard } from "@/components/veterinary/veterinary-clinic-card";
import { VeterinaryFilterChip } from "@/components/veterinary/veterinary-filter-chip";
import { VeterinarySearchHeader } from "@/components/veterinary/veterinary-search-header";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  VETERINARY_CLINICS_MOCK_DATA,
  VETERINARY_FILTER_OPTIONS,
} from "@/features/veterinary/veterinary.data";
import type {
  VeterinaryClinicFilter,
  VeterinaryClinicItem,
} from "@/features/veterinary/veterinary.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const FILTER_SECTION_SORT_KEY = "sort";
const FILTER_SECTION_CATEGORY_KEY = "category";
const ALL_CATEGORY_FILTER_KEY = "all";

const VETERINARY_SORT_OPTIONS: BottomFilterOption[] = [
  { key: "default", label: "Default" },
  { key: "inexpensive", label: "Inexpensive" },
  { key: "expensive", label: "Expensive" },
];

type VeterinarySortFilter =
  (typeof VETERINARY_SORT_OPTIONS)[number]["key"];

const getResultsLabel = (count: number) =>
  count === 1 ? "1 found" : `${count} found`;

const toFilterKey = (value: string) => {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || value.toLowerCase();
};

const getClinicConsultationCostEstimate = (clinic: VeterinaryClinicItem) => {
  const baseByType =
    clinic.clinicType === "Hospital"
      ? 1800
      : clinic.clinicType === "Store"
        ? 900
        : 1300;
  const reviewAdjustment = (clinic.reviewCount % 7) * 45;
  const ratingAdjustment = Math.round((5 - clinic.rating) * 80);

  return baseByType + reviewAdjustment + ratingAdjustment;
};

export default function VeterinaryClinicsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<VeterinaryClinicFilter>("all");
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeSortFilter, setActiveSortFilter] =
    useState<VeterinarySortFilter>("default");
  const [draftSortFilter, setDraftSortFilter] =
    useState<VeterinarySortFilter>("default");
  const [activeCategoryFilter, setActiveCategoryFilter] =
    useState(ALL_CATEGORY_FILTER_KEY);
  const [draftCategoryFilter, setDraftCategoryFilter] =
    useState(ALL_CATEGORY_FILTER_KEY);

  const clinicCategoryOptions = useMemo<BottomFilterOption[]>(() => {
    const uniqueCategories = Array.from(
      new Set(VETERINARY_CLINICS_MOCK_DATA.map((clinic) => clinic.category)),
    ).sort((left, right) => left.localeCompare(right));

    return [
      { key: ALL_CATEGORY_FILTER_KEY, label: "All" },
      ...uniqueCategories.map((category) => ({
        key: toFilterKey(category),
        label: category,
      })),
    ];
  }, []);

  const categoryLabelByKey = useMemo(
    () => new Map(clinicCategoryOptions.map((option) => [option.key, option.label])),
    [clinicCategoryOptions],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleOpenClinic = (clinic: VeterinaryClinicItem) => {
    router.push({
      pathname: "/veterinary-clinic/[clinicId]",
      params: {
        clinicId: clinic.id,
      },
    });
  };

  const handleOpenFilterOptions = () => {
    setDraftSortFilter(activeSortFilter);
    setDraftCategoryFilter(activeCategoryFilter);
    setIsFilterModalVisible(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalVisible(false);
  };

  const handleToggleFilterOption = (sectionKey: string, optionKey: string) => {
    if (sectionKey === FILTER_SECTION_SORT_KEY) {
      setDraftSortFilter(optionKey as VeterinarySortFilter);
      return;
    }

    if (sectionKey === FILTER_SECTION_CATEGORY_KEY) {
      setDraftCategoryFilter(optionKey);
    }
  };

  const handleResetFilterOptions = () => {
    setDraftSortFilter("default");
    setDraftCategoryFilter(ALL_CATEGORY_FILTER_KEY);
    setActiveSortFilter("default");
    setActiveCategoryFilter(ALL_CATEGORY_FILTER_KEY);
    setIsFilterModalVisible(false);
  };

  const handleConfirmFilterOptions = () => {
    setActiveSortFilter(draftSortFilter);
    setActiveCategoryFilter(draftCategoryFilter);
    setIsFilterModalVisible(false);
  };

  const filteredClinics = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const selectedCategoryLabel =
      categoryLabelByKey.get(activeCategoryFilter) ?? "All";

    const filteredItems = VETERINARY_CLINICS_MOCK_DATA.filter((clinic) => {
      const matchesPrimaryFilter =
        activeFilter === "all" ||
        (activeFilter === "popular" && clinic.isPopular) ||
        (activeFilter === "recommended" && clinic.isRecommended);
      const matchesCategory =
        activeCategoryFilter === ALL_CATEGORY_FILTER_KEY ||
        clinic.category === selectedCategoryLabel;

      if (!matchesPrimaryFilter || !matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [clinic.name, clinic.services, clinic.address].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });

    if (activeSortFilter === "default") {
      return filteredItems;
    }

    return [...filteredItems].sort((left, right) => {
      const leftCost = getClinicConsultationCostEstimate(left);
      const rightCost = getClinicConsultationCostEstimate(right);

      return activeSortFilter === "inexpensive"
        ? leftCost - rightCost
        : rightCost - leftCost;
    });
  }, [activeCategoryFilter, activeFilter, activeSortFilter, categoryLabelByKey, searchTerm]);

  const modalSections = useMemo<BottomFilterSection[]>(
    () => [
      {
        key: FILTER_SECTION_SORT_KEY,
        title: "Sort",
        options: VETERINARY_SORT_OPTIONS,
        selectedKeys: [draftSortFilter],
      },
      {
        key: FILTER_SECTION_CATEGORY_KEY,
        title: "Category",
        options: clinicCategoryOptions,
        selectedKeys: [draftCategoryFilter],
      },
    ],
    [clinicCategoryOptions, draftCategoryFilter, draftSortFilter],
  );

  const renderListHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Recommended For You</Text>
      <Text style={styles.sectionCount}>
        {getResultsLabel(filteredClinics.length)}
      </Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.loginHeaderGradientStart}
      />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientStart,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientEnd,
        ]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.backgroundDecorationWrap} pointerEvents="none">
          <View style={styles.decorationLarge} />
          <View style={styles.decorationSmall} />
        </View>

        <View
          style={[
            styles.fixedHeaderContainer,
            {
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <View style={styles.headerWrap}>
            <VeterinarySearchHeader
              onBack={handleBack}
              onChangeSearch={setSearchTerm}
              onPressFilter={handleOpenFilterOptions}
              value={searchTerm}
            />

            <View style={styles.filterRow}>
              {VETERINARY_FILTER_OPTIONS.map((filterOption) => (
                <VeterinaryFilterChip
                  key={filterOption.key}
                  label={filterOption.label}
                  onPress={() => setActiveFilter(filterOption.key)}
                  selected={activeFilter === filterOption.key}
                />
              ))}
            </View>
          </View>
        </View>

        <FlatList
          data={filteredClinics}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No veterinary clinics matched your filters.
              </Text>
            </View>
          }
          ListHeaderComponent={renderListHeader}
          renderItem={({ item }) => (
            <VeterinaryClinicCard
              item={item}
              onPress={() => handleOpenClinic(item)}
              style={styles.card}
            />
          )}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + 28,
            },
          ]}
        />
      </LinearGradient>

      <FilterBottomModal
        visible={isFilterModalVisible}
        sections={modalSections}
        onClose={handleCloseFilterModal}
        onToggleOption={handleToggleFilterOption}
        onReset={handleResetFilterOptions}
        onConfirm={handleConfirmFilterOptions}
      />
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
) => {
  const roundedText = { fontFamily: RoundedFontFamily } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
    },
    backgroundDecorationWrap: {
      ...StyleSheet.absoluteFillObject,
      overflow: "hidden",
    },
    decorationLarge: {
      position: "absolute",
      top: -52,
      left: widthForDecoration(contentWidth, 0.14),
      width: 250,
      height: 250,
      borderRadius: 999,
      borderWidth: 2,
      borderColor: "rgba(68, 173, 255, 0.36)",
    },
    decorationSmall: {
      position: "absolute",
      top: -12,
      left: -36,
      width: 128,
      height: 128,
      borderRadius: 999,
      borderWidth: 1.5,
      borderColor: "rgba(124, 185, 245, 0.28)",
    },
    fixedHeaderContainer: {
      width: "100%",
      alignItems: "center",
    },
    headerWrap: {
      width: contentWidth,
      paddingHorizontal: 24,
      marginBottom: 18,
    },
    filterRow: {
      marginTop: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    list: {
      flex: 1,
      width: "100%",
    },
    listContent: {
      alignItems: "center",
      paddingTop: 4,
    },
    sectionHeader: {
      width: contentWidth,
      paddingHorizontal: 24,
      marginBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    sectionTitle: {
      ...roundedText,
      color: colors.dashboardHeaderText,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
    },
    sectionCount: {
      ...roundedText,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
    },
    itemSeparator: {
      height: 16,
    },
    card: {
      width: contentWidth - 48,
    },
    emptyState: {
      width: contentWidth,
      paddingHorizontal: 24,
      paddingTop: 8,
      alignItems: "center",
    },
    emptyText: {
      ...roundedText,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
      textAlign: "center",
    },
  });
};

const widthForDecoration = (contentWidth: number, multiplier: number) =>
  Math.max(0, contentWidth * multiplier);
