import { DonationHomeHeroCard } from "@/components/donations/donation-home-hero-card";
import { DonationHomeMiniCard } from "@/components/donations/donation-home-mini-card";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  DONATION_ASSETS,
  getDonationCauses,
  selectFundStraysCauses,
  selectUrgentFundraisingCauses,
} from "@/features/donations/donations.data";
import type {
  DonationCauseItem,
  DonationFilter,
} from "@/features/donations/donations.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;

export default function DonationFrontScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const urgentCardWidth = Math.min(
    Math.max(292, contentWidth - 54),
    contentWidth - 24,
  );
  const allDonationCauses = useMemo(() => getDonationCauses(), []);
  const urgentCauses = useMemo(
    () => selectUrgentFundraisingCauses(allDonationCauses),
    [allDonationCauses],
  );
  const fundStraysCauses = useMemo(
    () => selectFundStraysCauses(allDonationCauses),
    [allDonationCauses],
  );
  const styles = useMemo(
    () => createStyles(colors, contentWidth, urgentCardWidth),
    [colors, contentWidth, urgentCardWidth],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleOpenListing = (filter: DonationFilter = "all") => {
    if (filter === "all") {
      router.push("/donations/listing");
      return;
    }

    router.push({
      pathname: "/donations/listing",
      params: { filter },
    });
  };

  const handleOpenPayment = (cause: DonationCauseItem) => {
    router.push({
      pathname: "/donations/payment",
      params: {
        donationId: cause.id,
        donationTitle: cause.title,
      },
    });
  };

  const handlePressUrgentCause = (cause: DonationCauseItem) => {
    handleOpenPayment(cause);
  };

  const handlePressFundStraysCause = (cause: DonationCauseItem) => {
    handleOpenPayment(cause);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.contentWrap}>
        <View
          style={[
            styles.headerWrap,
            {
              paddingTop: insets.top + 14,
            },
          ]}
        >
          <View style={styles.headerRow}>
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
                style={[
                  styles.backIcon,
                  {
                    tintColor: colors.dashboardBottomIconActive,
                  },
                ]}
                resizeMode="contain"
              />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Donation</Text>
              <Text style={styles.subtitle}>
                {"Noah's Ark Dogs and Cats Shelter"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={[
            styles.bodyContent,
            {
              paddingBottom: insets.bottom + 8,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, styles.sectionTitlePadded]}>
              Urgent Fundraising
            </Text>

            <FlatList
              horizontal
              data={urgentCauses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DonationHomeHeroCard
                  item={item}
                  onPress={handlePressUrgentCause}
                  style={styles.urgentCard}
                />
              )}
              ItemSeparatorComponent={() => (
                <View style={styles.urgentCardGap} />
              )}
              contentContainerStyle={styles.urgentListContent}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Fund Strays</Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => handleOpenListing("all")}
                style={({ pressed }) => [pressed && styles.seeAllPressed]}
              >
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>

            <FlatList
              horizontal
              data={fundStraysCauses}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DonationHomeMiniCard
                  item={item}
                  onPress={handlePressFundStraysCause}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.miniCardGap} />}
              contentContainerStyle={styles.miniListContent}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (
  colors: typeof Colors.light,
  contentWidth: number,
  urgentCardWidth: number,
) => {
  const roundedText = { fontFamily: RoundedFontFamily } as const;

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
      alignItems: "center",
    },
    contentWrap: {
      flex: 1,
      width: contentWidth,
      backgroundColor: colors.dashboardScreenBackground,
    },
    headerWrap: {
      width: "100%",
      backgroundColor: colors.white,
      borderBottomRightRadius: 58,
      paddingBottom: 30,
      paddingHorizontal: 22,
    },
    headerRow: {
      minHeight: 66,
      width: "100%",
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },
    backButton: {
      position: "absolute",
      left: 0,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
    },
    backButtonPressed: {
      opacity: 0.82,
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    headerTitleWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      ...roundedText,
      color: colors.loginHeaderGradientStart,
      fontSize: 36,
      lineHeight: 34,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      ...roundedText,
      marginTop: 2,
      color: colors.loginTabText,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    body: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    bodyContent: {
      paddingTop: 20,
    },
    section: {
      width: "100%",
      marginBottom: 28,
    },
    sectionTitle: {
      ...roundedText,
      color: colors.dashboardHeaderText,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
    },
    sectionTitlePadded: {
      paddingHorizontal: 24,
    },
    urgentListContent: {
      marginTop: 14,
      paddingHorizontal: 24,
      paddingRight: 10,
    },
    urgentCard: {
      width: urgentCardWidth,
    },
    urgentCardGap: {
      width: 14,
    },
    sectionHeaderRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
    },
    seeAllPressed: {
      opacity: 0.86,
    },
    seeAllText: {
      ...roundedText,
      color: colors.dashboardSubtleText,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "700",
    },
    miniListContent: {
      marginTop: 16,
      paddingHorizontal: 24,
      paddingRight: 24,
    },
    miniCardGap: {
      width: 12,
    },
  });
};
