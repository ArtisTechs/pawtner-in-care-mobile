import type { ImageSourcePropType } from "react-native";

export type DonationCauseCategory = "health" | "foods" | "shelter";

export type DonationFilter = "all" | "urgent" | "health" | "foods";

export type DonationHomeSection = "urgent-fundraising" | "fund-strays";

export type DonationCauseItem = {
  id: string;
  title: string;
  description: string;
  shortLabel: string;
  category: DonationCauseCategory;
  image?: ImageSourcePropType | string;
  raisedAmount: number;
  targetAmount: number;
  isUrgent: boolean;
  featuredOnHome: boolean;
  homeSection: DonationHomeSection;
};

export type DonationPaymentMethod = {
  id: string;
  name: string;
  qrImage: string;
  accountName: string;
  accountNumber: string;
  referenceLabel: string;
};

export type DonationPaymentDraft = {
  donationId: string;
  donationTitle: string;
  donationCategory: DonationCauseCategory;
  selectedAmount: number | null;
  selectedPaymentModeId: string | null;
  qrImage: string | null;
  accountName: string | null;
  accountNumber: string | null;
  uploadedProofImageUri: string | null;
  specialMessage: string;
};
