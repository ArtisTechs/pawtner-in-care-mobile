import { apiClient } from "@/services/api/api-client";
import { API_ENDPOINTS } from "@/services/api/api-endpoints";
import { ApiError } from "@/services/api/api-error";
import type {
  AdoptionRequestApiItem,
  CreatePetParams,
  CreateAdoptionRequestParams,
  CreateAdoptionRequestPayload,
  DeletePetParams,
  FavoriteMutationResponse,
  GetPetByIdParams,
  GetPetsParams,
  GetUserAdoptionRequestsParams,
  GetUserFavoritePetsParams,
  PetApiItem,
  PetFavoriteParams,
  PetListResponse,
  PetMutationPayload,
  PetPagination,
  UpdatePetParams,
  UpdateAdoptionRequestStatusParams,
  UpdateAdoptionRequestStatusPayload,
} from "@/types/pet";

const FAVORITE_USER_ID_HEADER = "X-User-Id";
const ADOPTION_USER_ID_HEADER = "X-User-Id";

const isPetApiItem = (value: unknown): value is PetApiItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.id === "string";
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
};

const toBoolean = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;

const extractPetArray = (payload: unknown): PetApiItem[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isPetApiItem);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.content,
      record.data,
      record.result,
      record.results,
      record.items,
      record.pets,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.filter(isPetApiItem);
      }
    }
  }

  return [];
};

const normalizePagination = (
  payload: unknown,
  itemCount: number,
  fallbackPage = 0,
  fallbackSize = 0,
): PetPagination => {
  const safeFallbackPage = Math.max(0, Math.floor(fallbackPage));
  const safeFallbackSize = Math.max(0, Math.floor(fallbackSize));
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;

  const page = Math.max(
    0,
    Math.floor(toFiniteNumber(record?.page) ?? safeFallbackPage),
  );
  const sizeSource = toFiniteNumber(record?.size);
  const resolvedSize = Math.max(
    0,
    Math.floor(sizeSource ?? (safeFallbackSize > 0 ? safeFallbackSize : itemCount)),
  );
  const totalElements = Math.max(
    0,
    Math.floor(toFiniteNumber(record?.totalElements) ?? itemCount),
  );
  const computedTotalPages =
    resolvedSize > 0 ? Math.ceil(totalElements / resolvedSize) : totalElements > 0 ? 1 : 0;
  const totalPages = Math.max(
    0,
    Math.floor(toFiniteNumber(record?.totalPages) ?? computedTotalPages),
  );
  const first = toBoolean(record?.first) ?? page <= 0;
  const last = toBoolean(record?.last) ?? (totalPages <= 1 || page >= totalPages - 1);

  return {
    first,
    ignorePagination: toBoolean(record?.ignorePagination) ?? false,
    last,
    page,
    size: resolvedSize,
    sortBy: typeof record?.sortBy === "string" ? record.sortBy : undefined,
    sortDirection:
      typeof record?.sortDirection === "string" ? record.sortDirection : undefined,
    totalElements,
    totalPages,
  };
};

const extractPetCollection = (
  payload: unknown,
  fallbackPage = 0,
  fallbackSize = 0,
): PetListResponse => {
  const items = extractPetArray(payload);
  const pagination = normalizePagination(payload, items.length, fallbackPage, fallbackSize);

  return {
    items,
    pagination,
  };
};

const extractPetItem = (payload: unknown): PetApiItem => {
  if (isPetApiItem(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.result, record.pet];

    for (const candidate of candidates) {
      if (isPetApiItem(candidate)) {
        return candidate;
      }
    }
  }

  throw new Error("Unexpected response from pets endpoint.");
};

const extractFavorited = (payload: unknown, fallback: boolean) => {
  if (!payload || typeof payload !== "object") {
    return fallback;
  }

  const record = payload as FavoriteMutationResponse;
  return typeof record.favorited === "boolean" ? record.favorited : fallback;
};

const isAdoptionRequestApiItem = (
  value: unknown,
): value is AdoptionRequestApiItem => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.id === "string";
};

const extractAdoptionRequestItem = (payload: unknown): AdoptionRequestApiItem => {
  if (isAdoptionRequestApiItem(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.result, record.adoptionRequest];

    for (const candidate of candidates) {
      if (isAdoptionRequestApiItem(candidate)) {
        return candidate;
      }
    }
  }

  throw new Error("Unexpected response from adoption requests endpoint.");
};

const extractAdoptionRequestArray = (payload: unknown): AdoptionRequestApiItem[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isAdoptionRequestApiItem);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.content,
      record.data,
      record.result,
      record.results,
      record.items,
      record.adoptionRequests,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate.filter(isAdoptionRequestApiItem);
      }
    }
  }

  return [];
};

const logPetEndpointResponse = (label: string, payload: unknown) => {
  console.log(`[petService] ${label} response:`, payload);
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
      record.pets,
      record.adoptionRequests,
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

const normalizePageParam = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(0, Math.floor(value));
};

const normalizeSizeParam = (value?: number) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return Math.max(1, Math.floor(value));
};

const buildPetsPath = ({
  ignorePagination,
  page,
  size,
  sortBy,
  sortDirection,
}: Omit<GetPetsParams, "token"> = {}) => {
  const params = new URLSearchParams();
  const normalizedPage = normalizePageParam(page);
  const normalizedSize = normalizeSizeParam(size);

  if (normalizedPage !== undefined) {
    params.set("page", String(normalizedPage));
  }

  if (normalizedSize !== undefined) {
    params.set("size", String(normalizedSize));
  }

  if (sortBy?.trim()) {
    params.set("sortBy", sortBy.trim());
  }

  if (sortDirection) {
    params.set("sortDirection", sortDirection);
  }

  if (typeof ignorePagination === "boolean") {
    params.set("ignorePagination", String(ignorePagination));
  }

  const query = params.toString();
  return query ? `${API_ENDPOINTS.pets.base}?${query}` : API_ENDPOINTS.pets.base;
};

export const petService = {
  async addFavorite({ petId, token, userId }: PetFavoriteParams) {
    const payload = await apiClient.post<unknown, undefined>(
      API_ENDPOINTS.pets.favorites(petId),
      undefined,
      {
        headers: {
          [FAVORITE_USER_ID_HEADER]: userId,
        },
        token,
      },
    );
    logPetEndpointResponse(`POST ${API_ENDPOINTS.pets.favorites(petId)}`, payload);

    return extractFavorited(payload, true);
  },
  async createPet({ payload, token }: CreatePetParams) {
    const result = await apiClient.post<unknown, PetMutationPayload>(
      API_ENDPOINTS.pets.base,
      payload,
      { token },
    );
    logPetEndpointResponse(`POST ${API_ENDPOINTS.pets.base}`, result);

    return extractPetItem(result);
  },
  async createAdoptionRequest({
    message,
    petId,
    token,
    userId,
  }: CreateAdoptionRequestParams) {
    const trimmedMessage = message?.trim();
    const payload: CreateAdoptionRequestPayload = trimmedMessage
      ? { message: trimmedMessage }
      : {};
    const result = await apiClient.post<unknown, CreateAdoptionRequestPayload>(
      API_ENDPOINTS.pets.adoptionRequests(petId),
      payload,
      {
        headers: {
          [ADOPTION_USER_ID_HEADER]: userId,
        },
        token,
      },
    );
    logPetEndpointResponse(
      `POST ${API_ENDPOINTS.pets.adoptionRequests(petId)}`,
      result,
    );

    return extractAdoptionRequestItem(result);
  },
  async deletePet({ petId, token }: DeletePetParams) {
    const result = await apiClient.delete<unknown>(API_ENDPOINTS.pets.byId(petId), {
      token,
    });
    logPetEndpointResponse(`DELETE ${API_ENDPOINTS.pets.byId(petId)}`, result);
  },
  async getPetById({ petId, token }: GetPetByIdParams) {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.pets.byId(petId), {
      token,
    });
    logPetEndpointResponse(`GET ${API_ENDPOINTS.pets.byId(petId)}`, payload);

    return extractPetItem(payload);
  },
  async getPets({ ignorePagination, page, size, sortBy, sortDirection, token }: GetPetsParams) {
    const petListingPath = buildPetsPath({
      ignorePagination,
      page,
      size,
      sortBy,
      sortDirection,
    });

    try {
      const payload = await apiClient.get<unknown>(petListingPath, { token });
      logPetEndpointResponse(`GET ${petListingPath}`, payload);

      return extractPetCollection(payload, page ?? 0, size ?? 0);
    } catch (error) {
      if (isNoDataApiError(error)) {
        const emptyResponse = extractPetCollection([], page ?? 0, size ?? 0);
        logPetEndpointResponse(`GET ${petListingPath}`, emptyResponse);
        return emptyResponse;
      }

      throw error;
    }
  },
  async getUserFavoritePets({ token, userId }: GetUserFavoritePetsParams) {
    try {
      const payload = await apiClient.get<unknown>(
        API_ENDPOINTS.users.favoritePets(userId),
        {
          token,
        },
      );
      logPetEndpointResponse(
        `GET ${API_ENDPOINTS.users.favoritePets(userId)}`,
        payload,
      );

      return extractPetArray(payload);
    } catch (error) {
      if (isNoDataApiError(error)) {
        logPetEndpointResponse(
          `GET ${API_ENDPOINTS.users.favoritePets(userId)}`,
          [],
        );
        return [];
      }

      throw error;
    }
  },
  async getUserAdoptionRequests({ token, userId }: GetUserAdoptionRequestsParams) {
    try {
      const payload = await apiClient.get<unknown>(
        API_ENDPOINTS.users.adoptionRequests(userId),
        {
          token,
        },
      );
      logPetEndpointResponse(
        `GET ${API_ENDPOINTS.users.adoptionRequests(userId)}`,
        payload,
      );

      return extractAdoptionRequestArray(payload);
    } catch (error) {
      if (isNoDataApiError(error)) {
        logPetEndpointResponse(
          `GET ${API_ENDPOINTS.users.adoptionRequests(userId)}`,
          [],
        );
        return [];
      }

      throw error;
    }
  },
  async removeFavorite({ petId, token, userId }: PetFavoriteParams) {
    const payload = await apiClient.delete<unknown>(API_ENDPOINTS.pets.favorites(petId), {
      headers: {
        [FAVORITE_USER_ID_HEADER]: userId,
      },
      token,
    });
    logPetEndpointResponse(
      `DELETE ${API_ENDPOINTS.pets.favorites(petId)}`,
      payload,
    );

    return extractFavorited(payload, false);
  },
  async updatePet({ payload, petId, token }: UpdatePetParams) {
    const result = await apiClient.put<unknown, PetMutationPayload>(
      API_ENDPOINTS.pets.byId(petId),
      payload,
      { token },
    );
    logPetEndpointResponse(`PUT ${API_ENDPOINTS.pets.byId(petId)}`, result);

    return extractPetItem(result);
  },
  async updateAdoptionRequestStatus({
    requestId,
    reviewNotes,
    status,
    token,
    userId,
  }: UpdateAdoptionRequestStatusParams) {
    const trimmedReviewNotes = reviewNotes?.trim();
    const payload: UpdateAdoptionRequestStatusPayload = trimmedReviewNotes
      ? { reviewNotes: trimmedReviewNotes, status }
      : { status };

    const result = await apiClient.patch<unknown, UpdateAdoptionRequestStatusPayload>(
      API_ENDPOINTS.adoptionRequests.statusById(requestId),
      payload,
      {
        headers: {
          [ADOPTION_USER_ID_HEADER]: userId,
        },
        token,
      },
    );
    logPetEndpointResponse(
      `PATCH ${API_ENDPOINTS.adoptionRequests.statusById(requestId)}`,
      result,
    );

    return extractAdoptionRequestItem(result);
  },
};
