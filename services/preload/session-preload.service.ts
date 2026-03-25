import { authStorage } from "@/services/auth/auth.storage";
import { userService } from "@/services/user/user.service";
import { userStorage } from "@/services/user/user.storage";
import type { AuthSession } from "@/types/auth";

const persistSessionSnapshot = async (session: AuthSession) => {
  await authStorage.setSession(session);
  await userStorage.setUserProfile(session.user);
};

export const sessionPreloadService = {
  async clearSessionCache(userId?: string) {
    await authStorage.clearSession();

    if (userId) {
      await userStorage.clearUserProfile(userId);
    }
  },

  async preloadSessionData(session: AuthSession) {
    await persistSessionSnapshot(session);

    const userId = session.user?.id;
    const accessToken = session.accessToken;

    if (!userId || !accessToken) {
      return session;
    }

    try {
      const latestUserProfile = await userService.getUserById({
        token: accessToken,
        userId,
      });

      const nextSession: AuthSession = {
        ...session,
        user: latestUserProfile,
      };

      await persistSessionSnapshot(nextSession);
      return nextSession;
    } catch {
      const cachedUserProfile = await userStorage.getUserProfile(userId);

      if (!cachedUserProfile) {
        return session;
      }

      const fallbackSession: AuthSession = {
        ...session,
        user: cachedUserProfile,
      };

      await authStorage.setSession(fallbackSession);
      return fallbackSession;
    }
  },
};
