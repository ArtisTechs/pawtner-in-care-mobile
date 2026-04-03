import { apiClient } from "@/services/api/api-client";
import { API_ENDPOINTS } from "@/services/api/api-endpoints";
import { ApiError } from "@/services/api/api-error";
import type {
  PaymentModeApiItem,
  PaymentModeMutationPayload,
} from "@/types/payment-mode";

type PaymentModeAuthParams = {
  token: string;
};

type PaymentModeByIdParams = PaymentModeAuthParams & {
  paymentModeId: string;
};

type CreatePaymentModeParams = PaymentModeAuthParams & {
  payload: PaymentModeMutationPayload;
};

type UpdatePaymentModeParams = PaymentModeByIdParams & {
  payload: PaymentModeMutationPayload;
};

const isPaymentModeApiItem = (value: unknown): value is PaymentModeApiItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.name === "string";
};

const extractPaymentModeArray = (payload: unknown): PaymentModeApiItem[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isPaymentModeApiItem);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.content,
      record.data,
      record.result,
      record.results,
      record.items,
      record.paymentModes,
      record.paymentModeList,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.filter(isPaymentModeApiItem);
      }
    }
  }

  return [];
};

const extractPaymentModeItem = (payload: unknown): PaymentModeApiItem => {
  if (isPaymentModeApiItem(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.data,
      record.result,
      record.item,
      record.paymentMode,
    ];

    for (const candidate of candidates) {
      if (isPaymentModeApiItem(candidate)) {
        return candidate;
      }
    }
  }

  throw new Error("Unexpected response from payment modes endpoint.");
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
      record.paymentModes,
      record.paymentModeList,
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

export const paymentModeService = {
  async createPaymentMode({ payload, token }: CreatePaymentModeParams) {
    const result = await apiClient.post<unknown, PaymentModeMutationPayload>(
      API_ENDPOINTS.paymentModes.base,
      payload,
      { token },
    );

    return extractPaymentModeItem(result);
  },
  async deletePaymentMode({ paymentModeId, token }: PaymentModeByIdParams) {
    await apiClient.delete<unknown>(API_ENDPOINTS.paymentModes.byId(paymentModeId), {
      token,
    });
  },
  async getPaymentModeById({ paymentModeId, token }: PaymentModeByIdParams) {
    const payload = await apiClient.get<unknown>(
      API_ENDPOINTS.paymentModes.byId(paymentModeId),
      { token },
    );

    return extractPaymentModeItem(payload);
  },
  async getPaymentModes({ token }: PaymentModeAuthParams) {
    try {
      const payload = await apiClient.get<unknown>(API_ENDPOINTS.paymentModes.base, {
        token,
      });

      return extractPaymentModeArray(payload);
    } catch (error) {
      if (isNoDataApiError(error)) {
        return [];
      }

      throw error;
    }
  },
  async updatePaymentMode({
    paymentModeId,
    payload,
    token,
  }: UpdatePaymentModeParams) {
    const result = await apiClient.put<unknown, PaymentModeMutationPayload>(
      API_ENDPOINTS.paymentModes.byId(paymentModeId),
      payload,
      { token },
    );

    return extractPaymentModeItem(result);
  },
};
