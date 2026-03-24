import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AuthSession } from "@/types/auth";

const AUTH_SESSION_STORAGE_KEY = "@pawtner/auth/session";

export const authStorage = {
  clearSession: () => AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY),
  async getSession() {
    const rawValue = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AuthSession;
    } catch {
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
  },
  setSession: (session: AuthSession) =>
    AsyncStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session)),
};
