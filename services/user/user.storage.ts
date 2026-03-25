import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserProfile } from "@/types/user";

const USER_PROFILE_STORAGE_KEY_PREFIX = "@pawtner/users/profile";

const getUserProfileKey = (userId: string) =>
  `${USER_PROFILE_STORAGE_KEY_PREFIX}/${userId}`;

export const userStorage = {
  clearUserProfile: (userId: string) =>
    AsyncStorage.removeItem(getUserProfileKey(userId)),

  async getUserProfile(userId: string) {
    const rawValue = await AsyncStorage.getItem(getUserProfileKey(userId));

    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as UserProfile;
    } catch {
      await AsyncStorage.removeItem(getUserProfileKey(userId));
      return null;
    }
  },

  setUserProfile: (profile: UserProfile) =>
    AsyncStorage.setItem(
      getUserProfileKey(profile.id),
      JSON.stringify(profile),
    ),
};
