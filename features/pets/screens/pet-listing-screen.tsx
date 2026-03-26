import { PetCard } from "@/components/pets/pet-card";
import { PetFilterChip } from "@/components/pets/pet-filter-chip";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  PET_ASSETS,
  PET_FILTER_OPTIONS,
  PET_LISTING_MOCK_DATA,
} from "@/features/pets/pets.data";
import type { PetFilter, PetListingItem } from "@/features/pets/pets.types";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
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
const PET_LIST_OPENING_LOADER_DELAY_MS = 700;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<PetFilter>("all");
  const [pets, setPets] = useState(PET_LISTING_MOCK_DATA);
  const [isOpeningLoaderVisible, setIsOpeningLoaderVisible] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsOpeningLoaderVisible(false);
    }, PET_LIST_OPENING_LOADER_DELAY_MS);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  const handleToggleFavorite = (petId: string) => {
    setPets((currentPets) =>
      currentPets.map((pet) =>
        pet.id === petId ? { ...pet, isFavorite: !pet.isFavorite } : pet,
      ),
    );
  };

  const handleOpenPetDetails = (pet: PetListingItem) => {
    router.push({
      pathname: "/pet-details/[petId]",
      params: {
        petId: pet.id,
        isFavorite: String(Boolean(pet.isFavorite)),
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
          <Image
            source={PET_ASSETS.listingTitle}
            style={styles.titleImage}
            resizeMode="contain"
          />
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
          {renderHeader()}
        </View>

        <FlatList
          data={filteredPets}
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No pets matched your filters.
              </Text>
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
          showsVerticalScrollIndicator={false}
        />
      </LinearGradient>
      <FullScreenLoader
        absolute
        backgroundColor="rgba(0, 0, 0, 0.24)"
        subtitle="Loading the pets for you..."
        visible={isOpeningLoaderVisible}
      />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) =>
  {
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
    titleImage: {
      marginTop: 4,
      width: 224,
      height: 34,
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
    });
  };
