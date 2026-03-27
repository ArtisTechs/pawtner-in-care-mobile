import { DonationCard } from "@/components/donations/donation-card";
import { DonationFilterChip } from "@/components/donations/donation-filter-chip";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  DONATION_ASSETS,
  DONATION_FILTER_OPTIONS,
  filterDonationCauses,
  getDonationCauses,
  resolveDonationFilter,
} from "@/features/donations/donations.data";
import type {
  DonationCauseItem,
  DonationFilter,
} from "@/features/donations/donations.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

export default function DonationListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    filter?: string | string[];
  }>();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const donationCauses = useMemo(() => getDonationCauses(), []);
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

  useEffect(() => {
    if (!requestedFilter) {
      return;
    }

    setActiveFilter(requestedFilter);
  }, [requestedFilter]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handlePressDonationAction = (cause: DonationCauseItem) => {
    router.push({
      pathname: "/donations/payment",
      params: {
        donationId: cause.id,
        donationTitle: cause.title,
      },
    });
  };

  const filteredDonationCauses = useMemo(() => {
    return filterDonationCauses(donationCauses, activeFilter);
  }, [activeFilter, donationCauses]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

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
                <Image
                  source={DONATION_ASSETS.donateNowTitle}
                  style={styles.titleImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.filterRow}>
              {DONATION_FILTER_OPTIONS.map((filterOption) => (
                <DonationFilterChip
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
          data={filteredDonationCauses}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No donation causes matched your filters.
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
    titleImage: {
      width: 208,
      height: 48,
      marginTop: -4,
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
      marginTop: 2,
      color: colors.dashboardHeaderText,
      fontSize: 34,
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
