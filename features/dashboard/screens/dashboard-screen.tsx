import { DashboardCategoryButton } from "@/components/dashboard/dashboard-category-button";
import { DashboardPetCard } from "@/components/dashboard/dashboard-pet-card";
import { DashboardPromoCarousel } from "@/components/dashboard/dashboard-promo-carousel";
import { DashboardBottomNavbar } from "@/components/navigation/dashboard-bottom-navbar";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  DASHBOARD_ASSETS,
  DASHBOARD_CATEGORIES,
  DASHBOARD_PROMO_ITEMS,
  type DashboardPetItem,
  type DashboardPromoItem,
} from "@/features/dashboard/dashboard.data";
import { NOTIFICATION_MOCK_DATA } from "@/features/notifications/notifications.data";
import { emitPetFavoriteChanged, subscribePetFavoriteChanged } from "@/features/pets/pet-favorite-sync";
import { fetchPetListingItems, updatePetFavorite } from "@/features/pets/pets.data";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

export default function DashboardScreen() {
  const router = useRouter();
  const { isHydrating, session } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const promoWidth = Math.max(240, contentWidth - 48);
  const firstName = session?.user.firstName?.trim() ?? "";
  const lastName = session?.user.lastName?.trim() ?? "";
  const displayName = `${firstName} ${lastName}`.trim() || "Pawtner User";
  const hasUnreadNotifications = useMemo(
    () => NOTIFICATION_MOCK_DATA.some((notification) => !notification.isRead),
    [],
  );
  const { showToast } = useToast();
  const [waitingPets, setWaitingPets] = useState<DashboardPetItem[]>([]);
  const [isWaitingPetsLoading, setIsWaitingPetsLoading] = useState(true);
  const [favoriteSyncingPetIds, setFavoriteSyncingPetIds] = useState<Set<string>>(
    () => new Set<string>(),
  );
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const isFavoriteSyncing = useCallback(
    (petId: string) => favoriteSyncingPetIds.has(petId),
    [favoriteSyncingPetIds],
  );
  const setFavoriteSyncingState = useCallback((petId: string, syncing: boolean) => {
    setFavoriteSyncingPetIds((currentIds) => {
      const nextIds = new Set(currentIds);

      if (syncing) {
        nextIds.add(petId);
      } else {
        nextIds.delete(petId);
      }

      return nextIds;
    });
  }, []);

  const handleToggleFavorite = useCallback(async (petId: string) => {
    if (!session?.accessToken || !session.user.id || isFavoriteSyncing(petId)) {
      return;
    }

    const targetPet = waitingPets.find((pet) => pet.petId === petId);

    if (!targetPet) {
      return;
    }

    const previousFavoriteState = Boolean(targetPet.isFavorite);
    const nextFavoriteState = !previousFavoriteState;
    setWaitingPets((currentPets) =>
      currentPets.map((pet) =>
        pet.petId === petId ? { ...pet, isFavorite: nextFavoriteState } : pet,
      ),
    );
    emitPetFavoriteChanged({
      favorited: nextFavoriteState,
      petId,
    });
    setFavoriteSyncingState(petId, true);

    try {
      const favorited = await updatePetFavorite({
        favorited: nextFavoriteState,
        petId,
        token: session.accessToken,
        userId: session.user.id,
      });

      if (favorited !== nextFavoriteState) {
        setWaitingPets((currentPets) =>
          currentPets.map((pet) =>
            pet.petId === petId ? { ...pet, isFavorite: favorited } : pet,
          ),
        );
        emitPetFavoriteChanged({
          favorited,
          petId,
        });
      }
    } catch (error) {
      setWaitingPets((currentPets) =>
        currentPets.map((pet) =>
          pet.petId === petId
            ? { ...pet, isFavorite: previousFavoriteState }
            : pet,
        ),
      );
      emitPetFavoriteChanged({
        favorited: previousFavoriteState,
        petId,
      });
      showToast(getErrorMessage(error, "Unable to update favorite pet."), "error");
    } finally {
      setFavoriteSyncingState(petId, false);
    }
  }, [
    isFavoriteSyncing,
    session?.accessToken,
    session?.user.id,
    setFavoriteSyncingState,
    showToast,
    waitingPets,
  ]);

  const handlePressPromoItem = (item: DashboardPromoItem) => {
    if (item.id === "donate-banner") {
      router.push("/donations");
      return;
    }

    if (item.id === "community-banner") {
      router.push("/community");
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadWaitingPets = async () => {
      if (isHydrating) {
        if (isMounted) {
          setIsWaitingPetsLoading(true);
        }
        return;
      }

      if (!session?.accessToken || !session.user.id) {
        if (isMounted) {
          setWaitingPets([]);
          setIsWaitingPetsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsWaitingPetsLoading(true);
      }

      try {
        const listingPets = await fetchPetListingItems({
          token: session.accessToken,
          userId: session.user.id,
        });

        const favoriteListingPets = listingPets.filter((pet) => pet.isFavorite);
        const sourcePets =
          favoriteListingPets.length > 0 ? favoriteListingPets : listingPets;
        const nextWaitingPets: DashboardPetItem[] = sourcePets
          .slice(0, 10)
          .map((pet) => ({
            age: pet.age,
            id: `waiting-${pet.id}`,
            image: pet.image,
            isFavorite: Boolean(pet.isFavorite),
            name: pet.name,
            petId: pet.id,
            sex: pet.sex,
            type: pet.type,
            vaccinated: pet.vaccinated,
          }));

        if (isMounted) {
          setWaitingPets(nextWaitingPets);
        }
      } catch (error) {
        console.error("[dashboard] Failed to load waiting pets", error);

        if (isMounted) {
          setWaitingPets([]);
        }
      } finally {
        if (isMounted) {
          setIsWaitingPetsLoading(false);
        }
      }
    };

    void loadWaitingPets();

    return () => {
      isMounted = false;
    };
  }, [isHydrating, session?.accessToken, session?.user.id]);

  useEffect(() => {
    const unsubscribe = subscribePetFavoriteChanged(({ favorited, petId }) => {
      setWaitingPets((currentPets) =>
        currentPets.map((pet) =>
          pet.petId === petId ? { ...pet, isFavorite: favorited } : pet,
        ),
      );
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.dashboardHeaderBackground}
      />

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

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/notification")}
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.notificationButtonPressed,
            ]}
          >
            <MaterialIcons
              color={colors.dashboardBottomIcon}
              name="notifications-none"
              size={27}
            />
            {hasUnreadNotifications ? (
              <View style={styles.notificationUnreadDot} />
            ) : null}
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
            style={styles.edgeToEdgeList}
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
                        : item.id === "volunteer"
                          ? () => router.push("/volunteer")
                          : item.id === "heroes-wall"
                            ? () => router.push("/heroes-wall")
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

          {waitingPets.length > 0 ? (
            <FlatList
              horizontal
              data={waitingPets}
              keyExtractor={(item) => item.id}
              style={styles.edgeToEdgeList}
              contentContainerStyle={styles.petListContent}
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.petListGap} />}
              renderItem={({ item }) => {
                return (
                  <DashboardPetCard
                    cardBackgroundColor={colors.dashboardSectionCardBackground}
                    cardShadowColor={colors.dashboardShadow}
                    favoriteDisabled={isFavoriteSyncing(item.petId)}
                    item={item}
                    onPress={() =>
                      router.push({
                        pathname: "/pet-details/[petId]",
                        params: { petId: item.petId },
                      })
                    }
                    onToggleFavorite={handleToggleFavorite}
                    subtitleColor={colors.dashboardBottomIcon}
                    textColor={colors.dashboardBottomIconActive}
                  />
                );
              }}
            />
          ) : isWaitingPetsLoading ? null : (
            <Text style={styles.noPetsText}>No pets available right now.</Text>
          )}
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
      marginTop: -8,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardBottomIcon,
      fontSize: 12,
      lineHeight: 13,
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
    notificationButtonPressed: {
      opacity: 0.84,
    },
    notificationUnreadDot: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 9,
      height: 9,
      borderRadius: 999,
      backgroundColor: "#FF3B30",
      borderWidth: 1,
      borderColor: colors.dashboardHeaderBackground,
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
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
    welcomeTitle: {
      marginTop: 4,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 20,
      lineHeight: 30,
      fontWeight: "900",
      marginBottom: 18,
    },
    sectionTitle: {
      marginTop: 18,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "900",
    },
    edgeToEdgeList: {
      marginHorizontal: -24,
    },
    categoriesListContent: {
      marginTop: 14,
      paddingLeft: 24,
      paddingRight: 24,
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
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "900",
    },
    seeAll: {
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 14,
      fontWeight: "600",
    },
    petListContent: {
      marginTop: 12,
      paddingLeft: 24,
      paddingTop: 4,
      paddingRight: 24,
      paddingBottom: 12,
    },
    petListGap: {
      width: 12,
    },
    noPetsText: {
      marginTop: 14,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "700",
    },
  });
