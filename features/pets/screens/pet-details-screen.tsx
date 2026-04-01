import { PetDetailsActionBar } from "@/components/pets/pet-details-action-bar";
import { PetDetailsBottomSheet } from "@/components/pets/pet-details-bottom-sheet";
import { AppToast } from "@/components/ui/app-toast";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import { emitPetFavoriteChanged } from "@/features/pets/pet-favorite-sync";
import {
  cancelPendingPetAdoptionRequest,
  createPetAdoptionRequest,
  fetchPetDetailsItem,
  PET_ASSETS,
  updatePetFavorite,
} from "@/features/pets/pets.data";
import type { PetDetailsItem } from "@/features/pets/pets.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Extrapolation,
  interpolate,
  withDelay,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IMAGE_HEIGHT_RATIO = 0.56;
const ACTION_BAR_BASE_HEIGHT = 86;
const DUPLICATE_PENDING_ADOPTION_ERROR_KEYWORDS = [
  "pending adoption request",
  "already have a pending adoption request",
  "already requested",
];

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

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

const isDuplicatePendingAdoptionError = (errorMessage: string) => {
  const normalizedErrorMessage = errorMessage.toLowerCase();

  return DUPLICATE_PENDING_ADOPTION_ERROR_KEYWORDS.some((keyword) =>
    normalizedErrorMessage.includes(keyword),
  );
};

export default function PetDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = normalizeParam(params.petId);
  const { isHydrating, session } = useAuth();
  const { hideToast, showToast, toast } = useToast();

  const [pet, setPet] = useState<PetDetailsItem | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isFetchingPet, setIsFetchingPet] = useState(true);
  const [isFavoriteSyncing, setIsFavoriteSyncing] = useState(false);
  const [isAdoptionPromptVisible, setIsAdoptionPromptVisible] = useState(false);
  const [isAdoptionRequestSubmitting, setIsAdoptionRequestSubmitting] =
    useState(false);
  const [isAdoptionRequestCancelling, setIsAdoptionRequestCancelling] =
    useState(false);
  const [isAdoptionSuccessVisible, setIsAdoptionSuccessVisible] =
    useState(false);
  const [isDuplicateAdoptionPromptVisible, setIsDuplicateAdoptionPromptVisible] =
    useState(false);
  const [isCancelAdoptionConfirmVisible, setIsCancelAdoptionConfirmVisible] =
    useState(false);

  const bottomSheetAnimatedIndex = useSharedValue(0);
  const adoptionPromptIconScale = useSharedValue(1);
  const adoptionSuccessIconEntryScale = useSharedValue(1);
  const adoptionSuccessIconPulseScale = useSharedValue(1);
  const adoptionSuccessIconRotate = useSharedValue(0);
  const adoptionSuccessIconOpacity = useSharedValue(1);
  const actionBarInset = Math.max(insets.bottom, 10);
  const actionBarHeight = ACTION_BAR_BASE_HEIGHT + actionBarInset;

  const loadPetDetails = useCallback(async () => {
    if (isHydrating) {
      setIsFetchingPet(true);
      return;
    }

    if (!petId || !session?.accessToken || !session.user.id) {
      setPet(null);
      setIsFetchingPet(false);
      return;
    }

    setIsFetchingPet(true);

    try {
      const petDetails = await fetchPetDetailsItem({
        petId,
        token: session.accessToken,
        userId: session.user.id,
      });

      setPet(petDetails);
      setIsFavorite(Boolean(petDetails.isFavorite));
    } catch (error) {
      setPet(null);
      showToast(getErrorMessage(error, "Unable to load pet details."), "error");
    } finally {
      setIsFetchingPet(false);
    }
  }, [isHydrating, petId, session?.accessToken, session?.user.id, showToast]);

  useEffect(() => {
    void loadPetDetails();
  }, [loadPetDetails]);

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
  const promptIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: adoptionPromptIconScale.value }],
  }));
  const successIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: adoptionSuccessIconOpacity.value,
    transform: [
      {
        rotate: `${adoptionSuccessIconRotate.value}deg`,
      },
      {
        scale:
          adoptionSuccessIconEntryScale.value * adoptionSuccessIconPulseScale.value,
      },
    ],
  }));
  const isAdoptionPromptIconVisible =
    isAdoptionPromptVisible ||
    isDuplicateAdoptionPromptVisible ||
    isCancelAdoptionConfirmVisible;

  useEffect(() => {
    if (!isAdoptionPromptIconVisible) {
      cancelAnimation(adoptionPromptIconScale);
      adoptionPromptIconScale.value = 1;
      return;
    }

    adoptionPromptIconScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 480 }),
        withTiming(1, { duration: 480 }),
      ),
      -1,
      false,
    );
  }, [adoptionPromptIconScale, isAdoptionPromptIconVisible]);

  useEffect(() => {
    if (!isAdoptionSuccessVisible) {
      cancelAnimation(adoptionSuccessIconEntryScale);
      cancelAnimation(adoptionSuccessIconPulseScale);
      cancelAnimation(adoptionSuccessIconRotate);
      cancelAnimation(adoptionSuccessIconOpacity);
      adoptionSuccessIconEntryScale.value = 1;
      adoptionSuccessIconPulseScale.value = 1;
      adoptionSuccessIconRotate.value = 0;
      adoptionSuccessIconOpacity.value = 1;
      return;
    }

    adoptionSuccessIconEntryScale.value = 0.32;
    adoptionSuccessIconPulseScale.value = 1;
    adoptionSuccessIconRotate.value = -26;
    adoptionSuccessIconOpacity.value = 0;

    adoptionSuccessIconOpacity.value = withTiming(1, {
      duration: 170,
    });
    adoptionSuccessIconEntryScale.value = withSequence(
      withTiming(1.22, {
        duration: 260,
      }),
      withSpring(1, {
        damping: 9,
        stiffness: 180,
      }),
    );
    adoptionSuccessIconRotate.value = withSequence(
      withTiming(10, {
        duration: 150,
      }),
      withTiming(-7, {
        duration: 130,
      }),
      withTiming(0, {
        duration: 120,
      }),
    );
    adoptionSuccessIconPulseScale.value = withDelay(
      560,
      withSequence(
        withRepeat(
          withSequence(
            withTiming(1.07, {
              duration: 700,
            }),
            withTiming(1, {
              duration: 700,
            }),
          ),
          -1,
          false,
        ),
      ),
    );
  }, [
    adoptionSuccessIconEntryScale,
    adoptionSuccessIconOpacity,
    adoptionSuccessIconPulseScale,
    adoptionSuccessIconRotate,
    isAdoptionSuccessVisible,
  ]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/pets");
  };

  const handleToggleFavorite = useCallback(async () => {
    if (
      !pet?.id ||
      !session?.accessToken ||
      !session.user.id ||
      isFavoriteSyncing
    ) {
      return;
    }

    const previousFavoriteState = isFavorite;
    const requestedFavoriteState = !previousFavoriteState;
    setIsFavorite(requestedFavoriteState);
    setPet((currentPet) =>
      currentPet
        ? { ...currentPet, isFavorite: requestedFavoriteState }
        : currentPet,
    );
    emitPetFavoriteChanged({
      favorited: requestedFavoriteState,
      petId: pet.id,
    });

    setIsFavoriteSyncing(true);

    try {
      const favorited = await updatePetFavorite({
        favorited: requestedFavoriteState,
        petId: pet.id,
        token: session.accessToken,
        userId: session.user.id,
      });

      if (favorited !== requestedFavoriteState) {
        setIsFavorite(favorited);
        setPet((currentPet) =>
          currentPet ? { ...currentPet, isFavorite: favorited } : currentPet,
        );
        emitPetFavoriteChanged({
          favorited,
          petId: pet.id,
        });
      }
    } catch (error) {
      setIsFavorite(previousFavoriteState);
      setPet((currentPet) =>
        currentPet
          ? { ...currentPet, isFavorite: previousFavoriteState }
          : currentPet,
      );
      emitPetFavoriteChanged({
        favorited: previousFavoriteState,
        petId: pet.id,
      });
      showToast(
        getErrorMessage(error, "Unable to update favorite pet."),
        "error",
      );
    } finally {
      setIsFavoriteSyncing(false);
    }
  }, [
    isFavorite,
    isFavoriteSyncing,
    pet?.id,
    session?.accessToken,
    session?.user.id,
    showToast,
  ]);

  const isPetAdopted = pet?.status?.trim().toLowerCase() === "adopted";
  const isAdoptActionDisabled =
    !pet ||
    isPetAdopted ||
    isAdoptionRequestSubmitting ||
    isAdoptionRequestCancelling;

  const handleOpenAdoptionPrompt = useCallback(() => {
    if (
      !pet?.id ||
      isPetAdopted ||
      isAdoptionRequestSubmitting ||
      isAdoptionRequestCancelling
    ) {
      return;
    }

    setIsAdoptionPromptVisible(true);
  }, [
    isAdoptionRequestCancelling,
    isAdoptionRequestSubmitting,
    isPetAdopted,
    pet?.id,
  ]);

  const handleCloseAdoptionPrompt = useCallback(() => {
    if (isAdoptionRequestSubmitting || isAdoptionRequestCancelling) {
      return;
    }

    setIsAdoptionPromptVisible(false);
  }, [isAdoptionRequestCancelling, isAdoptionRequestSubmitting]);

  const handleCloseDuplicateAdoptionPrompt = useCallback(() => {
    if (isAdoptionRequestCancelling || isAdoptionRequestSubmitting) {
      return;
    }

    setIsDuplicateAdoptionPromptVisible(false);
  }, [isAdoptionRequestCancelling, isAdoptionRequestSubmitting]);

  const handleCloseCancelAdoptionConfirm = useCallback(() => {
    if (isAdoptionRequestCancelling || isAdoptionRequestSubmitting) {
      return;
    }

    setIsCancelAdoptionConfirmVisible(false);
  }, [isAdoptionRequestCancelling, isAdoptionRequestSubmitting]);

  const handleProceedToCancelAdoptionConfirm = useCallback(() => {
    if (isAdoptionRequestCancelling || isAdoptionRequestSubmitting) {
      return;
    }

    setIsDuplicateAdoptionPromptVisible(false);
    setIsCancelAdoptionConfirmVisible(true);
  }, [isAdoptionRequestCancelling, isAdoptionRequestSubmitting]);

  const handleConfirmAdoptionRequest = useCallback(async () => {
    if (
      !pet?.id ||
      !session?.accessToken ||
      !session.user.id ||
      isAdoptionRequestSubmitting ||
      isAdoptionRequestCancelling
    ) {
      return;
    }

    setIsAdoptionRequestSubmitting(true);

    try {
      await createPetAdoptionRequest({
        petId: pet.id,
        token: session.accessToken,
        userId: session.user.id,
      });
      setIsAdoptionPromptVisible(false);
      setIsAdoptionSuccessVisible(true);
      await loadPetDetails();
    } catch (error) {
      console.error("[pet-details] Failed to submit adoption request.", {
        error,
        petId: pet.id,
        userId: session.user.id,
      });
      const errorMessage = getErrorMessage(
        error,
        "Unable to submit adoption request.",
      );

      if (isDuplicatePendingAdoptionError(errorMessage)) {
        setIsAdoptionPromptVisible(false);
        setIsDuplicateAdoptionPromptVisible(true);
      } else {
        showToast(errorMessage, "error");
      }
    } finally {
      setIsAdoptionRequestSubmitting(false);
    }
  }, [
    isAdoptionRequestCancelling,
    isAdoptionRequestSubmitting,
    loadPetDetails,
    pet?.id,
    session?.accessToken,
    session?.user.id,
    showToast,
  ]);

  const handleConfirmCancelAdoptionRequest = useCallback(async () => {
    if (
      !pet?.id ||
      !session?.accessToken ||
      !session.user.id ||
      isAdoptionRequestSubmitting ||
      isAdoptionRequestCancelling
    ) {
      return;
    }

    setIsAdoptionRequestCancelling(true);

    try {
      await cancelPendingPetAdoptionRequest({
        petId: pet.id,
        token: session.accessToken,
        userId: session.user.id,
      });
      setIsCancelAdoptionConfirmVisible(false);
      showToast("Your pending adoption request has been cancelled.");
      await loadPetDetails();
    } catch (error) {
      console.error("[pet-details] Failed to cancel adoption request.", {
        error,
        petId: pet.id,
        userId: session.user.id,
      });
      showToast(
        getErrorMessage(error, "Unable to cancel adoption request."),
        "error",
      );
    } finally {
      setIsAdoptionRequestCancelling(false);
    }
  }, [
    isAdoptionRequestCancelling,
    isAdoptionRequestSubmitting,
    loadPetDetails,
    pet?.id,
    session?.accessToken,
    session?.user.id,
    showToast,
  ]);

  if (!pet && !isFetchingPet) {
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
        <AppToast onDismiss={hideToast} toast={toast} />
      </View>
    );
  }

  const imageSource = resolveImageSource(pet?.image);
  const loaderSubtitle = "Loading pet details...";

  return (
    <View style={styles.screen}>
      <StatusBar
        barStyle={isSheetExpanded ? "dark-content" : "light-content"}
        backgroundColor="transparent"
        translucent
      />

      <Animated.View style={[styles.heroVisualWrap, heroAnimatedStyle]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adopt this pet"
          disabled={isAdoptActionDisabled}
          onPress={handleOpenAdoptionPrompt}
          style={styles.heroImagePressable}
        >
          <Image
            source={imageSource}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <LinearGradient
            colors={["rgba(8, 28, 52, 0)", "rgba(8, 28, 52, 0.35)"]}
            style={styles.heroOverlay}
          />
        </Pressable>
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

      {pet ? (
        <PetDetailsBottomSheet
          animatedIndex={bottomSheetAnimatedIndex}
          bottomInset={actionBarHeight + 12}
          isFavorite={isFavorite}
          onSheetChange={(index) => setIsSheetExpanded(index >= 1)}
          onToggleFavorite={handleToggleFavorite}
          pet={pet}
        />
      ) : null}

      <PetDetailsActionBar
        bottomInset={insets.bottom}
        onAdoptPress={isAdoptActionDisabled ? undefined : handleOpenAdoptionPrompt}
      />

      <AppToast onDismiss={hideToast} toast={toast} />

      <FullScreenLoader
        absolute
        backgroundColor="rgba(0, 0, 0, 0.24)"
        subtitle={loaderSubtitle}
        visible={isFetchingPet}
      />

      <Modal
        animationType="fade"
        onRequestClose={handleCloseAdoptionPrompt}
        transparent
        visible={isAdoptionPromptVisible}
      >
        <View style={styles.promptOverlay}>
          <Pressable
            accessibilityRole="button"
            disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
            onPress={handleCloseAdoptionPrompt}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.promptCard, styles.adoptPromptCard]}>
            <Animated.View
              style={[styles.promptIconOuterCircle, promptIconAnimatedStyle]}
            >
              <View style={styles.promptIconInnerCircle}>
                <Image
                  source={PET_ASSETS.confirmAdoptPetIcon}
                  style={styles.promptIcon}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            <Text style={styles.adoptPromptTitle}>
              Are you sure you want to adopt this{"\n"}pet?
            </Text>

            <View style={[styles.promptButtonRow, styles.adoptPromptButtonRow]}>
              <Pressable
                accessibilityRole="button"
                disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
                onPress={handleCloseAdoptionPrompt}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptCancelButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
                onPress={handleConfirmAdoptionRequest}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptConfirmButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                {isAdoptionRequestSubmitting ? (
                  <ActivityIndicator
                    color={colors.petDetailsAdoptButtonText}
                    size="small"
                  />
                ) : (
                  <Text style={styles.promptConfirmText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={handleCloseDuplicateAdoptionPrompt}
        transparent
        visible={isDuplicateAdoptionPromptVisible}
      >
        <View style={styles.promptOverlay}>
          <Pressable
            accessibilityRole="button"
            disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
            onPress={handleCloseDuplicateAdoptionPrompt}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.promptCard}>
            <Animated.View
              style={[styles.promptIconOuterCircle, promptIconAnimatedStyle]}
            >
              <View style={styles.promptIconInnerCircle}>
                <Image
                  source={PET_ASSETS.confirmAdoptPetIcon}
                  style={styles.promptIcon}
                  resizeMode="contain"
                />
              </View>
            </Animated.View>

            <Text style={styles.promptTitle}>Request Already Pending</Text>
            <Text style={styles.promptBodyText}>
              You already have a pending adoption request for this pet. Do you
              want to cancel that request?
            </Text>

            <View style={styles.promptButtonRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
                onPress={handleCloseDuplicateAdoptionPrompt}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptCancelButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptCancelText}>Keep Request</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
                onPress={handleProceedToCancelAdoptionConfirm}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptDangerButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptConfirmText}>Cancel Request</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={handleCloseCancelAdoptionConfirm}
        transparent
        visible={isCancelAdoptionConfirmVisible}
      >
        <View style={styles.promptOverlay}>
          <Pressable
            accessibilityRole="button"
            disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
            onPress={handleCloseCancelAdoptionConfirm}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.promptCard}>
            <Animated.View
              style={[styles.cancelPromptIconOuterCircle, promptIconAnimatedStyle]}
            >
              <View style={styles.cancelPromptIconInnerCircle}>
                <MaterialIcons
                  color="#FFFFFF"
                  name="close"
                  size={44}
                />
              </View>
            </Animated.View>

            <Text style={styles.promptTitle}>Confirm Cancellation</Text>
            <Text style={styles.promptBodyText}>
              Are you sure you want to cancel your pending adoption request?
            </Text>

            <View style={styles.promptButtonRow}>
              <Pressable
                accessibilityRole="button"
                disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
                onPress={handleCloseCancelAdoptionConfirm}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptCancelButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptCancelText}>No</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                disabled={isAdoptionRequestSubmitting || isAdoptionRequestCancelling}
                onPress={handleConfirmCancelAdoptionRequest}
                style={({ pressed }) => [
                  styles.promptButton,
                  styles.promptDangerButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                {isAdoptionRequestCancelling ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <Text style={styles.promptConfirmText}>Confirm</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setIsAdoptionSuccessVisible(false)}
        transparent
        visible={isAdoptionSuccessVisible}
      >
        <View style={styles.promptOverlay}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsAdoptionSuccessVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.promptCard}>
            <Animated.View
              style={[styles.successIconOuterCircle, successIconAnimatedStyle]}
            >
              <View style={styles.successIconInnerCircle}>
                <MaterialIcons
                  color="#FFFFFF"
                  name="check"
                  size={52}
                />
              </View>
            </Animated.View>

            <Text style={styles.promptTitle}>Thank you!</Text>
            <Text style={styles.successBodyText}>
              Your adoption request has been submitted for review.
            </Text>

            <View style={styles.singleButtonRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAdoptionSuccessVisible(false)}
                style={({ pressed }) => [
                  styles.singleModalButton,
                  styles.promptConfirmButton,
                  pressed && styles.promptButtonPressed,
                ]}
              >
                <Text style={styles.promptConfirmText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
    heroImagePressable: {
      width: "100%",
      height: "100%",
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
    promptOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 26,
      backgroundColor: "rgba(10, 19, 35, 0.45)",
    },
    promptCard: {
      width: "100%",
      maxWidth: 320,
      borderRadius: 14,
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 18,
      backgroundColor: colors.dashboardSectionCardBackground,
      borderWidth: 2,
      borderColor: colors.petDetailsOutline,
      alignItems: "center",
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 10,
    },
    adoptPromptCard: {
      maxWidth: 300,
      borderWidth: 0,
      borderColor: "transparent",
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 22,
    },
    adoptPromptButtonRow: {
      gap: 14,
      paddingHorizontal: 4,
    },
    promptIconOuterCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#9FCCFF",
      marginBottom: 12,
    },
    promptIconInnerCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.petDetailsAdoptButtonBackground,
    },
    promptIcon: {
      width: 46,
      height: 46,
    },
    cancelPromptIconOuterCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#F6A9A9",
      marginBottom: 12,
    },
    cancelPromptIconInnerCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E24D4D",
    },
    successIconOuterCircle: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#9BE2D8",
      marginBottom: 12,
    },
    successIconInnerCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#42BDA8",
    },
    adoptPromptTitle: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: colors.text,
      fontSize: 18,
      lineHeight: 26,
      fontWeight: "600",
      marginBottom: 18,
    },
    promptTitle: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: colors.text,
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "800",
      marginBottom: 8,
    },
    promptBodyText: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "600",
      marginBottom: 18,
    },
    promptWarningText: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: "#BF3B2D",
      fontSize: 14,
      lineHeight: 20,
      fontWeight: "700",
      marginBottom: 16,
    },
    promptButtonRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    promptButton: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
    },
    promptCancelButton: {
      backgroundColor: "#E5E5E5",
    },
    promptConfirmButton: {
      backgroundColor: colors.petDetailsAdoptButtonBackground,
    },
    promptDangerButton: {
      backgroundColor: "#E24D4D",
    },
    promptCancelText: {
      color: "#4B9AF0",
      fontFamily: RoundedFontFamily,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600",
    },
    promptConfirmText: {
      color: colors.petDetailsAdoptButtonText,
      fontFamily: RoundedFontFamily,
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "600",
    },
    promptButtonPressed: {
      opacity: 0.88,
    },
    successBodyText: {
      textAlign: "center",
      fontFamily: RoundedFontFamily,
      color: colors.petDetailsTextSecondary,
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "600",
      marginBottom: 18,
    },
    singleButtonRow: {
      width: "100%",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
    },
    singleModalButton: {
      height: 50,
      borderRadius: 25,
      alignItems: "center",
      justifyContent: "center",
      width: 180,
    },
  });
