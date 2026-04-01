import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AuthSession } from "@/types/auth";

const AUTH_SESSION_STORAGE_KEY = "@pawtner/auth/session";
const GET_STARTED_SEEN_KEY_PREFIX = "@pawtner/auth/get-started-seen";

const getGetStartedSeenKey = (userId: string) =>
  `${GET_STARTED_SEEN_KEY_PREFIX}/${userId}`;

const normalizeAccessToken = (token?: string) =>
  token?.replace(/^Bearer\s+/i, "").trim() ?? "";

const normalizeSession = (session: AuthSession): AuthSession => {
  const normalizedToken = normalizeAccessToken(session.accessToken);

  return {
    ...session,
    accessToken: normalizedToken,
    tokenType: session.tokenType?.trim() || "Bearer",
  };
};

export const authStorage = {
  clearSession: () => AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY),
  async hasSeenGetStarted(userId: string) {
    const seenFlag = await AsyncStorage.getItem(getGetStartedSeenKey(userId));
    return seenFlag === "1";
  },
  async getSession() {
    const rawValue = await AsyncStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    try {
      const parsedSession = JSON.parse(rawValue) as AuthSession;
      const normalizedSession = normalizeSession(parsedSession);

      if (normalizedSession.accessToken !== parsedSession.accessToken) {
        void AsyncStorage.setItem(
          AUTH_SESSION_STORAGE_KEY,
          JSON.stringify(normalizedSession),
        );
      }

      return normalizedSession;
    } catch {
      await AsyncStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
      return null;
    }
  },
  markGetStartedSeen: (userId: string) =>
    AsyncStorage.setItem(getGetStartedSeenKey(userId), "1"),
  setSession: (session: AuthSession) =>
    AsyncStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify(normalizeSession(session)),
    ),
};
