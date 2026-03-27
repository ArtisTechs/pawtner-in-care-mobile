import AsyncStorage from "@react-native-async-storage/async-storage";

const DONATION_INTRO_SEEN_KEY_PREFIX = "@pawtner/donations/intro-seen";

const getDonationIntroSeenKey = (userId: string) =>
  `${DONATION_INTRO_SEEN_KEY_PREFIX}/${userId}`;

export const donationStorage = {
  async hasSeenDonationIntro(userId: string) {
    const seenFlag = await AsyncStorage.getItem(getDonationIntroSeenKey(userId));
    return seenFlag === "1";
  },
  markDonationIntroSeen: (userId: string) =>
    AsyncStorage.setItem(getDonationIntroSeenKey(userId), "1"),
};
