import { API_ENDPOINTS } from "@/services/api/api-endpoints";
import { apiClient } from "@/services/api/api-client";
import type { UserProfile } from "@/types/user";

export type UserRole = "ADMIN" | "USER";

export type UserMutationPayload = {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  password?: string;
  profilePicture?: string | null;
  role?: UserRole;
};

export type UserListQuery = {
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  page?: number;
  profilePicture?: string;
  search?: string;
  size?: number;
  sortBy?: "email" | "firstName" | "id" | "lastName" | "middleName" | "profilePicture";
  sortDir?: "asc" | "desc";
};

type UserAuthParams = {
  token: string;
};

type GetUserByIdParams = {
  token: string;
  userId: string;
};

type CreateUserParams = UserAuthParams & {
  payload: UserMutationPayload;
};

type DeleteUserParams = GetUserByIdParams;

type GetUsersParams = UserAuthParams & {
  query?: UserListQuery;
};

type UpdateUserParams = GetUserByIdParams & {
  payload: UserMutationPayload;
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

const extractUserProfileArray = (payload: unknown): UserProfile[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isUserProfile);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nestedCandidates = [
      record.content,
      record.users,
      record.data,
      record.result,
      record.results,
      record.items,
    ];

    for (const candidate of nestedCandidates) {
      if (Array.isArray(candidate)) {
        return candidate.filter(isUserProfile);
      }
    }
  }

  return [];
};

const buildUsersQueryPath = (query?: UserListQuery) => {
  if (!query) {
    return API_ENDPOINTS.users.base;
  }

  const params = new URLSearchParams();

  const append = (key: keyof UserListQuery, value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }

    const normalizedValue =
      typeof value === "string" ? value.trim() : String(value);

    if (!normalizedValue) {
      return;
    }

    params.append(key, normalizedValue);
  };

  append("search", query.search);
  append("firstName", query.firstName);
  append("middleName", query.middleName);
  append("lastName", query.lastName);
  append("email", query.email);
  append("profilePicture", query.profilePicture);
  append("page", query.page);
  append("size", query.size);
  append("sortBy", query.sortBy);
  append("sortDir", query.sortDir);

  const queryString = params.toString();
  return queryString
    ? `${API_ENDPOINTS.users.base}?${queryString}`
    : API_ENDPOINTS.users.base;
};

export const userService = {
  async createUser({ payload, token }: CreateUserParams) {
    const result = await apiClient.post<unknown, UserMutationPayload>(
      API_ENDPOINTS.users.base,
      payload,
      { token },
    );

    return extractUserProfile(result);
  },
  async deleteUser({ token, userId }: DeleteUserParams) {
    await apiClient.delete<unknown>(API_ENDPOINTS.users.byId(userId), {
      token,
    });
  },
  async getUserById({ token, userId }: GetUserByIdParams) {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.users.byId(userId), {
      token,
    });

    return extractUserProfile(payload);
  },
  async getUsers({ query, token }: GetUsersParams) {
    const payload = await apiClient.get<unknown>(buildUsersQueryPath(query), {
      token,
    });

    return extractUserProfileArray(payload);
  },
  async updateUser({ payload, token, userId }: UpdateUserParams) {
    const result = await apiClient.put<unknown, UserMutationPayload>(
      API_ENDPOINTS.users.byId(userId),
      payload,
      { token },
    );

    return extractUserProfile(result);
  },
};
