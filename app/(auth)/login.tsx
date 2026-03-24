import { AppToast } from "@/components/ui/app-toast";
import { OtpCodeInput } from "@/components/ui/otp-code-input";
import { ERROR_MESSAGES } from "@/constants/error-messages";
import { Colors } from "@/constants/theme";
import {
  type AuthFieldKey,
  type AuthFormValues,
  type AuthMode,
  validateAuthForm,
  validateEmail,
  validatePasswordResetForm,
} from "@/features/auth/validation";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/services/api/api-error";
import type { OtpPurpose, SendOtpResponse } from "@/types/auth";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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

type SignUpStep = "details" | "otp";
type ForgotPasswordStep = "idle" | "otp" | "password";
type PasswordFieldVisibility = {
  loginPassword: boolean;
  resetConfirmPassword: boolean;
  resetPassword: boolean;
  signUpConfirmPassword: boolean;
  signUpPassword: boolean;
};

const INITIAL_FORM: AuthFormValues = {
  confirmPassword: "",
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  password: "",
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

export default function Login() {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { confirmOtp, resetPassword, sendOtp, signIn, signUp } = useAuth();
  const { hideToast, showToast, toast } = useToast();
  const [activeTab, setActiveTab] = useState<AuthMode>("login");
  const [form, setForm] = useState<AuthFormValues>(INITIAL_FORM);
  const [otpCode, setOtpCode] = useState("");
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("details");
  const [forgotPasswordStep, setForgotPasswordStep] =
    useState<ForgotPasswordStep>("idle");
  const [errors, setErrors] = useState<Partial<Record<AuthFieldKey, string>>>(
    {},
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [passwordVisibility, setPasswordVisibility] =
    useState<PasswordFieldVisibility>({
      loginPassword: false,
      resetConfirmPassword: false,
      resetPassword: false,
      signUpConfirmPassword: false,
      signUpPassword: false,
    });

  const isSignUp = activeTab === "signup";
  const isSignUpOtpStep = isSignUp && signUpStep === "otp";
  const isForgotPasswordOtpStep =
    !isSignUp && forgotPasswordStep === "otp";
  const isForgotPasswordPasswordStep =
    !isSignUp && forgotPasswordStep === "password";
  const isPlainLoginStep = !isSignUp && forgotPasswordStep === "idle";
  const isOtpFlow = isSignUpOtpStep || isForgotPasswordOtpStep;
  const isForgotPasswordFlow = !isSignUp && forgotPasswordStep !== "idle";
  const titleWidth = Math.min(width, 420) * 0.7;
  const titleHeight = titleWidth * 0.9;

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
    setForm((currentValue) => ({
      ...currentValue,
      confirmPassword: "",
      password: "",
    }));
  };

  const resetScreenFlow = () => {
    setSignUpStep("details");
    setForgotPasswordStep("idle");
    setOtpCode("");
    setResendSecondsLeft(0);
    setErrors({});
    clearTransientErrors();
  };

  const switchTab = (tab: AuthMode) => {
    setActiveTab(tab);
    resetScreenFlow();
    clearPasswordFields();
  };

  const clearFieldError = (field: AuthFieldKey) => {
    setErrors((currentValue) => {
      if (!currentValue[field]) {
        return currentValue;
      }

      const nextValue = { ...currentValue };
      delete nextValue[field];
      return nextValue;
    });
  };

  const togglePasswordVisibility = (field: keyof PasswordFieldVisibility) => {
    setPasswordVisibility((currentValue) => ({
      ...currentValue,
      [field]: !currentValue[field],
    }));
  };

  const updateField = (field: AuthFieldKey, value: string) => {
    setForm((currentValue) => ({ ...currentValue, [field]: value }));
    clearFieldError(field);
    clearTransientErrors();

    if (field === "email") {
      setOtpCode("");
      setResendSecondsLeft(0);

      if (signUpStep === "otp") {
        setSignUpStep("details");
      }

      if (forgotPasswordStep !== "idle") {
        setForgotPasswordStep("idle");
        clearPasswordFields();
      }
    }
  };

  const validateOtpCode = () => {
    if (!otpCode.trim() || otpCode.trim().length < OTP_LENGTH) {
      setOtpError(ERROR_MESSAGES.otpRequired);
      return false;
    }

    return true;
  };

  const startResendCooldown = (response: SendOtpResponse | null) => {
    const nextSeconds = extractResendCooldownSeconds(response);
    setResendSecondsLeft(nextSeconds);
  };

  const requestOtp = async (
    purpose: Extract<OtpPurpose, "signup" | "reset-password">,
    fallbackSuccessMessage: string,
  ) => {
    const response = await sendOtp({
      email: form.email.trim(),
      purpose,
    });

    startResendCooldown(response);
    showToast(response?.message?.trim() || fallbackSuccessMessage);
  };

  const handleSignUpOtpRequest = async () => {
    const nextErrors = validateAuthForm("signup", form);
    setErrors(nextErrors);
    clearTransientErrors();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await requestOtp("signup", "OTP sent to your email.");
      setSignUpStep("otp");
      setOtpCode("");
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpConfirm = async () => {
    clearTransientErrors();

    if (!validateOtpCode()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmOtp({
        email: form.email.trim(),
        otp: otpCode.trim(),
        purpose: "signup",
      });

      await signUp({
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        middleName: form.middleName.trim() || undefined,
        password: form.password,
      });

      setActiveTab("login");
      setSignUpStep("details");
      setOtpCode("");
      setResendSecondsLeft(0);
      setErrors({});
      setForm((currentValue) => ({
        ...INITIAL_FORM,
        email: currentValue.email.trim(),
      }));
      showToast("Account created successfully.");
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordStart = async () => {
    const emailError = validateEmail(form.email);
    clearTransientErrors();
    setErrors({});

    if (emailError) {
      setErrors({ email: emailError });
      return;
    }

    setIsSubmitting(true);

    try {
      await requestOtp(
        "reset-password",
        "Password reset OTP sent. Enter it to continue.",
      );
      setForgotPasswordStep("otp");
      setOtpCode("");
      clearPasswordFields();
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordOtpConfirm = async () => {
    clearTransientErrors();

    if (!validateOtpCode()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmOtp({
        email: form.email.trim(),
        otp: otpCode.trim(),
        purpose: "reset-password",
      });
      setForgotPasswordStep("password");
      setOtpError(null);
      setErrors({});
      setResendSecondsLeft(0);
      showToast("OTP verified. Set your new password.");
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPasswordSave = async () => {
    const nextErrors = validatePasswordResetForm(form);
    setErrors(nextErrors);
    clearTransientErrors();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        confirmPassword: form.confirmPassword,
        email: form.email.trim(),
        newPassword: form.password,
      });
      setForgotPasswordStep("idle");
      setOtpCode("");
      setResendSecondsLeft(0);
      clearPasswordFields();
      setErrors({});
      showToast("Password updated successfully.");
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async () => {
    const nextErrors = validateAuthForm("login", form);
    setErrors(nextErrors);
    clearTransientErrors();

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn({
        email: form.email.trim(),
        password: form.password,
      });
      router.replace("/(tabs)");
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (isSignUp) {
      if (signUpStep === "details") {
        await handleSignUpOtpRequest();
        return;
      }

      await handleSignUpConfirm();
      return;
    }

    if (forgotPasswordStep === "otp") {
      await handleForgotPasswordOtpConfirm();
      return;
    }

    if (forgotPasswordStep === "password") {
      await handleResetPasswordSave();
      return;
    }

    await handleLogin();
  };

  const handleResendOtp = async () => {
    if (resendSecondsLeft > 0) {
      return;
    }

    clearTransientErrors();
    setIsSubmitting(true);

    try {
      await requestOtp(
        isSignUp ? "signup" : "reset-password",
        "OTP sent again.",
      );
    } catch (error) {
      setApiError(getErrorMessage(error, ERROR_MESSAGES.authFallback));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecondaryAction = () => {
    clearTransientErrors();
    setErrors({});
    setOtpCode("");

    if (isSignUp) {
      setSignUpStep("details");
      setResendSecondsLeft(0);
      return;
    }

    if (forgotPasswordStep === "password") {
      setForgotPasswordStep("otp");
      return;
    }

    setForgotPasswordStep("idle");
    setOtpCode("");
    setResendSecondsLeft(0);
    clearPasswordFields();
  };

  const submitLabel = isSignUp
    ? signUpStep === "details"
      ? "Send OTP"
      : "Confirm OTP & Create Account"
    : forgotPasswordStep === "otp"
        ? "Confirm OTP"
        : forgotPasswordStep === "password"
          ? "Save New Password"
        : "Log In";

  const secondaryLabel = isSignUp
    ? "Back to Details"
    : forgotPasswordStep === "password"
      ? "Back to OTP"
      : "Back to Login";

  const showSecondaryAction = isSignUpOtpStep || isForgotPasswordFlow;
  const canResendOtp = resendSecondsLeft === 0 && !isSubmitting;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <AppToast onDismiss={hideToast} toast={toast} />

      <KeyboardAvoidingView
        style={styles.authCard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        <LinearGradient
          colors={[
            colors.loginHeaderGradientStart,
            colors.loginHeaderGradientEnd,
          ]}
          style={[
            styles.topHeader,
            { height: Math.max(245, titleHeight + 44) },
          ]}
        >
          <View style={styles.logoFrame}>
            <Image
              source={require("../../assets/images/title-logo.png")}
              style={[styles.logo, { width: titleWidth, height: titleHeight }]}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={[
            styles.formContent,
            { paddingBottom: 42 + insets.bottom },
          ]}
          automaticallyAdjustKeyboardInsets
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tabSwitch}>
            <Pressable
              style={[styles.tabButton, !isSignUp && styles.activeTabButton]}
              onPress={() => switchTab("login")}
            >
              <Text style={[styles.tabText, !isSignUp && styles.activeTabText]}>
                Login
              </Text>
            </Pressable>

            <Pressable
              style={[styles.tabButton, isSignUp && styles.activeTabButton]}
              onPress={() => switchTab("signup")}
            >
              <Text style={[styles.tabText, isSignUp && styles.activeTabText]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          {isSignUp ? (
            <>
              {signUpStep === "details" ? (
                <>
                  <TextInput
                    placeholder="First Name"
                    placeholderTextColor={colors.loginPlaceholder}
                    value={form.firstName}
                    onChangeText={(value) => updateField("firstName", value)}
                    style={[styles.input, errors.firstName && styles.inputError]}
                  />
                  {errors.firstName ? (
                    <Text style={styles.errorText}>{errors.firstName}</Text>
                  ) : null}

                  <TextInput
                    placeholder="Middle Name"
                    placeholderTextColor={colors.loginPlaceholder}
                    value={form.middleName}
                    onChangeText={(value) => updateField("middleName", value)}
                    style={styles.input}
                  />

                  <TextInput
                    placeholder="Last Name"
                    placeholderTextColor={colors.loginPlaceholder}
                    value={form.lastName}
                    onChangeText={(value) => updateField("lastName", value)}
                    style={[styles.input, errors.lastName && styles.inputError]}
                  />
                  {errors.lastName ? (
                    <Text style={styles.errorText}>{errors.lastName}</Text>
                  ) : null}

                  <TextInput
                    placeholder="Email"
                    placeholderTextColor={colors.loginPlaceholder}
                    value={form.email}
                    onChangeText={(value) => updateField("email", value)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, errors.email && styles.inputError]}
                  />
                  {errors.email ? (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}

                  <View
                    style={[
                      styles.passwordInputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor={colors.loginPlaceholder}
                      value={form.password}
                      onChangeText={(value) => {
                        updateField("password", value);
                        clearFieldError("confirmPassword");
                      }}
                      secureTextEntry={!passwordVisibility.signUpPassword}
                      style={styles.passwordInput}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.signUpPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() => togglePasswordVisibility("signUpPassword")}
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.signUpPassword
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
                      value={form.confirmPassword}
                      onChangeText={(value) =>
                        updateField("confirmPassword", value)
                      }
                      secureTextEntry={!passwordVisibility.signUpConfirmPassword}
                      style={styles.passwordInput}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.signUpConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() =>
                        togglePasswordVisibility("signUpConfirmPassword")
                      }
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.signUpConfirmPassword
                            ? "visibility-off"
                            : "visibility"
                        }
                        size={22}
                      />
                    </Pressable>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  ) : null}
                </>
              ) : (
                <>
                  <Text style={styles.flowTitle}>Verify your email</Text>
                  <Text style={styles.flowText}>
                    Enter the OTP sent to {form.email.trim()} before creating
                    your account.
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
                  {otpError ? (
                    <Text style={styles.otpErrorText}>{otpError}</Text>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <>
              <TextInput
                placeholder="Email"
                placeholderTextColor={colors.loginPlaceholder}
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[styles.input, errors.email && styles.inputError]}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
              ) : null}

              {isPlainLoginStep ? (
                <>
                  <View
                    style={[
                      styles.passwordInputWrapper,
                      errors.password && styles.inputError,
                    ]}
                  >
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor={colors.loginPlaceholder}
                      value={form.password}
                      onChangeText={(value) => updateField("password", value)}
                      secureTextEntry={!passwordVisibility.loginPassword}
                      style={styles.passwordInput}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.loginPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() => togglePasswordVisibility("loginPassword")}
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.loginPassword
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
                </>
              ) : null}

              {isForgotPasswordOtpStep ? (
                <>
                  <Text style={styles.flowTitle}>Verify OTP</Text>
                  <Text style={styles.flowText}>
                    Enter the OTP sent to {form.email.trim()} to continue with
                    password reset.
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
                  {otpError ? (
                    <Text style={styles.otpErrorText}>{otpError}</Text>
                  ) : null}
                </>
              ) : null}

              {isForgotPasswordPasswordStep ? (
                <>
                  <Text style={styles.flowTitle}>Reset your password</Text>
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
                      value={form.password}
                      onChangeText={(value) => {
                        updateField("password", value);
                        clearFieldError("confirmPassword");
                      }}
                      secureTextEntry={!passwordVisibility.resetPassword}
                      style={styles.passwordInput}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.resetPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() => togglePasswordVisibility("resetPassword")}
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.resetPassword
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
                      value={form.confirmPassword}
                      onChangeText={(value) =>
                        updateField("confirmPassword", value)
                      }
                      secureTextEntry={!passwordVisibility.resetConfirmPassword}
                      style={styles.passwordInput}
                    />
                    <Pressable
                      accessibilityLabel={
                        passwordVisibility.resetConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      hitSlop={10}
                      onPress={() =>
                        togglePasswordVisibility("resetConfirmPassword")
                      }
                      style={styles.passwordIconButton}
                    >
                      <MaterialIcons
                        color={colors.loginPlaceholder}
                        name={
                          passwordVisibility.resetConfirmPassword
                            ? "visibility-off"
                            : "visibility"
                        }
                        size={22}
                      />
                    </Pressable>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  ) : null}
                </>
              ) : null}
            </>
          )}

          {apiError ? (
            <Text style={isOtpFlow ? styles.otpErrorText : styles.errorText}>
              {apiError}
            </Text>
          ) : null}

          {!isSignUp && isPlainLoginStep && form.email.trim() ? (
            <View style={styles.utilityRow}>
              <Pressable onPress={handleForgotPasswordStart}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          ) : null}

          <Pressable
            disabled={isSubmitting}
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.loginTabActiveText} />
            ) : (
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
            )}
          </Pressable>

          {isOtpFlow && form.email.trim() ? (
            <Pressable
              disabled={!canResendOtp}
              onPress={handleResendOtp}
              style={styles.linkRow}
            >
              <Text style={[styles.linkText, !canResendOtp && styles.linkTextDisabled]}>
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
          ) : (
            <Pressable
              onPress={() => switchTab(isSignUp ? "login" : "signup")}
              style={styles.accountHintRow}
            >
              <Text style={styles.accountHintText}>
                {isSignUp ? "Already have an account? " : "No account yet? "}
                <Text style={styles.accountHintLink}>
                  {isSignUp ? "Log in" : "Sign up"}
                </Text>
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const createStyles = (colors: typeof Colors.light) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.loginScreenBackground,
      alignItems: "center",
    },
    authCard: {
      flex: 1,
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.loginCardBackground,
      overflow: "hidden",
    },
    formScroll: {
      flex: 1,
    },
    topHeader: {
      height: 245,
      borderBottomRightRadius: 48,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 20,
    },
    logoFrame: {
      width: "80%",
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      maxWidth: "100%",
    },
    formContent: {
      alignItems: "center",
      paddingTop: 28,
      paddingHorizontal: 24,
    },
    tabSwitch: {
      width: "84%",
      borderWidth: 1,
      borderColor: colors.loginTabBorder,
      borderRadius: 100,
      overflow: "hidden",
      flexDirection: "row",
      backgroundColor: colors.loginTabBackground,
      marginBottom: 28,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 11,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 100,
    },
    activeTabButton: {
      backgroundColor: colors.loginTabActiveBackground,
    },
    tabText: {
      color: colors.loginTabText,
      fontSize: 20,
      fontWeight: "700",
    },
    activeTabText: {
      color: colors.loginTabActiveText,
    },
    flowTitle: {
      width: "76%",
      color: colors.loginInputText,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
    },
    flowText: {
      width: "76%",
      color: colors.loginHintText,
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 14,
    },
    input: {
      width: "76%",
      height: 48,
      borderWidth: 1,
      borderColor: colors.loginInputBorder,
      borderRadius: 15,
      paddingHorizontal: 14,
      marginBottom: 12,
      color: colors.loginInputText,
      backgroundColor: colors.loginInputBackground,
      fontSize: 15,
    },
    passwordInputWrapper: {
      width: "76%",
      height: 48,
      borderWidth: 1,
      borderColor: colors.loginInputBorder,
      borderRadius: 15,
      marginBottom: 12,
      paddingLeft: 14,
      paddingRight: 10,
      backgroundColor: colors.loginInputBackground,
      flexDirection: "row",
      alignItems: "center",
    },
    passwordInput: {
      flex: 1,
      height: "100%",
      color: colors.loginInputText,
      fontSize: 15,
      paddingRight: 8,
    },
    passwordIconButton: {
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    inputError: {
      borderColor: colors.loginError,
    },
    errorText: {
      width: "76%",
      color: colors.loginError,
      fontSize: 12,
      marginTop: -6,
      marginBottom: 8,
      paddingLeft: 4,
    },
    otpErrorText: {
      width: "82%",
      color: colors.loginError,
      fontSize: 12,
      textAlign: "center",
      marginTop: -4,
      marginBottom: 10,
    },
    utilityRow: {
      width: "76%",
      alignItems: "flex-end",
      marginTop: 2,
      marginBottom: 10,
    },
    forgotText: {
      color: colors.loginCheckboxFill,
      fontSize: 12,
      fontWeight: "600",
    },
    accountHintRow: {
      marginTop: 12,
    },
    accountHintText: {
      color: colors.loginHintText,
      fontSize: 12,
    },
    accountHintLink: {
      color: colors.loginCheckboxFill,
      textDecorationLine: "underline",
      fontWeight: "600",
    },
    submitButton: {
      minWidth: 180,
      minHeight: 48,
      borderRadius: 999,
      paddingVertical: 12,
      paddingHorizontal: 30,
      backgroundColor: colors.loginTabActiveBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    submitButtonDisabled: {
      opacity: 0.7,
    },
    submitButtonText: {
      color: colors.loginTabActiveText,
      fontWeight: "700",
      fontSize: 16,
      textAlign: "center",
    },
    linkRow: {
      marginTop: 12,
    },
    linkText: {
      color: colors.loginCheckboxFill,
      fontSize: 12,
      fontWeight: "600",
      textDecorationLine: "underline",
    },
    linkTextDisabled: {
      color: colors.loginHintText,
      textDecorationLine: "none",
    },
  });
