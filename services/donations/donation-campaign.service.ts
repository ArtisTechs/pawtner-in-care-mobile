import { apiClient } from "@/services/api/api-client";
import { API_ENDPOINTS } from "@/services/api/api-endpoints";
import { ApiError } from "@/services/api/api-error";
import type {
  DonationCampaignApiItem,
  DonationCampaignMutationPayload,
  DonationCampaignType,
} from "@/types/donation-campaign";

type DonationCampaignAuthParams = {
  token: string;
};

type DonationCampaignByIdParams = DonationCampaignAuthParams & {
  campaignId: string;
};

type CreateDonationCampaignParams = DonationCampaignAuthParams & {
  payload: DonationCampaignMutationPayload;
};

type UpdateDonationCampaignParams = DonationCampaignByIdParams & {
  payload: DonationCampaignMutationPayload;
};

const DONATION_CAMPAIGN_TYPES = new Set<DonationCampaignType>([
  "HEALTH",
  "FOOD",
  "SHELTER",
  "RESCUE",
  "MEDICINE",
  "EDUCATION",
  "OTHER",
]);

const isDonationCampaignApiItem = (value: unknown): value is DonationCampaignApiItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    typeof record.totalCost === "number" &&
    typeof record.status === "string" &&
    typeof record.type === "string"
  );
};

const extractDonationCampaignArray = (payload: unknown): DonationCampaignApiItem[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isDonationCampaignApiItem);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.content,
      record.data,
      record.result,
      record.results,
      record.items,
      record.campaigns,
      record.donationCampaigns,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.filter(isDonationCampaignApiItem);
      }
    }
  }

  return [];
};

const extractDonationCampaignItem = (payload: unknown): DonationCampaignApiItem => {
  if (isDonationCampaignApiItem(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.data,
      record.result,
      record.item,
      record.campaign,
      record.donationCampaign,
    ];

    for (const candidate of candidates) {
      if (isDonationCampaignApiItem(candidate)) {
        return candidate;
      }
    }
  }

  throw new Error("Unexpected response from donation campaigns endpoint.");
};

const extractDonationCampaignTypes = (payload: unknown): DonationCampaignType[] => {
  const toTypeList = (candidate: unknown): DonationCampaignType[] | null => {
    if (!Array.isArray(candidate)) {
      return null;
    }

    const normalized = candidate
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim().toUpperCase())
      .filter((value): value is DonationCampaignType =>
        DONATION_CAMPAIGN_TYPES.has(value as DonationCampaignType),
      );

    return normalized;
  };

  const directList = toTypeList(payload);

  if (directList) {
    return directList;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.result, record.items, record.types];

    for (const candidate of candidates) {
      const nestedList = toTypeList(candidate);

      if (nestedList) {
        return nestedList;
      }
    }
  }

  return [];
};

const isEmptyCollectionPayload = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return payload.length === 0;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const collectionCandidates = [
      record.content,
      record.data,
      record.result,
      record.results,
      record.items,
      record.campaigns,
      record.donationCampaigns,
    ];

    return collectionCandidates.some(
      (candidate) => Array.isArray(candidate) && candidate.length === 0,
    );
  }

  return false;
};

const isNoDataApiError = (error: unknown) =>
  error instanceof ApiError &&
  (error.status === 404 || isEmptyCollectionPayload(error.details));

export const donationCampaignService = {
  async createCampaign({ payload, token }: CreateDonationCampaignParams) {
    const result = await apiClient.post<unknown, DonationCampaignMutationPayload>(
      API_ENDPOINTS.donationCampaigns.base,
      payload,
      { token },
    );

    return extractDonationCampaignItem(result);
  },
  async deleteCampaign({ campaignId, token }: DonationCampaignByIdParams) {
    await apiClient.delete<unknown>(API_ENDPOINTS.donationCampaigns.byId(campaignId), {
      token,
    });
  },
  async getCampaignById({ campaignId, token }: DonationCampaignByIdParams) {
    const payload = await apiClient.get<unknown>(
      API_ENDPOINTS.donationCampaigns.byId(campaignId),
      {
        token,
      },
    );

    return extractDonationCampaignItem(payload);
  },
  async getCampaignTypes({ token }: DonationCampaignAuthParams) {
    try {
      const payload = await apiClient.get<unknown>(API_ENDPOINTS.donationCampaigns.types, {
        token,
      });

      return extractDonationCampaignTypes(payload);
    } catch (error) {
      if (isNoDataApiError(error)) {
        return [];
      }

      throw error;
    }
  },
  async getCampaigns({ token }: DonationCampaignAuthParams) {
    try {
      const payload = await apiClient.get<unknown>(API_ENDPOINTS.donationCampaigns.base, {
        token,
      });

      return extractDonationCampaignArray(payload);
    } catch (error) {
      if (isNoDataApiError(error)) {
        return [];
      }

      throw error;
    }
  },
  async updateCampaign({
    campaignId,
    payload,
    token,
  }: UpdateDonationCampaignParams) {
    const result = await apiClient.put<unknown, DonationCampaignMutationPayload>(
      API_ENDPOINTS.donationCampaigns.byId(campaignId),
      payload,
      { token },
    );

    return extractDonationCampaignItem(result);
  },
};
