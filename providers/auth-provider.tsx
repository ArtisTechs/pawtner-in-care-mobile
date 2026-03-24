import React, { createContext, useEffect, useState } from "react";

import { authService } from "@/services/auth/auth.service";
import { authStorage } from "@/services/auth/auth.storage";
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

        if (isMounted) {
          setSession(storedSession);
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
    const nextSession = await authService.login(payload);
    setSession(nextSession);
    await authStorage.setSession(nextSession);
    return nextSession;
  };

  const signUp = async (payload: SignUpPayload) => {
    await authService.signUp(payload);
  };

  const signOut = async () => {
    setSession(null);
    await authStorage.clearSession();
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
