import { PetCard } from "@/components/pets/pet-card";
import { PetFilterChip } from "@/components/pets/pet-filter-chip";
import { AppToast } from "@/components/ui/app-toast";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  fetchPetListingPage,
  PET_ASSETS,
  PET_FILTER_OPTIONS,
  updatePetFavorite,
} from "@/features/pets/pets.data";
import { subscribePetFavoriteChanged } from "@/features/pets/pet-favorite-sync";
import type {
  PetFilter,
  PetListingItem,
  PetListingPagination,
} from "@/features/pets/pets.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { ApiError, getErrorMessage } from "@/services/api/api-error";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;
const PET_PAGE_SIZE = 10;
type FetchMode = "initial" | "nextPage" | "refresh";

const mergePetListingItems = (
  currentPets: PetListingItem[],
  nextPets: PetListingItem[],
) => {
  const petsById = new Map(currentPets.map((pet) => [pet.id, pet]));

  for (const pet of nextPets) {
    const existingPet = petsById.get(pet.id);
    petsById.set(pet.id, existingPet ? { ...existingPet, ...pet } : pet);
  }

  return Array.from(petsById.values());
};

export default function PetListingScreen() {
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
  const { isHydrating, session } = useAuth();
  const { hideToast, showToast, toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<PetFilter>("all");
  const [pets, setPets] = useState<PetListingItem[]>([]);
  const [pagination, setPagination] = useState<PetListingPagination | null>(null);
  const [isFetchingPets, setIsFetchingPets] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFavoriteSyncing, setIsFavoriteSyncing] = useState(false);

  const loadPets = useCallback(async (mode: FetchMode = "initial", targetPage = 0) => {
    const isRefreshMode = mode === "refresh";
    const isNextPageMode = mode === "nextPage";

    if (isHydrating) {
      if (isRefreshMode) {
        setIsRefreshing(false);
      } else if (isNextPageMode) {
        setIsLoadingMore(false);
      } else {
        setIsFetchingPets(true);
      }
      return;
    }

    if (!session?.accessToken || !session.user.id) {
      setPets([]);
      setPagination(null);
      setIsFetchingPets(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
      return;
    }

    if (isNextPageMode) {
      setIsLoadingMore(true);
    } else if (isRefreshMode) {
      setIsRefreshing(true);
    } else {
      setIsFetchingPets(true);
    }

    try {
      const petListingResponse = await fetchPetListingPage({
        page: targetPage,
        size: PET_PAGE_SIZE,
        token: session.accessToken,
        userId: session.user.id,
      });
      setPagination(petListingResponse.pagination);
      setPets((currentPets) =>
        isNextPageMode
          ? mergePetListingItems(currentPets, petListingResponse.items)
          : petListingResponse.items,
      );
    } catch (error) {
      if (!isNextPageMode) {
        setPets([]);
        setPagination(null);
      }

      if (error instanceof ApiError && error.status === 404) {
        return;
      }

      showToast(getErrorMessage(error, "Unable to load pets."), "error");
    } finally {
      if (isNextPageMode) {
        setIsLoadingMore(false);
      } else if (isRefreshMode) {
        setIsRefreshing(false);
      } else {
        setIsFetchingPets(false);
      }
    }
  }, [
    isHydrating,
    session?.accessToken,
    session?.user.id,
    showToast,
  ]);

  useEffect(() => {
    void loadPets("initial");
  }, [isHydrating, loadPets, session?.accessToken, session?.user.id]);

  useEffect(() => {
    const unsubscribe = subscribePetFavoriteChanged(({ favorited, petId }) => {
      setPets((currentPets) =>
        currentPets.map((pet) =>
          pet.id === petId ? { ...pet, isFavorite: favorited } : pet,
        ),
      );
    });

    return unsubscribe;
  }, []);

  const handleRefresh = useCallback(() => {
    if (isFavoriteSyncing || isLoadingMore) {
      return;
    }

    void loadPets("refresh");
  }, [isFavoriteSyncing, isLoadingMore, loadPets]);

  const handleLoadMore = useCallback(() => {
    if (
      isFavoriteSyncing ||
      isFetchingPets ||
      isLoadingMore ||
      isRefreshing ||
      (pagination?.last ?? true)
    ) {
      return;
    }

    const nextPage = (pagination?.page ?? 0) + 1;
    void loadPets("nextPage", nextPage);
  }, [
    isFavoriteSyncing,
    isFetchingPets,
    isLoadingMore,
    isRefreshing,
    pagination?.last,
    pagination?.page,
    loadPets,
  ]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleToggleFavorite = useCallback(
    async (petId: string) => {
      if (
        !session?.accessToken ||
        !session.user.id ||
        isFavoriteSyncing
      ) {
        return;
      }

      const targetPet = pets.find((pet) => pet.id === petId);

      if (!targetPet) {
        return;
      }

      const previousFavoriteState = Boolean(targetPet.isFavorite);
      const nextFavoriteState = !previousFavoriteState;
      setPets((currentPets) =>
        currentPets.map((pet) =>
          pet.id === petId ? { ...pet, isFavorite: nextFavoriteState } : pet,
        ),
      );
      setIsFavoriteSyncing(true);

      try {
        const favorited = await updatePetFavorite({
          favorited: nextFavoriteState,
          petId,
          token: session.accessToken,
          userId: session.user.id,
        });

        if (favorited !== nextFavoriteState) {
          setPets((currentPets) =>
            currentPets.map((pet) =>
              pet.id === petId ? { ...pet, isFavorite: favorited } : pet,
            ),
          );
        }
      } catch (error) {
        setPets((currentPets) =>
          currentPets.map((pet) =>
            pet.id === petId ? { ...pet, isFavorite: previousFavoriteState } : pet,
          ),
        );
        showToast(
          getErrorMessage(error, "Unable to update favorite pet."),
          "error",
        );
      } finally {
        setIsFavoriteSyncing(false);
      }
    },
    [isFavoriteSyncing, pets, session?.accessToken, session?.user.id, showToast],
  );

  const handleOpenPetDetails = (pet: PetListingItem) => {
    router.push({
      pathname: "/pet-details/[petId]",
      params: {
        petId: pet.id,
      },
    });
  };

  const filteredPets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return pets.filter((pet) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "favorites" && pet.isFavorite) ||
        (activeFilter === "dogs" && pet.type === "dog") ||
        (activeFilter === "cats" && pet.type === "cat");

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [pet.name, pet.breed, pet.type].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [activeFilter, pets, searchTerm]);

  const renderHeader = () => (
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
            source={PET_ASSETS.backIcon}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>

        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>LOOKING FOR A</Text>
          <Text style={styles.titleText}>PET LISTING</Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <MaterialIcons
          color={colors.dashboardSubtleText}
          name="search"
          size={18}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSearchTerm}
          placeholder="Search pets"
          placeholderTextColor={colors.dashboardSubtleText}
          returnKeyType="search"
          selectionColor={colors.dashboardBottomIcon}
          style={styles.searchInput}
          value={searchTerm}
        />
      </View>

      <View style={styles.filterRow}>
        {PET_FILTER_OPTIONS.map((filterOption) => (
          <PetFilterChip
            key={filterOption.key}
            label={filterOption.label}
            onPress={() => setActiveFilter(filterOption.key)}
            selected={activeFilter === filterOption.key}
          />
        ))}
      </View>
    </View>
  );

  const loaderSubtitle = "Loading the pets for you...";
  const hasFiltersOrSearch = Boolean(searchTerm.trim()) || activeFilter !== "all";
  const emptyMessage =
    pets.length === 0 && !hasFiltersOrSearch
      ? "No pets available right now."
      : "No pets matched your filters.";
  const shouldShowLoadMoreIndicator =
    isLoadingMore && filteredPets.length > 0;
  const shouldShowReachedEnd =
    !isLoadingMore &&
    filteredPets.length > 0 &&
    Boolean(pagination?.last);
  const listFooter = shouldShowLoadMoreIndicator ? (
    <View style={styles.listFooter}>
      <ActivityIndicator color={colors.dashboardBottomIcon} size="small" />
    </View>
  ) : shouldShowReachedEnd ? (
    <View style={styles.listFooter}>
      <Text style={styles.listFooterText}>You reached the end of the list.</Text>
    </View>
  ) : null;

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
        <View
          style={[
            styles.fixedHeaderContainer,
            {
              paddingTop: insets.top + 8,
            },
          ]}
        >
          {renderHeader()}
        </View>

        <FlatList
          data={filteredPets}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={listFooter}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
          }
          style={styles.list}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingTop: 4,
              paddingBottom: insets.bottom + 24,
            },
          ]}
          renderItem={({ item }) => (
            <PetCard
              item={item}
              onPress={() => handleOpenPetDetails(item)}
              onToggleFavorite={handleToggleFavorite}
              style={styles.card}
            />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>

      <AppToast onDismiss={hideToast} toast={toast} />

      <FullScreenLoader
        absolute
        backgroundColor="rgba(0, 0, 0, 0.24)"
        subtitle={loaderSubtitle}
        visible={isFetchingPets}
      />
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
    list: {
      flex: 1,
      width: "100%",
    },
    listContent: {
      alignItems: "center",
    },
    headerWrap: {
      width: contentWidth,
      paddingHorizontal: 24,
      marginBottom: 16,
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
    kicker: {
      ...roundedText,
      color: colors.dashboardSubtleText,
      fontSize: 16,
      lineHeight: 18,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    titleText: {
      marginTop: 4,
      fontFamily: DisplayFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 32,
      lineHeight: 34,
      letterSpacing: 0.4,
      textAlign: "center",
    },
    searchWrap: {
      marginTop: 10,
      width: "100%",
      minHeight: 44,
      borderRadius: 22,
      backgroundColor: "rgba(46, 109, 183, 0.46)",
      borderWidth: 1,
      borderColor: "rgba(216, 232, 255, 0.45)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      gap: 8,
    },
    searchInput: {
      ...roundedText,
      flex: 1,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
      paddingVertical: 10,
    },
    filterRow: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    card: {
      width: contentWidth - 48,
    },
    itemSeparator: {
      height: 14,
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
    },
    listFooter: {
      width: contentWidth,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 8,
      paddingBottom: 4,
    },
    listFooterText: {
      ...roundedText,
      color: colors.dashboardSubtleText,
      fontSize: 13,
      lineHeight: 17,
      fontWeight: "600",
      textAlign: "center",
    },
  });
};
