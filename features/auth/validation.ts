import { ERROR_MESSAGES } from "@/constants/error-messages";

export type AuthMode = "login" | "signup";

export type AuthFormValues = {
  confirmPassword: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string;
  password: string;
};

export type AuthFieldKey = keyof AuthFormValues;
export type AuthFormErrors = Partial<Record<AuthFieldKey, string>>;

const PASSWORD_REQUIREMENTS =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateAuthForm = (
  mode: AuthMode,
  values: AuthFormValues,
): AuthFormErrors => {
  const errors: AuthFormErrors = {};
  const isSignUp = mode === "signup";

  if (isSignUp && !values.firstName.trim()) {
    errors.firstName = ERROR_MESSAGES.firstNameRequired;
  }

  if (isSignUp && !values.lastName.trim()) {
    errors.lastName = ERROR_MESSAGES.lastNameRequired;
  }

  if (!values.email.trim()) {
    errors.email = ERROR_MESSAGES.emailRequired;
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = ERROR_MESSAGES.emailInvalid;
  }

  if (!values.password.trim()) {
    errors.password = ERROR_MESSAGES.passwordRequired;
  } else if (isSignUp && !PASSWORD_REQUIREMENTS.test(values.password)) {
    errors.password = ERROR_MESSAGES.passwordRequirements;
  }

  if (isSignUp && !values.confirmPassword.trim()) {
    errors.confirmPassword = ERROR_MESSAGES.confirmPasswordRequired;
  } else if (
    isSignUp &&
    !errors.password &&
    values.confirmPassword !== values.password
  ) {
    errors.confirmPassword = ERROR_MESSAGES.passwordMismatch;
  }

  return errors;
};

export const validateEmail = (email: string) => {
  if (!email.trim()) {
    return ERROR_MESSAGES.emailRequired;
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return ERROR_MESSAGES.emailInvalid;
  }

  return null;
};

export const validatePasswordResetForm = (values: AuthFormValues) => {
  const errors: AuthFormErrors = {};

  if (!values.password.trim()) {
    errors.password = ERROR_MESSAGES.passwordRequired;
  } else if (!PASSWORD_REQUIREMENTS.test(values.password)) {
    errors.password = ERROR_MESSAGES.passwordRequirements;
  }

  if (!values.confirmPassword.trim()) {
    errors.confirmPassword = ERROR_MESSAGES.confirmPasswordRequired;
  } else if (!errors.password && values.confirmPassword !== values.password) {
    errors.confirmPassword = ERROR_MESSAGES.passwordMismatch;
  }

  return errors;
};
