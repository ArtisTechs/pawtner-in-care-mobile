import { DashboardCategoryButton } from "@/components/dashboard/dashboard-category-button";
import { DashboardPetCard } from "@/components/dashboard/dashboard-pet-card";
import { DashboardPromoCarousel } from "@/components/dashboard/dashboard-promo-carousel";
import { DashboardBottomNavbar } from "@/components/navigation/dashboard-bottom-navbar";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  DASHBOARD_ASSETS,
  DASHBOARD_CATEGORIES,
  type DashboardPromoItem,
  DASHBOARD_PROMO_ITEMS,
  DASHBOARD_WAITING_PETS,
} from "@/features/dashboard/dashboard.data";
import { getPetDetailsById } from "@/features/pets/pets.data";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
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
import { useRouter } from "expo-router";

const MAX_CONTENT_WIDTH = 420;

export default function DashboardScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const promoWidth = Math.max(240, contentWidth - 48);
  const firstName = session?.user.firstName?.trim() ?? "";
  const lastName = session?.user.lastName?.trim() ?? "";
  const displayName = `${firstName} ${lastName}`.trim() || "Pawtner User";
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const handlePressPromoItem = (item: DashboardPromoItem) => {
    if (item.id === "donate-banner") {
      router.push("/donations");
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />

      <View
        style={[
          styles.headerWrap,
          {
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLogoBlock}>
            <Image
              source={DASHBOARD_ASSETS.TitleLogo2}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <Text style={styles.headerSubtitle}>
              {"Noah's Ark Dog & Cat Shelter"}
            </Text>
          </View>

          <Pressable style={styles.notificationButton}>
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="notifications-none"
              size={27}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: 132 + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.greeting}>{`Hi, ${displayName} \u{1F44B}`}</Text>
          <Text style={styles.welcomeTitle}>Welcome to our App!</Text>

          <DashboardPromoCarousel
            itemHeight={112}
            itemWidth={promoWidth}
            items={DASHBOARD_PROMO_ITEMS}
            onPressItem={handlePressPromoItem}
          />

          <Text style={styles.sectionTitle}>Categories</Text>

          <FlatList
            horizontal
            data={DASHBOARD_CATEGORIES}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesListContent}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.categoriesGap} />}
            renderItem={({ item }) => (
                <DashboardCategoryButton
                  bubbleColor={colors.dashboardCategoryBubble}
                  iconSource={item.iconSource}
                  label={item.label}
                  labelColor={colors.dashboardHeaderText}
                  onPress={
                    item.id === "veterinary"
                      ? () => router.push("/veterinary-clinics")
                      : item.id === "adopt-pets"
                        ? () => router.push("/pets")
                        : item.id === "events"
                          ? () => router.push("/events")
                          : item.id === "community"
                            ? () => router.push("/community")
                        : undefined
                  }
                />
              )}
            />

          <View style={styles.waitingHeader}>
            <Text style={styles.waitingTitle}>Waiting for you</Text>
            <Pressable onPress={() => router.push("/pets")}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          <FlatList
            horizontal
            data={DASHBOARD_WAITING_PETS}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.petListContent}
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.petListGap} />}
            renderItem={({ item }) => {
              const petDetails = getPetDetailsById(item.petId);

              return (
                <DashboardPetCard
                  cardBackgroundColor={colors.dashboardSectionCardBackground}
                  cardShadowColor={colors.dashboardShadow}
                  item={{
                    ...item,
                    image: petDetails?.image ?? item.image,
                    type: petDetails?.type ?? item.type,
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/pet-details/[petId]",
                      params: { petId: item.petId },
                    })
                  }
                  subtitleColor={colors.dashboardBottomIcon}
                  textColor={colors.dashboardBottomIconActive}
                />
              );
            }}
          />
        </View>
      </ScrollView>

      <DashboardBottomNavbar activeKey="home" />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
      alignItems: "center",
    },
    headerWrap: {
      width: "100%",
      maxWidth: MAX_CONTENT_WIDTH,
      backgroundColor: colors.dashboardHeaderBackground,
      borderBottomRightRadius: 54,
      borderBottomLeftRadius: 18,
      paddingBottom: 14,
      paddingHorizontal: 22,
    },
    headerRow: {
      position: "relative",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    headerLogoBlock: {
      alignItems: "center",
    },
    headerLogo: {
      width: 222,
      height: 76,
    },
    headerSubtitle: {
      marginTop: -2,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "700",
      fontStyle: "italic",
    },
    notificationButton: {
      position: "absolute",
      right: 0,
      top: 16,
      width: 38,
      height: 38,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      width: "100%",
      alignItems: "center",
      paddingTop: 16,
    },
    content: {
      width: contentWidth,
      paddingHorizontal: 24,
    },
    greeting: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 15,
      lineHeight: 19,
      fontWeight: "700",
    },
    welcomeTitle: {
      marginTop: 4,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "900",
      marginBottom: 18,
    },
    sectionTitle: {
      marginTop: 18,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
    },
    categoriesListContent: {
      marginTop: 14,
      paddingRight: 6,
      paddingBottom: 1,
    },
    categoriesGap: {
      width: 2,
    },
    waitingHeader: {
      marginTop: 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    waitingTitle: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 18,
      lineHeight: 22,
      fontWeight: "900",
    },
    seeAll: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 12,
      lineHeight: 14,
      fontWeight: "600",
    },
    petListContent: {
      marginTop: 12,
      paddingRight: 8,
      paddingBottom: 8,
    },
    petListGap: {
      width: 12,
    },
  });
