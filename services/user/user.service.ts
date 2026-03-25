import { API_ENDPOINTS } from "@/services/api/api-endpoints";
import { apiClient } from "@/services/api/api-client";
import type { UserProfile } from "@/types/user";

type GetUserByIdParams = {
  token: string;
  userId: string;
};

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.firstName === "string" &&
    typeof record.lastName === "string" &&
    typeof record.email === "string" &&
    typeof record.role === "string"
  );
};

const extractUserProfile = (payload: unknown): UserProfile => {
  if (isUserProfile(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nestedCandidates = [record.user, record.data, record.result];

    for (const candidate of nestedCandidates) {
      if (isUserProfile(candidate)) {
        return candidate;
      }
    }
  }

  throw new Error("Unexpected response from users endpoint.");
};

export const userService = {
  async getUserById({ token, userId }: GetUserByIdParams) {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.users.byId(userId), {
      token,
    });

    return extractUserProfile(payload);
  },
};
