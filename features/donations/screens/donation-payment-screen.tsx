import { PaymentMethodSelect } from "@/components/donations/payment-method-select";
import { PaymentQrModal } from "@/components/donations/payment-qr-modal";
import { ProofUploadCard } from "@/components/donations/proof-upload-card";
import { AppToast } from "@/components/ui/app-toast";
import { Colors, DisplayFontFamily, RoundedFontFamily } from "@/constants/theme";
import {
  DONATION_ASSETS,
  fetchDonationCauseById,
  formatDonationAmount,
  formatDonationCampaignDate,
  formatDonationCampaignStatus,
  formatDonationCampaignType,
  getDonationPaymentMethods,
  getDonationProgress,
  isDonationCampaignDonatable,
} from "@/features/donations/donations.data";
import type {
  DonationCauseItem,
  DonationPaymentDraft,
  DonationPaymentMethod,
} from "@/features/donations/donations.types";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import * as Clipboard from "expo-clipboard";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_CONTENT_WIDTH = 420;

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const sanitizeAmountInput = (rawValue: string) => {
  const normalized = rawValue.replace(/[^\d.]/g, "");
  const [integerPart = "", decimalRemainder] = normalized.split(".");

  if (decimalRemainder === undefined) {
    return integerPart;
  }

  return `${integerPart}.${decimalRemainder.slice(0, 2)}`;
};

const parseAmount = (value: string) => {
  const parsedValue = Number.parseFloat(value);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null;
  }

  return parsedValue;
};

export default function DonationPaymentScreen() {
  const router = useRouter();
  const { isHydrating, session } = useAuth();
  const params = useLocalSearchParams<{
    donationId?: string | string[];
    donationTitle?: string | string[];
  }>();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, MAX_CONTENT_WIDTH);
  const styles = useMemo(
    () => createStyles(colors, contentWidth),
    [colors, contentWidth],
  );
  const donationId = normalizeParam(params.donationId);
  const donationTitleParam = normalizeParam(params.donationTitle)?.trim();
  const [donationCause, setDonationCause] = useState<DonationCauseItem | null>(null);
  const [isDonationCauseLoading, setIsDonationCauseLoading] = useState(true);
  const donationTitle =
    donationCause?.title ?? donationTitleParam ?? "Shelter No.";
  const donationContextLabel = donationCause
    ? formatDonationCampaignType(donationCause.type)
    : "Donation";
  const campaignStatusText = donationCause
    ? formatDonationCampaignStatus(donationCause.status)
    : null;
  const campaignDeadlineText = formatDonationCampaignDate(donationCause?.deadline);
  const campaignProgress = donationCause ? getDonationProgress(donationCause) : 0;
  const canDonateToCampaign = donationCause
    ? isDonationCampaignDonatable(donationCause)
    : true;
  const paymentMethods = useMemo(() => getDonationPaymentMethods(), []);
  const { hideToast, showToast, toast } = useToast();
  const [amountInput, setAmountInput] = useState("");
  const [selectedPaymentModeId, setSelectedPaymentModeId] = useState<
    string | null
  >(null);
  const [proofImageUri, setProofImageUri] = useState<string | null>(null);
  const [specialMessage, setSpecialMessage] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [paymentModeError, setPaymentModeError] = useState<string | null>(null);
  const [activeQrMethod, setActiveQrMethod] =
    useState<DonationPaymentMethod | null>(null);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isSavingQr, setIsSavingQr] = useState(false);
  const selectedPaymentMethod = useMemo(
    () =>
      paymentMethods.find(
        (paymentMethod) => paymentMethod.id === selectedPaymentModeId,
      ) ?? null,
    [paymentMethods, selectedPaymentModeId],
  );
  const donationDraft = useMemo<DonationPaymentDraft>(
    () => ({
      donationId: donationCause?.id ?? donationId ?? "unknown",
      donationTitle,
      donationType: donationCause?.type ?? "OTHER",
      selectedAmount: parseAmount(amountInput),
      selectedPaymentModeId,
      qrImage: selectedPaymentMethod?.qrImage ?? null,
      accountName: selectedPaymentMethod?.accountName ?? null,
      accountNumber: selectedPaymentMethod?.accountNumber ?? null,
      uploadedProofImageUri: proofImageUri,
      specialMessage: specialMessage.trim(),
    }),
    [
      amountInput,
      donationCause?.id,
      donationCause?.type,
      donationId,
      donationTitle,
      proofImageUri,
      selectedPaymentMethod?.accountName,
      selectedPaymentMethod?.accountNumber,
      selectedPaymentMethod?.qrImage,
      selectedPaymentModeId,
      specialMessage,
    ],
  );

  useEffect(() => {
    let isMounted = true;

    const loadDonationCause = async () => {
      if (isHydrating) {
        if (isMounted) {
          setIsDonationCauseLoading(true);
        }
        return;
      }

      if (!donationId || !session?.accessToken) {
        if (isMounted) {
          setDonationCause(null);
          setIsDonationCauseLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsDonationCauseLoading(true);
      }

      try {
        const campaign = await fetchDonationCauseById(
          donationId,
          session.accessToken,
        );

        if (isMounted) {
          setDonationCause(campaign);
        }
      } catch (error) {
        console.error("[donation-payment] Failed to load campaign", error);

        if (isMounted) {
          setDonationCause(null);
          showToast(
            getErrorMessage(error, "Unable to load donation campaign."),
            "error",
          );
        }
      } finally {
        if (isMounted) {
          setIsDonationCauseLoading(false);
        }
      }
    };

    void loadDonationCause();

    return () => {
      isMounted = false;
    };
  }, [donationId, isHydrating, session?.accessToken, showToast]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/donations/home");
  };

  const handleSelectPaymentMethod = (method: DonationPaymentMethod) => {
    setSelectedPaymentModeId(method.id);
    setPaymentModeError(null);
    setActiveQrMethod(method);
    setIsQrModalVisible(true);
  };

  const handleCopyPaymentDetails = async (method: DonationPaymentMethod) => {
    await Clipboard.setStringAsync(
      `${method.accountName}\n${method.accountNumber}`,
    );
    showToast("Payment details copied.");
  };

  const handleSaveQr = async (method: DonationPaymentMethod) => {
    if (!FileSystem.documentDirectory) {
      showToast("Unable to save QR right now.", "error");
      return;
    }

    try {
      setIsSavingQr(true);
      const permissionResponse = await MediaLibrary.requestPermissionsAsync();

      if (!permissionResponse.granted) {
        showToast("Media library permission is required.", "error");
        return;
      }

      const extensionMatch = method.qrImage.match(/\.(png|jpg|jpeg)(?:\?|$)/i);
      const fileExtension = extensionMatch?.[1]?.toLowerCase() ?? "png";
      const targetFileUri = `${FileSystem.documentDirectory}donation-qr-${method.id}-${Date.now()}.${fileExtension}`;
      const result = await FileSystem.downloadAsync(
        method.qrImage,
        targetFileUri,
      );

      await MediaLibrary.saveToLibraryAsync(result.uri);
      showToast("QR image saved to your gallery.");
    } catch {
      showToast("Failed to save QR image.", "error");
    } finally {
      setIsSavingQr(false);
    }
  };

  const handlePickProofImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showToast("Media permission is required to upload proof.", "error");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["images"],
        quality: 1,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      setProofImageUri(result.assets[0].uri);
      showToast("Proof image selected.");
    } catch {
      showToast("Unable to open image library.", "error");
    }
  };

  const handlePrepareSubmission = () => {
    if (donationCause && !canDonateToCampaign) {
      showToast("This campaign is no longer accepting donations.", "error");
      return;
    }

    const parsedAmount = parseAmount(amountInput);

    if (!parsedAmount) {
      setAmountError("Please enter a valid amount.");
    } else {
      setAmountError(null);
    }

    if (!selectedPaymentMethod) {
      setPaymentModeError("Please select a payment mode.");
    } else {
      setPaymentModeError(null);
    }

    if (!parsedAmount || !selectedPaymentMethod) {
      showToast("Complete the required fields first.", "error");
      return;
    }

    showToast(
      `Ready: \u20b1 ${donationDraft.selectedAmount?.toFixed(2)} via ${selectedPaymentMethod.name}.`,
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <AppToast onDismiss={hideToast} toast={toast} />

      <PaymentQrModal
        visible={isQrModalVisible}
        method={activeQrMethod}
        isSavingQr={isSavingQr}
        onClose={() => setIsQrModalVisible(false)}
        onCopyDetails={handleCopyPaymentDetails}
        onSaveQr={handleSaveQr}
      />

      <KeyboardAvoidingView
        style={styles.contentWrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top}
      >
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
                pressed && styles.pressed,
              ]}
            >
              <Image
                source={DONATION_ASSETS.backIcon}
                style={[
                  styles.backIcon,
                  { tintColor: colors.dashboardBottomIconActive },
                ]}
                resizeMode="contain"
              />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.title}>Donation</Text>
              <Text style={styles.subtitle}>Insert desired donation cause</Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.body}
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.bodyContent,
            {
              paddingBottom: insets.bottom + 20,
            },
          ]}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{donationTitle}</Text>
            <Text style={styles.causeName}>{donationContextLabel}</Text>
            {isDonationCauseLoading ? (
              <Text style={styles.campaignMetaLabel}>Loading campaign details...</Text>
            ) : null}
            {campaignStatusText ? (
              <Text style={styles.campaignMetaLabel}>{`Status: ${campaignStatusText}`}</Text>
            ) : null}
            {donationCause ? (
              <Text style={styles.campaignMetaLabel}>
                {`${formatDonationAmount(donationCause.totalDonatedCost)} of ${formatDonationAmount(donationCause.totalCost)} raised (${Math.round(
                  campaignProgress * 100,
                )}%)`}
              </Text>
            ) : null}
            {campaignDeadlineText ? (
              <Text style={styles.campaignMetaLabel}>{`Deadline: ${campaignDeadlineText}`}</Text>
            ) : null}
            {donationCause && !canDonateToCampaign ? (
              <Text style={styles.campaignClosedLabel}>
                This campaign is no longer accepting donations.
              </Text>
            ) : null}

            <PaymentMethodSelect
              methods={paymentMethods}
              selectedMethod={selectedPaymentMethod}
              onSelectMethod={handleSelectPaymentMethod}
              style={styles.paymentModeRow}
            />

            {paymentModeError ? (
              <Text style={styles.errorLabel}>{paymentModeError}</Text>
            ) : null}

            <Text style={styles.customAmountLabel}>Amount</Text>

            <View
              style={[
                styles.amountInputWrap,
                amountError && styles.inputErrorBorder,
              ]}
            >
              <Text style={styles.amountPrefix}>{"\u20b1"}</Text>
              <TextInput
                keyboardType="decimal-pad"
                onChangeText={(value) => {
                  setAmountInput(sanitizeAmountInput(value));
                  setAmountError(null);
                }}
                placeholder="00.00"
                placeholderTextColor="rgba(42, 67, 99, 0.42)"
                style={styles.amountInput}
                value={amountInput}
              />
            </View>

            {amountError ? (
              <Text style={styles.errorLabel}>{amountError}</Text>
            ) : null}
          </View>

          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeader}>Proof of Donation</Text>
            <ProofUploadCard
              imageUri={proofImageUri}
              onPickImage={handlePickProofImage}
              onRemoveImage={() => setProofImageUri(null)}
            />
          </View>

          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeader}>Special Message:</Text>
            <View style={styles.messageWrap}>
              <TextInput
                multiline
                onChangeText={setSpecialMessage}
                placeholder="Type here..."
                placeholderTextColor="rgba(42, 67, 99, 0.35)"
                style={styles.messageInput}
                textAlignVertical="top"
                value={specialMessage}
              />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!canDonateToCampaign}
            onPress={handlePrepareSubmission}
            style={({ pressed }) => [
              styles.submitButton,
              !canDonateToCampaign && styles.submitButtonDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.submitButtonText}>Donate</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light, contentWidth: number) => {
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
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    backButton: {
      position: "absolute",
      left: 0,
      width: 28,
      height: 28,
      alignItems: "center",
      justifyContent: "center",
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
      fontFamily: DisplayFontFamily,
      color: colors.loginHeaderGradientStart,
      fontSize: 32,
      lineHeight: 34,
      fontWeight: "900",
      textAlign: "center",
    },
    subtitle: {
      ...roundedText,
      marginTop: 2,
      color: colors.loginTabText,
      fontSize: 14,
      lineHeight: 14,
      fontWeight: "700",
      textAlign: "center",
    },
    body: {
      flex: 1,
    },
    bodyContent: {
      flexGrow: 1,
      paddingTop: 18,
      paddingHorizontal: 20,
    },
    sectionCard: {
      width: "100%",
    },
    sectionTitle: {
      ...roundedText,
      fontFamily: DisplayFontFamily,
      color: colors.dashboardHeaderText,
      fontSize: 32,
      lineHeight: 36,
      fontWeight: "900",
    },
    causeName: {
      ...roundedText,
      marginTop: 2,
      color: "rgba(245, 250, 255, 0.75)",
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "700",
    },
    campaignMetaLabel: {
      ...roundedText,
      marginTop: 3,
      color: colors.dashboardSubtleText,
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "700",
    },
    campaignClosedLabel: {
      ...roundedText,
      marginTop: 6,
      color: "#FFE0E0",
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "800",
    },
    paymentModeRow: {
      marginTop: 10,
    },
    customAmountLabel: {
      ...roundedText,
      marginTop: 14,
      color: colors.dashboardHeaderText,
      fontSize: 14,
      lineHeight: 16,
      fontWeight: "700",
    },
    amountInputWrap: {
      marginTop: 6,
      minHeight: 36,
      borderRadius: 8,
      backgroundColor: colors.dashboardSectionCardBackground,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
    },
    amountPrefix: {
      ...roundedText,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
      marginRight: 4,
    },
    amountInput: {
      ...roundedText,
      flex: 1,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "900",
      paddingVertical: 8,
    },
    inputErrorBorder: {
      borderWidth: 1,
      borderColor: colors.loginError,
    },
    sectionWrap: {
      marginTop: 18,
      width: "100%",
    },
    sectionHeader: {
      ...roundedText,
      color: colors.dashboardHeaderText,
      fontSize: 16,
      lineHeight: 29,
      fontWeight: "900",
      marginBottom: 8,
    },
    messageWrap: {
      width: "100%",
      borderRadius: 8,
      backgroundColor: "rgba(175, 206, 239, 0.88)",
      padding: 8,
    },
    messageInput: {
      ...roundedText,
      minHeight: 120,
      borderRadius: 8,
      backgroundColor: colors.dashboardSectionCardBackground,
      color: colors.dashboardBottomIconActive,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
      paddingHorizontal: 10,
      paddingVertical: 10,
    },
    submitButton: {
      marginTop: 24,
      alignSelf: "center",
      minWidth: 126,
      minHeight: 42,
      borderRadius: 999,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#9CC4EC",
      borderWidth: 1,
      borderColor: "rgba(229, 243, 255, 0.95)",
      paddingHorizontal: 24,
      shadowColor: "rgba(21, 67, 116, 0.5)",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
    },
    submitButtonText: {
      ...roundedText,
      color: "#3D73AC",
      fontSize: 20,
      lineHeight: 32,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    submitButtonDisabled: {
      opacity: 0.45,
    },
    errorLabel: {
      ...roundedText,
      marginTop: 6,
      color: "#FFE0E0",
      fontSize: 8,
      lineHeight: 13,
      fontWeight: "700",
    },
    pressed: {
      opacity: 0.85,
    },
  });
};
