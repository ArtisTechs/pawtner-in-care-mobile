import { donationCampaignService } from "@/services/donations/donation-campaign.service";
import type {
  DonationCampaignApiItem,
  DonationCampaignStatus,
  DonationCampaignType,
} from "@/types/donation-campaign";

import type {
  DonationCauseItem,
  DonationFilter,
  DonationFilterOption,
  DonationPaymentMethod,
} from "@/features/donations/donations.types";

const DONATION_TYPE_RECORD: Record<string, DonationCampaignType> = {
  EDUCATION: "EDUCATION",
  FOOD: "FOOD",
  HEALTH: "HEALTH",
  MEDICINE: "MEDICINE",
  OTHER: "OTHER",
  RESCUE: "RESCUE",
  SHELTER: "SHELTER",
};

const DONATION_STATUS_RECORD: Record<string, DonationCampaignStatus> = {
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
  ONGOING: "ONGOING",
};

const STRAY_FOCUS_TYPES = new Set<DonationCampaignType>([
  "FOOD",
  "SHELTER",
  "RESCUE",
  "MEDICINE",
]);

const DONATION_FILTER_SET: Set<DonationFilter> = new Set([
  "all",
  "urgent",
  "ongoing",
  "completed",
  "cancelled",
  "health",
  "food",
  "shelter",
  "rescue",
  "medicine",
  "education",
  "other",
]);

export const DONATION_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
  defaultCauseImage: require("../../assets/images/dog.png"),
  donateIcon: require("../../assets/images/donate-icon.png"),
  frontPageIcon: require("../../assets/images/donate-front-page-icon.png"),
  profileAvatar: require("../../assets/images/cat.png"),
} as const;

export const DONATION_FILTER_OPTIONS: DonationFilterOption[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "ongoing", label: "Ongoing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "health", label: "Health" },
  { key: "food", label: "Food" },
  { key: "shelter", label: "Shelter" },
  { key: "rescue", label: "Rescue" },
  { key: "medicine", label: "Medicine" },
  { key: "education", label: "Education" },
  { key: "other", label: "Other" },
];

export const DONATION_PAYMENT_METHODS: DonationPaymentMethod[] = [
  {
    accountName: "RE***LD *AR*LA",
    accountNumber: "09338240358",
    id: "gcash-1",
    name: "Gcash 1",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=GCASH_1_09338240358",
    referenceLabel: "**********",
  },
  {
    accountName: "RE***LD *AR*LA",
    accountNumber: "09338240359",
    id: "gcash-2",
    name: "Gcash 2",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=GCASH_2_09338240359",
    referenceLabel: "**********",
  },
  {
    accountName: "NOAHS ARK SHELTER",
    accountNumber: "0123345599",
    id: "metrobank",
    name: "Metrobank",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=METROBANK_0123345599",
    referenceLabel: "**********",
  },
  {
    accountName: "NOAHS ARK SHELTER",
    accountNumber: "09451236789",
    id: "gotyme",
    name: "Gotyme",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=GOTYME_09451236789",
    referenceLabel: "**********",
  },
  {
    accountName: "NOAHS ARK SHELTER",
    accountNumber: "00126889973",
    id: "bpi",
    name: "BPI",
    qrImage:
      "https://api.qrserver.com/v1/create-qr-code/?size=560x560&data=BPI_00126889973",
    referenceLabel: "**********",
  },
];

const normalizeOptionalText = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const toFiniteNonNegativeNumber = (value: unknown) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
};

const normalizeCampaignStatus = (status: string): DonationCampaignStatus =>
  DONATION_STATUS_RECORD[status.trim().toUpperCase()] ?? "ONGOING";

const normalizeCampaignType = (type: string): DonationCampaignType =>
  DONATION_TYPE_RECORD[type.trim().toUpperCase()] ?? "OTHER";

const toTimeValue = (value?: string) => {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const mapCampaignToCause = (
  campaign: DonationCampaignApiItem,
): DonationCauseItem => ({
  deadline: normalizeOptionalText(campaign.deadline),
  description: normalizeOptionalText(campaign.description) ?? "",
  id: campaign.id,
  image: normalizeOptionalText(campaign.photo),
  isUrgent: Boolean(campaign.isUrgent),
  startDate: normalizeOptionalText(campaign.startDate),
  status: normalizeCampaignStatus(campaign.status),
  title: normalizeOptionalText(campaign.title) ?? "Untitled campaign",
  totalCost: toFiniteNonNegativeNumber(campaign.totalCost),
  totalDonatedCost: toFiniteNonNegativeNumber(campaign.totalDonatedCost),
  type: normalizeCampaignType(campaign.type),
  updatedDate: normalizeOptionalText(campaign.updatedDate),
});

const sortDonationCauses = (donationCauses: DonationCauseItem[]) =>
  [...donationCauses].sort((left, right) => {
    const urgencyDelta = Number(right.isUrgent) - Number(left.isUrgent);

    if (urgencyDelta !== 0) {
      return urgencyDelta;
    }

    return toTimeValue(right.updatedDate) - toTimeValue(left.updatedDate);
  });

const formatUpperSnakeCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");

const DONATABLE_CAMPAIGN_STATUSES = new Set<DonationCampaignStatus>(["ONGOING"]);

export const formatDonationCampaignType = (type: DonationCampaignType) =>
  formatUpperSnakeCase(type);

export const formatDonationCampaignStatus = (status: DonationCampaignStatus) =>
  formatUpperSnakeCase(status);

export const formatDonationCampaignDate = (value?: string) => {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return null;
  }

  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalized;
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDonationAmount = (amount: number) =>
  `\u20b1 ${amount.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;

export const getDonationProgress = (donationCause: DonationCauseItem) => {
  if (donationCause.totalCost <= 0) {
    return 0;
  }

  return donationCause.totalDonatedCost / donationCause.totalCost;
};

export const isDonationCampaignDonatable = (donationCause: DonationCauseItem) =>
  DONATABLE_CAMPAIGN_STATUSES.has(donationCause.status);

export const fetchDonationCauses = async (token: string) => {
  const campaigns = await donationCampaignService.getCampaigns({ token });
  return sortDonationCauses(campaigns.map(mapCampaignToCause));
};

export const fetchDonationCauseById = async (
  donationId: string,
  token: string,
) => {
  const campaign = await donationCampaignService.getCampaignById({
    campaignId: donationId,
    token,
  });

  return mapCampaignToCause(campaign);
};

export const getDonationPaymentMethods = () => DONATION_PAYMENT_METHODS;

export const isDonationFilter = (value: string): value is DonationFilter =>
  DONATION_FILTER_SET.has(value as DonationFilter);

export const resolveDonationFilter = (
  value: string | string[] | undefined,
): DonationFilter | null => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;

  if (!normalizedValue) {
    return null;
  }

  return isDonationFilter(normalizedValue) ? normalizedValue : null;
};

export const filterDonationCauses = (
  donationCauses: DonationCauseItem[],
  filter: DonationFilter,
) => {
  return donationCauses.filter((cause) => {
    if (filter === "all") {
      return true;
    }

    if (filter === "urgent") {
      return cause.isUrgent;
    }

    if (filter === "ongoing") {
      return cause.status === "ONGOING";
    }

    if (filter === "completed") {
      return cause.status === "COMPLETED";
    }

    if (filter === "cancelled") {
      return cause.status === "CANCELLED";
    }

    return cause.type.toLowerCase() === filter;
  });
};

export const selectUrgentFundraisingCauses = (
  donationCauses: DonationCauseItem[],
) =>
  donationCauses.filter(
    (cause) => cause.status === "ONGOING" && cause.isUrgent,
  );

export const selectFundStraysCauses = (donationCauses: DonationCauseItem[]) => {
  const ongoingCampaigns = donationCauses.filter(
    (cause) => cause.status === "ONGOING",
  );
  const strayFocusedCampaigns = ongoingCampaigns.filter((cause) =>
    STRAY_FOCUS_TYPES.has(cause.type),
  );

  if (strayFocusedCampaigns.length > 0) {
    return strayFocusedCampaigns;
  }

  return ongoingCampaigns.filter((cause) => !cause.isUrgent);
};
