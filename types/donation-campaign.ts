export type DonationCampaignStatus = "ONGOING" | "COMPLETED" | "CANCELLED";

export type DonationCampaignType =
  | "HEALTH"
  | "FOOD"
  | "SHELTER"
  | "RESCUE"
  | "MEDICINE"
  | "EDUCATION"
  | "OTHER";

export type DonationCampaignApiItem = {
  deadline?: string | null;
  description?: string | null;
  id: string;
  isUrgent?: boolean | null;
  photo?: string | null;
  startDate?: string | null;
  status: string;
  title: string;
  totalCost: number;
  totalDonatedCost?: number | null;
  type: string;
  updatedDate?: string | null;
};

export type DonationCampaignMutationPayload = {
  deadline?: string;
  description?: string;
  isUrgent?: boolean;
  photo?: string;
  startDate?: string;
  status: DonationCampaignStatus;
  title: string;
  totalCost: number;
  type: DonationCampaignType;
};
