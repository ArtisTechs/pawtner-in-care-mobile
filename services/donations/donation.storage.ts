import AsyncStorage from "@react-native-async-storage/async-storage";

const DONATION_INTRO_SEEN_KEY_PREFIX = "@pawtner/donations/intro-seen";

const getDonationIntroSeenKey = (userId: string) =>
  `${DONATION_INTRO_SEEN_KEY_PREFIX}/${userId}`;

export const donationStorage = {
  async clearAllDonationIntroSeen() {
    const allKeys = await AsyncStorage.getAllKeys();
    const donationIntroKeys = allKeys.filter((key) =>
      key.startsWith(`${DONATION_INTRO_SEEN_KEY_PREFIX}/`),
    );

    if (donationIntroKeys.length > 0) {
      await AsyncStorage.multiRemove(donationIntroKeys);
    }
  },
  clearDonationIntroSeen: (userId: string) =>
    AsyncStorage.removeItem(getDonationIntroSeenKey(userId)),
  async hasSeenDonationIntro(userId: string) {
    const seenFlag = await AsyncStorage.getItem(getDonationIntroSeenKey(userId));
    return seenFlag === "1";
  },
  markDonationIntroSeen: (userId: string) =>
    AsyncStorage.setItem(getDonationIntroSeenKey(userId), "1"),
};
