import type { UserProfile } from "@/types/user";

export type OtpPurpose = "login" | "reset-password" | "signup";

export type AuthUser = UserProfile;

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

export type LoginPayload = {
  email: string;
  password: string;
};

export type SignUpPayload = {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  password: string;
};

export type SendOtpPayload = {
  email: string;
  purpose: OtpPurpose;
};

export type ConfirmOtpPayload = {
  email: string;
  otp: string;
  purpose: OtpPurpose;
};

export type ResetPasswordPayload = {
  confirmPassword: string;
  email: string;
  newPassword: string;
  otp: string;
};

export type ApiMessageResponse = {
  email?: string;
  message?: string;
};

export type SendOtpResponse = ApiMessageResponse & {
  cooldownSeconds?: number;
  resendAfterSeconds?: number;
  resendInSeconds?: number;
  retryAfter?: number;
  retryAfterSeconds?: number;
};

export interface AuthContextValue {
  confirmOtp: (payload: ConfirmOtpPayload) => Promise<void>;
  isAuthenticated: boolean;
  isHydrating: boolean;
  resetPassword: (payload: ResetPasswordPayload) => Promise<void>;
  sendOtp: (payload: SendOtpPayload) => Promise<SendOtpResponse | null>;
  session: AuthSession | null;
  signIn: (payload: LoginPayload) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  signUp: (payload: SignUpPayload) => Promise<void>;
  updateSessionUser: (user: AuthUser) => Promise<void>;
}
