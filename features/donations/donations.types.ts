import type { ImageSourcePropType } from "react-native";
import type {
  DonationCampaignStatus,
  DonationCampaignType,
} from "@/types/donation-campaign";

export type DonationFilter =
  | "all"
  | "urgent"
  | "ongoing"
  | "completed"
  | "cancelled"
  | "health"
  | "food"
  | "shelter"
  | "rescue"
  | "medicine"
  | "education"
  | "other";

export type DonationCauseItem = {
  deadline?: string;
  description: string;
  id: string;
  image?: ImageSourcePropType | string;
  isUrgent: boolean;
  startDate?: string;
  status: DonationCampaignStatus;
  title: string;
  totalCost: number;
  totalDonatedCost: number;
  type: DonationCampaignType;
  updatedDate?: string;
};

export type DonationFilterOption = {
  key: DonationFilter;
  label: string;
};

export type DonationPaymentMethod = {
  accountName: string;
  accountNumber: string;
  id: string;
  name: string;
  qrImage: string;
  referenceLabel: string;
};

export type DonationPaymentDraft = {
  donationId: string;
  donationTitle: string;
  donationType: DonationCampaignType;
  selectedAmount: number | null;
  selectedPaymentModeId: string | null;
  qrImage: string | null;
  accountName: string | null;
  accountNumber: string | null;
  uploadedProofImageUri: string | null;
  specialMessage: string;
};
