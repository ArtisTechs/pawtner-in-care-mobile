import { DonationCard } from "@/components/donations/donation-card";
import { DonationFilterChip } from "@/components/donations/donation-filter-chip";
import { AppToast } from "@/components/ui/app-toast";
import {
  FilterBottomModal,
  type BottomFilterSection,
} from "@/components/ui/filter-bottom-modal";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  DONATION_ASSETS,
  DONATION_FILTER_OPTIONS,
  fetchDonationCauses,
  filterDonationCauses,
  isDonationFilter,
  isDonationCampaignDonatable,
  resolveDonationFilter,
} from "@/features/donations/donations.data";
import type {
  DonationCauseItem,
  DonationFilter,
} from "@/features/donations/donations.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const MAX_VISIBLE_FILTER_PILLS = 4;
const FILTER_MODAL_SECTION_KEY = "donation-filter-options";

export default function DonationListingScreen() {
  const router = useRouter();
  const { isHydrating, session } = useAuth();
  const params = useLocalSearchParams<{
    filter?: string | string[];
  }>();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { hideToast, showToast, toast } = useToast();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const [donationCauses, setDonationCauses] = useState<DonationCauseItem[]>([]);
  const [isCampaignLoading, setIsCampaignLoading] = useState(true);
  const requestedFilter = useMemo(
    () => resolveDonationFilter(params.filter),
    [params.filter],
  );
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const [activeFilter, setActiveFilter] = useState<DonationFilter>(
    requestedFilter ?? "all",
  );
  const [pendingModalFilter, setPendingModalFilter] = useState<DonationFilter>(
    requestedFilter ?? "all",
  );
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const shouldShowFilterOverflow =
    DONATION_FILTER_OPTIONS.length > MAX_VISIBLE_FILTER_PILLS;
  const visibleFilterOptions = shouldShowFilterOverflow
    ? DONATION_FILTER_OPTIONS.slice(0, MAX_VISIBLE_FILTER_PILLS - 1)
    : DONATION_FILTER_OPTIONS;
  const visibleFilterKeySet = useMemo(
    () => new Set(visibleFilterOptions.map((option) => option.key)),
    [visibleFilterOptions],
  );
  const isHiddenFilterActive =
    shouldShowFilterOverflow && !visibleFilterKeySet.has(activeFilter);
  const filterModalSections = useMemo<BottomFilterSection[]>(
    () => [
      {
        key: FILTER_MODAL_SECTION_KEY,
        options: DONATION_FILTER_OPTIONS.map((option) => ({
          key: option.key,
          label: option.label,
        })),
        selectedKeys: [pendingModalFilter],
        title: "Donation Campaign",
      },
    ],
    [pendingModalFilter],
  );

  useEffect(() => {
    if (!requestedFilter) {
      return;
    }

    setActiveFilter(requestedFilter);
    setPendingModalFilter(requestedFilter);
  }, [requestedFilter]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handlePressDonationAction = (cause: DonationCauseItem) => {
    if (!isDonationCampaignDonatable(cause)) {
      showToast("This campaign is no longer accepting donations.", "error");
      return;
    }

    router.push({
      pathname: "/donations/payment",
      params: {
        donationId: cause.id,
        donationTitle: cause.title,
      },
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadCampaigns = async () => {
      if (isHydrating) {
        if (isMounted) {
          setIsCampaignLoading(true);
        }
        return;
      }

      if (!session?.accessToken) {
        if (isMounted) {
          setDonationCauses([]);
          setIsCampaignLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsCampaignLoading(true);
      }

      try {
        const campaigns = await fetchDonationCauses(session.accessToken);

        if (isMounted) {
          setDonationCauses(campaigns);
        }
      } catch (error) {
        console.error("[donation-listing] Failed to load campaigns", error);

        if (isMounted) {
          setDonationCauses([]);
          showToast(
            getErrorMessage(error, "Unable to load donation campaigns."),
            "error",
          );
        }
      } finally {
        if (isMounted) {
          setIsCampaignLoading(false);
        }
      }
    };

    void loadCampaigns();

    return () => {
      isMounted = false;
    };
  }, [isHydrating, session?.accessToken, showToast]);

  const filteredDonationCauses = useMemo(() => {
    return filterDonationCauses(donationCauses, activeFilter);
  }, [activeFilter, donationCauses]);

  const handleOpenAllFilters = () => {
    setPendingModalFilter(activeFilter);
    setIsFilterModalVisible(true);
  };

  const handleCloseFilterModal = () => {
    setIsFilterModalVisible(false);
    setPendingModalFilter(activeFilter);
  };

  const handleToggleFilterOption = (sectionKey: string, optionKey: string) => {
    if (sectionKey !== FILTER_MODAL_SECTION_KEY || !isDonationFilter(optionKey)) {
      return;
    }

    setPendingModalFilter(optionKey);
  };

  const handleResetFilterModal = () => {
    setPendingModalFilter("all");
  };

  const handleConfirmFilterModal = () => {
    setActiveFilter(pendingModalFilter);
    setIsFilterModalVisible(false);
  };

  return (
    <View style={styles.screen}>
      <AppToast onDismiss={hideToast} toast={toast} />
      <FilterBottomModal
        visible={isFilterModalVisible}
        sections={filterModalSections}
        onClose={handleCloseFilterModal}
        onToggleOption={handleToggleFilterOption}
        onReset={handleResetFilterModal}
        onConfirm={handleConfirmFilterModal}
        title="Filters"
      />
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
        <View
          style={[
            styles.fixedHeaderContainer,
            {
              paddingTop: insets.top + 8,
            },
          ]}
        >
          <View style={styles.headerWrap}>
            <View style={styles.titleRow}>
              <Pressable
                accessibilityRole="button"
                onPress={handleBack}
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
              >
                <Image
                  source={DONATION_ASSETS.backIcon}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </Pressable>

              <View style={styles.titleBlock}>
                <Text style={styles.kicker}>LOOKING FOR A</Text>
                <Text style={styles.titleText}>DONATE NOW</Text>
              </View>
            </View>

            <View style={styles.filterRow}>
              {visibleFilterOptions.map((filterOption) => (
                <DonationFilterChip
                  key={filterOption.key}
                  label={filterOption.label}
                  onPress={() => setActiveFilter(filterOption.key)}
                  selected={activeFilter === filterOption.key}
                />
              ))}
              {shouldShowFilterOverflow ? (
                <DonationFilterChip
                  label="See all"
                  onPress={handleOpenAllFilters}
                  selected={isHiddenFilterActive}
                />
              ) : null}
            </View>
          </View>
        </View>

        <FlatList
          data={filteredDonationCauses}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {isCampaignLoading
                  ? "Loading donation campaigns..."
                  : "No donation campaigns matched your filters."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <DonationCard
              item={item}
              onPressAction={handlePressDonationAction}
              style={styles.card}
            />
          )}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: insets.bottom + 22,
            },
          ]}
        />
      </LinearGradient>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) => {
  const roundedText = { fontFamily: RoundedFontFamily } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
    },
    fixedHeaderContainer: {
      width: "100%",
      alignItems: "center",
    },
    headerWrap: {
      width: contentWidth,
      paddingHorizontal: 24,
      marginBottom: 10,
    },
    titleRow: {
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 64,
    },
    backButton: {
      position: "absolute",
      left: 0,
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
    titleBlock: {
      alignItems: "center",
      justifyContent: "center",
    },
    titleText: {
      marginTop: -1,
      fontFamily: DisplayFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 32,
      lineHeight: 34,
      letterSpacing: 0.4,
      textAlign: "center",
    },
    kicker: {
      ...roundedText,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "600",
      letterSpacing: 0.8,
    },
    title: {
      ...roundedText,
      fontFamily: DisplayFontFamily,
      marginTop: 2,
      color: colors.dashboardHeaderText,
      fontSize: 32,
      lineHeight: 37,
      fontWeight: "900",
      letterSpacing: 0.4,
    },
    filterRow: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    list: {
      flex: 1,
      width: "100%",
    },
    listContent: {
      alignItems: "center",
      paddingTop: 4,
    },
    itemSeparator: {
      height: 12,
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
