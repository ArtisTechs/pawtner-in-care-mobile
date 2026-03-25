const AUTH_BASE_PATH = "/auth";
const USERS_BASE_PATH = "/users";

export const API_ENDPOINTS = {
  auth: {
    base: AUTH_BASE_PATH,
    confirmOtp: `${AUTH_BASE_PATH}/confirm-otp`,
    login: `${AUTH_BASE_PATH}/login`,
    resetPassword: `${AUTH_BASE_PATH}/reset-password`,
    sendOtp: `${AUTH_BASE_PATH}/send-otp`,
    signUp: `${AUTH_BASE_PATH}/signup`,
  },
  users: {
    base: USERS_BASE_PATH,
    byId: (id: string) => `${USERS_BASE_PATH}/${encodeURIComponent(id)}`,
  },
} as const;
