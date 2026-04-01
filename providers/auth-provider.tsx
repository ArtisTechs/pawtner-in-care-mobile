import React, { createContext, useEffect, useState } from "react";

import { authService } from "@/services/auth/auth.service";
import { authStorage } from "@/services/auth/auth.storage";
import { donationStorage } from "@/services/donations/donation.storage";
import { sessionPreloadService } from "@/services/preload/session-preload.service";
import { userStorage } from "@/services/user/user.storage";
import type {
  AuthContextValue,
  AuthSession,
  ConfirmOtpPayload,
  LoginPayload,
  ResetPasswordPayload,
  SendOtpPayload,
  SignUpPayload,
} from "@/types/auth";

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const hydrateSession = async () => {
      try {
        const storedSession = await authStorage.getSession();
        const hydratedSession = storedSession
          ? await sessionPreloadService.preloadSessionData(storedSession)
          : null;

        if (isMounted) {
          setSession(hydratedSession);
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = async (payload: LoginPayload) => {
    const loginSession = await authService.login(payload);
    const normalizedToken = loginSession.accessToken?.trim() ?? "";
    const tokenPreview = normalizedToken
      ? `${normalizedToken.slice(0, 12)}...`
      : "";

    console.log("[auth] Sign-in successful. Saving session to storage...", {
      accessTokenPreview: tokenPreview,
      hasAccessToken: Boolean(normalizedToken),
      tokenType: loginSession.tokenType,
      userId: loginSession.user?.id,
    });

    const nextSession =
      await sessionPreloadService.preloadSessionData(loginSession);
    setSession(nextSession);
    return nextSession;
  };

  const signUp = async (payload: SignUpPayload) => {
    await authService.signUp(payload);
  };

  const signOut = async () => {
    const userId = session?.user.id;
    setSession(null);
    await sessionPreloadService.clearSessionCache(userId);

    try {
      await donationStorage.clearAllDonationIntroSeen();
    } catch {
      // Keep sign-out non-blocking even if optional cleanup fails.
    }
  };

  const sendOtp = async (payload: SendOtpPayload) => {
    return authService.sendOtp(payload);
  };

  const confirmOtp = async (payload: ConfirmOtpPayload) => {
    await authService.confirmOtp(payload);
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    await authService.resetPassword(payload);
  };

  const updateSessionUser = async (nextUser: AuthSession["user"]) => {
    if (!session) {
      return;
    }

    const nextSession: AuthSession = {
      ...session,
      user: nextUser,
    };

    setSession(nextSession);
    await authStorage.setSession(nextSession);
    await userStorage.setUserProfile(nextUser);
  };

  return (
    <AuthContext.Provider
      value={{
        confirmOtp,
        isAuthenticated: Boolean(session?.accessToken),
        isHydrating,
        resetPassword,
        sendOtp,
        session,
        signIn,
        signOut,
        signUp,
        updateSessionUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
