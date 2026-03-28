import { PetDetailsActionBar } from "@/components/pets/pet-details-action-bar";
import { PetDetailsBottomSheet } from "@/components/pets/pet-details-bottom-sheet";
import { Colors } from "@/constants/theme";
import { PET_ASSETS, getPetDetailsById } from "@/features/pets/pets.data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IMAGE_HEIGHT_RATIO = 0.56;
const ACTION_BAR_BASE_HEIGHT = 86;

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const parseBooleanParam = (
  value?: string | string[],
): boolean | undefined => {
  const normalized = normalizeParam(value);

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return undefined;
};

const resolveImageSource = (
  image?: ImageSourcePropType | string,
): ImageSourcePropType => {
  if (!image) {
    return PET_ASSETS.dogDefault;
  }

  if (typeof image === "string") {
    const normalized = image.trim();

    return normalized ? { uri: normalized } : PET_ASSETS.dogDefault;
  }

  return image;
};

export default function PetDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ isFavorite?: string; petId?: string }>();
  const petId = normalizeParam(params.petId);
  const favoriteOverride = parseBooleanParam(params.isFavorite);

  const pet = useMemo(
    () => (petId ? getPetDetailsById(petId, favoriteOverride) : null),
    [favoriteOverride, petId],
  );
  const bottomSheetAnimatedIndex = useSharedValue(0);
  const actionBarInset = Math.max(insets.bottom, 10);
  const actionBarHeight = ACTION_BAR_BASE_HEIGHT + actionBarInset;

  const [isFavorite, setIsFavorite] = useState(Boolean(pet?.isFavorite));
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

  useEffect(() => {
    setIsFavorite(Boolean(pet?.isFavorite));
  }, [pet?.id, pet?.isFavorite]);

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      bottomSheetAnimatedIndex.value,
      [0, 1],
      [0, -120],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }],
    };
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/pets");
  };

  if (!pet) {
    return (
      <View style={styles.notFoundScreen}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={styles.fallbackBackButton}
        >
          <Image
            source={PET_ASSETS.backIcon}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </Pressable>
        <Text style={styles.fallbackText}>Pet details not available.</Text>
      </View>
    );
  }

  const imageSource = resolveImageSource(pet.image);

  return (
      <View style={styles.screen}>
      <StatusBar
        barStyle={isSheetExpanded ? "dark-content" : "light-content"}
        backgroundColor="transparent"
        translucent
      />

      <Animated.View style={[styles.heroVisualWrap, heroAnimatedStyle]}>
        <Image source={imageSource} style={styles.heroImage} resizeMode="cover" />

        <LinearGradient
          colors={["rgba(8, 28, 52, 0)", "rgba(8, 28, 52, 0.35)"]}
          style={styles.heroOverlay}
        />
      </Animated.View>

      <Pressable
        accessibilityRole="button"
        hitSlop={10}
        onPress={handleBack}
        style={[
          styles.backButton,
          {
            top: insets.top + 10,
          },
        ]}
      >
        <Image
          source={PET_ASSETS.backIcon}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </Pressable>

      <PetDetailsBottomSheet
        animatedIndex={bottomSheetAnimatedIndex}
        bottomInset={actionBarHeight + 12}
        isFavorite={isFavorite}
        onSheetChange={(index) => setIsSheetExpanded(index >= 1)}
        onToggleFavorite={() => setIsFavorite((currentValue) => !currentValue)}
        pet={pet}
      />

      <PetDetailsActionBar bottomInset={insets.bottom} />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    heroVisualWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: `${IMAGE_HEIGHT_RATIO * 100}%`,
      overflow: "hidden",
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
    },
    backButton: {
      position: "absolute",
      left: 18,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: "rgba(14, 49, 84, 0.28)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },
    backIcon: {
      width: 24,
      height: 24,
    },
    notFoundScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.dashboardSectionCardBackground,
      paddingHorizontal: 20,
    },
    fallbackBackButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
      backgroundColor: colors.dashboardSubtleText,
    },
    fallbackText: {
      color: colors.dashboardBottomIconActive,
      fontSize: 16,
      lineHeight: 22,
      fontWeight: "700",
    },
  });
