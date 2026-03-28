import { AppToast } from "@/components/ui/app-toast";
import { FullScreenLoader } from "@/components/ui/full-screen-loader";
import { OtpCodeInput } from "@/components/ui/otp-code-input";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { Colors, RoundedFontFamily } from "@/constants/theme";
import {
  type AuthFieldKey,
  type AuthFormValues,
  validateEmail,
  validatePasswordResetForm,
} from "@/features/auth/validation";
import { PROFILE_ASSETS } from "@/features/profile/profile.data";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import { userStorage } from "@/services/user/user.storage";
import type { SendOtpResponse } from "@/types/auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChangePasswordStep = "request" | "otp" | "password";

type PasswordFieldVisibility = {
  confirmPassword: boolean;
  newPassword: boolean;
};

const OTP_LENGTH = 6;
const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;

const extractResendCooldownSeconds = (
  response: SendOtpResponse | null,
): number => {
  if (!response) {
    return DEFAULT_RESEND_COOLDOWN_SECONDS;
  }

  const numericValueCandidates = [
    response.retryAfterSeconds,
    response.resendAfterSeconds,
    response.resendInSeconds,
    response.cooldownSeconds,
    response.retryAfter,
  ];

  for (const value of numericValueCandidates) {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      return Math.ceil(value);
    }
  }

  const secondsMatch = response.message?.match(
    /(\d+)\s*(?:seconds?|secs?|sec|s)\b/i,
  );

  if (secondsMatch) {
    return Number.parseInt(secondsMatch[1], 10);
  }

  return DEFAULT_RESEND_COOLDOWN_SECONDS;
};

const formatResendTimer = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

const resolveNonEmptyText = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
};

const buildResetValidationForm = (
  email: string,
  password: string,
  confirmPassword: string,
): AuthFormValues => ({
  confirmPassword,
  email,
  firstName: "",
  lastName: "",
  middleName: "",
  password,
});

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { confirmOtp, resetPassword, sendOtp, session } = useAuth();
  const { hideToast, showToast, toast } = useToast();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [email, setEmail] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(true);
  const [step, setStep] = useState<ChangePasswordStep>("request");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Partial<Record<AuthFieldKey, string>>>(
    {},
  );
  const [otpError, setOtpError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSubtitle, setLoadingSubtitle] = useState(
    "Preparing your request...",
  );
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordFieldVisibility>({
      confirmPassword: false,
      newPassword: false,
    });

  useEffect(() => {
    let isMounted = true;

    const hydrateCachedEmail = async () => {
      const userId = resolveNonEmptyText(session?.user?.id);
      const sessionEmail = resolveNonEmptyText(session?.user?.email);

      if (!userId) {
        if (isMounted) {
          setEmail(sessionEmail ?? "");
          setIsEmailLoading(false);
        }
        return;
      }

      try {
        const cachedProfile = await userStorage.getUserProfile(userId);
        const cachedEmail = resolveNonEmptyText(cachedProfile?.email);

        if (isMounted) {
          setEmail(cachedEmail ?? sessionEmail ?? "");
        }
      } finally {
        if (isMounted) {
          setIsEmailLoading(false);
        }
      }
    };

    void hydrateCachedEmail();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.email, session?.user?.id]);

  useEffect(() => {
    if (resendSecondsLeft <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setResendSecondsLeft((currentValue) => Math.max(0, currentValue - 1));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [resendSecondsLeft]);

  const clearTransientErrors = () => {
    setApiError(null);
    setOtpError(null);
  };

  const clearPasswordFields = () => {
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/profile");
  };

  const requestResetOtpWithFullScreenLoader = async (
    fallbackSuccessMessage: string,
    subtitle: string,
  ) => {
    setLoadingSubtitle(subtitle);
    setIsSubmitting(true);

    try {
      const response = await sendOtp({
        email: email.trim(),
        purpose: "reset-password",
      });
      setResendSecondsLeft(extractResendCooldownSeconds(response));
      showToast(response?.message?.trim() || fallbackSuccessMessage);
      return true;
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestOtp = async () => {
    const emailError = validateEmail(email);
    clearTransientErrors();
    setErrors({});

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    const otpSent = await requestResetOtpWithFullScreenLoader(
      "Password reset OTP sent. Enter it to continue.",
      "Sending password reset OTP...",
    );

    if (otpSent) {
      setStep("otp");
      setOtpCode("");
    }
  };

  const handleConfirmOtp = async () => {
    clearTransientErrors();

    if (!otpCode.trim() || otpCode.trim().length < OTP_LENGTH) {
      setOtpError(ERROR_MESSAGES.otpRequired);
      return;
    }

    setLoadingSubtitle("Verifying your OTP...");
    setIsSubmitting(true);

    try {
      await confirmOtp({
        email: email.trim(),
        otp: otpCode.trim(),
        purpose: "reset-password",
      });
      setStep("password");
      setResendSecondsLeft(0);
      setErrors({});
      setOtpError(null);
      showToast("OTP verified. Set your new password.");
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNewPassword = async () => {
    const nextErrors = validatePasswordResetForm(
      buildResetValidationForm(email, newPassword, confirmPassword),
    );
    setErrors(nextErrors);
    clearTransientErrors();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoadingSubtitle("Saving your new password...");
    setIsSubmitting(true);

    try {
      await resetPassword({
        confirmPassword,
        email: email.trim(),
        newPassword,
      });
      showToast("Password updated successfully.");
      clearPasswordFields();
      setStep("request");
      setOtpCode("");
      setErrors({});
      setResendSecondsLeft(0);
      handleBack();
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (step === "request") {
      await handleRequestOtp();
      return;
    }

    if (step === "otp") {
      await handleConfirmOtp();
      return;
    }

    await handleSaveNewPassword();
  };

  const handleResendOtp = async () => {
    if (resendSecondsLeft > 0) {
      return;
    }

    clearTransientErrors();
    await requestResetOtpWithFullScreenLoader("OTP sent again.", "Resending OTP...");
  };

  const handleSecondaryAction = () => {
    clearTransientErrors();
    setErrors({});
    setOtpCode("");

    if (step === "password") {
      setStep("otp");
      clearPasswordFields();
      return;
    }

    if (step === "otp") {
      setStep("request");
      setResendSecondsLeft(0);
    }
  };

  const submitLabel =
    step === "request"
      ? "Send OTP"
      : step === "otp"
        ? "Confirm OTP"
        : "Save New Password";

  const secondaryLabel = step === "password" ? "Back to OTP" : "Back";
  const showSecondaryAction = step !== "request";
  const canResendOtp = resendSecondsLeft === 0 && !isSubmitting;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <AppToast onDismiss={hideToast} toast={toast} />

      <LinearGradient
        colors={[
          colors.loginHeaderGradientEnd,
          colors.dashboardScreenBackground,
          colors.loginHeaderGradientStart,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
          style={styles.keyboard}
        >
          <View
            style={[
              styles.actionsRow,
              {
                paddingTop: insets.top + 10,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={handleBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Image
                source={PROFILE_ASSETS.backIcon}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingBottom: insets.bottom + 26,
              },
            ]}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.caption}>
                We will use your cached profile email for OTP verification.
              </Text>

              <View style={styles.emailPill}>
                <MaterialIcons
                  color={colors.dashboardBottomIcon}
                  name="email"
                  size={18}
                />
                <Text style={styles.emailText}>{email || "No email found"}</Text>
              </View>

              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              {step === "otp" ? (
                <>
                  <Text style={styles.flowTitle}>Verify OTP</Text>
                  <Text style={styles.flowText}>
                    Enter the OTP sent to {email.trim()}.
                  </Text>
                  <OtpCodeInput
                    activeBorderColor={colors.loginTabActiveBackground}
                    backgroundColor={colors.loginInputBackground}
                    borderColor={colors.loginInputBorder}
                    errorBorderColor={colors.loginError}
                    hasError={Boolean(otpError)}
                    length={OTP_LENGTH}
                    onChange={(value) => {
                      setOtpCode(value);
                      setOtpError(null);
                      setApiError(null);
                    }}
                    textColor={colors.loginInputText}
                    value={otpCode}
                  />
                  {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                </>
              ) : null}

              {step === "password" ? (
                <>
                  <Text style={styles.flowTitle}>Set New Password</Text>
                  <Text style={styles.flowText}>
                    Choose and confirm your new password.
                  </Text>

                  <View
                    style={[
                      styles.passwordInputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      placeholder="New Password"
                      placeholderTextColor={colors.loginPlaceholder}
                      secureTextEntry={!passwordVisibility.newPassword}
                      style={styles.passwordInput}
                      value={newPassword}
                      onChangeText={(value) => {
                        setNewPassword(value);
                        setErrors((currentValue) => ({
                          ...currentValue,
                          password: undefined,
                        }));
                      }}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.newPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() =>
                        setPasswordVisibility((currentValue) => ({
                          ...currentValue,
                          newPassword: !currentValue.newPassword,
                        }))
                      }
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.newPassword
                            ? "visibility-off"
                            : "visibility"
                        }
                        size={22}
                      />
                    </Pressable>
                  </View>
                  {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  ) : null}

                  <View
                    style={[
                      styles.passwordInputWrapper,
                      errors.confirmPassword && styles.inputError,
                    ]}
                  >
                    <TextInput
                      placeholder="Confirm Password"
                      placeholderTextColor={colors.loginPlaceholder}
                      secureTextEntry={!passwordVisibility.confirmPassword}
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={(value) => {
                        setConfirmPassword(value);
                        setErrors((currentValue) => ({
                          ...currentValue,
                          confirmPassword: undefined,
                        }));
                      }}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.confirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() =>
                        setPasswordVisibility((currentValue) => ({
                          ...currentValue,
                          confirmPassword: !currentValue.confirmPassword,
                        }))
                      }
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.confirmPassword
                            ? "visibility-off"
                            : "visibility"
                        }
                        size={22}
                      />
                    </Pressable>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  ) : null}
                </>
              ) : null}

              {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

              <Pressable
                disabled={isSubmitting || isEmailLoading}
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  (isSubmitting || isEmailLoading) && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitButtonText}>{submitLabel}</Text>
              </Pressable>

              {step === "otp" && email.trim() ? (
                <Pressable
                  disabled={!canResendOtp}
                  onPress={handleResendOtp}
                  style={styles.linkRow}
                >
                  <Text
                    style={[
                      styles.linkText,
                      !canResendOtp && styles.linkTextDisabled,
                    ]}
                  >
                    {canResendOtp
                      ? "Resend OTP"
                      : `Resend OTP in ${formatResendTimer(resendSecondsLeft)}`}
                  </Text>
                </Pressable>
              ) : null}

              {showSecondaryAction ? (
                <Pressable onPress={handleSecondaryAction} style={styles.linkRow}>
                  <Text style={styles.linkText}>{secondaryLabel}</Text>
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <FullScreenLoader
        absolute
        backgroundColor={colors.loginHeaderGradientEnd}
        subtitle={loadingSubtitle}
        visible={isSubmitting}
      />
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.dashboardScreenBackground,
    },
    gradient: {
      flex: 1,
    },
    keyboard: {
      flex: 1,
    },
    actionsRow: {
      minHeight: 44,
      paddingHorizontal: 18,
      alignItems: "flex-start",
      justifyContent: "center",
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    backIcon: {
      width: 24,
      height: 24,
      tintColor: colors.white,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 14,
    },
    card: {
      width: "100%",
      maxWidth: 420,
      alignSelf: "center",
      borderRadius: 26,
      borderWidth: 2,
      borderColor: "rgba(255, 255, 255, 0.94)",
      backgroundColor: "rgba(40, 111, 188, 0.86)",
      paddingHorizontal: 16,
      paddingTop: 18,
      paddingBottom: 24,
    },
    title: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 20,
      lineHeight: 28,
      fontWeight: "900",
      textAlign: "center",
    },
    caption: {
      marginTop: 8,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "600",
      textAlign: "center",
    },
    emailPill: {
      marginTop: 14,
      width: "100%",
      borderRadius: 14,
      borderWidth: 1.2,
      borderColor: colors.loginInputBorder,
      backgroundColor: colors.loginInputBackground,
      minHeight: 52,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      columnGap: 8,
    },
    emailText: {
      flexShrink: 1,
      fontFamily: RoundedFontFamily,
      color: colors.loginInputText,
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
    },
    flowTitle: {
      marginTop: 18,
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "900",
      textAlign: "center",
    },
    flowText: {
      marginTop: 6,
      marginBottom: 10,
      fontFamily: RoundedFontFamily,
      color: colors.dashboardSubtleText,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "600",
      textAlign: "center",
    },
    passwordInputWrapper: {
      width: "100%",
      minHeight: 52,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: colors.loginInputBorder,
      backgroundColor: colors.loginInputBackground,
      paddingHorizontal: 12,
      marginTop: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    passwordInput: {
      flex: 1,
      fontFamily: RoundedFontFamily,
      color: colors.loginInputText,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "700",
    },
    passwordIconButton: {
      marginLeft: 8,
      paddingVertical: 4,
      paddingHorizontal: 2,
    },
    submitButton: {
      marginTop: 16,
      width: "78%",
      alignSelf: "center",
      minHeight: 52,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.loginTabActiveBackground,
      borderWidth: 1.5,
      borderColor: colors.white,
      shadowColor: colors.dashboardShadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    submitButtonDisabled: {
      opacity: 0.72,
    },
    submitButtonText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 16,
      lineHeight: 20,
      fontWeight: "900",
      letterSpacing: 0.2,
    },
    linkRow: {
      marginTop: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    linkText: {
      fontFamily: RoundedFontFamily,
      color: colors.white,
      fontSize: 14,
      lineHeight: 18,
      fontWeight: "800",
    },
    linkTextDisabled: {
      opacity: 0.72,
    },
    errorText: {
      marginTop: 8,
      fontFamily: RoundedFontFamily,
      color: colors.loginError,
      fontSize: 14,
      lineHeight: 17,
      fontWeight: "700",
      textAlign: "center",
    },
    inputError: {
      borderColor: colors.loginError,
    },
    pressed: {
      opacity: 0.84,
    },
  });
