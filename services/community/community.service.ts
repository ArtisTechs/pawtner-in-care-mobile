import { apiClient } from "@/services/api/api-client";
import { API_ENDPOINTS } from "@/services/api/api-endpoints";
import { ApiError } from "@/services/api/api-error";

const COMMUNITY_USER_ID_HEADER = "X-User-Id";

export type CommunityFeedSortBy =
  | "commentCount"
  | "createdAt"
  | "likeCount"
  | "updatedAt";

export type CommunityFeedSortDir = "asc" | "desc";
export type CommunityVisibility = "PRIVATE" | "PUBLIC";
export type CommunityMediaApiType = "IMAGE" | "VIDEO";
export type CommunityPostStatus = "ACTIVE" | "DELETED" | "HIDDEN";
export type CommunityCommentStatus = "ACTIVE" | "DELETED" | "HIDDEN";

export type CommunityFeedQuery = {
  hashtag?: string;
  ignorePagination?: boolean;
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: CommunityFeedSortBy;
  sortDir?: CommunityFeedSortDir;
  userId?: string;
};

export type CommunityPostMediaApiItem = {
  mediaType: CommunityMediaApiType;
  mediaUrl: string;
  sortOrder: number;
};

export type CommunityUserApiItem = {
  firstName?: string | null;
  id?: string;
  isVerified?: boolean;
  lastName?: string | null;
  middleName?: string | null;
  profilePicture?: string | null;
  [key: string]: unknown;
};

export type CommunityPostApiItem = {
  commentCount: number;
  content: string | null;
  createdAt: string | null;
  hashtags: string[];
  likeCount: number;
  likedByCurrentUser: boolean;
  media: CommunityPostMediaApiItem[];
  postId: string;
  status: CommunityPostStatus | null;
  updatedAt: string | null;
  user?: CommunityUserApiItem;
  userId: string;
  visibility: CommunityVisibility;
  [key: string]: unknown;
};

export type CommunityFeedPagination = {
  first: boolean;
  ignorePagination: boolean;
  last: boolean;
  page: number;
  size: number;
  sortDir?: CommunityFeedSortDir;
  sortBy?: string;
  sortDirection?: string;
  totalElements: number;
  totalPages: number;
};

export type CommunityFeedResponse = {
  items: CommunityPostApiItem[];
  pagination: CommunityFeedPagination;
};

export type CommunityCreatePostMediaPayload = {
  mediaType: CommunityMediaApiType;
  mediaUrl: string;
  sortOrder: number;
};

export type CommunityCreatePostPayload = {
  content: string | null;
  hashtags?: string[];
  media?: CommunityCreatePostMediaPayload[];
  visibility?: CommunityVisibility;
};

export type CommunityUpdatePostPayload = CommunityCreatePostPayload;

export type CommunityCommentApiItem = {
  commentId: string;
  content: string;
  createdAt: string | null;
  postId: string;
  status: CommunityCommentStatus | null;
  updatedAt: string | null;
  user?: CommunityUserApiItem;
  userId: string;
  [key: string]: unknown;
};

export type CommunityCommentQuery = {
  ignorePagination?: boolean;
  page?: number;
  size?: number;
  sortBy?: CommunityFeedSortBy;
  sortDir?: CommunityFeedSortDir;
};

export type CommunityCommentsResponse = {
  items: CommunityCommentApiItem[];
  pagination: CommunityFeedPagination;
};

export type CommunityCreateCommentPayload = {
  content: string;
};

export type CommunityUpdateCommentPayload = {
  content: string;
};

export type CommunityDeletePostResponse = {
  deleted: boolean;
  deletedAt: string | null;
  postId: string;
  status: CommunityPostStatus | null;
};

export type CommunityDeleteCommentResponse = {
  commentId: string;
  deleted: boolean;
  postId: string;
  status: CommunityCommentStatus | null;
  updatedAt: string | null;
};

type CommunityAuthParams = {
  currentUserId: string;
  token?: string;
};

type CommunityGetPostsParams = CommunityAuthParams & {
  query?: CommunityFeedQuery;
};

type CommunityCreatePostParams = CommunityAuthParams & {
  payload: CommunityCreatePostPayload;
};

type CommunityUpdatePostParams = CommunityPostActionParams & {
  payload: CommunityUpdatePostPayload;
};

type CommunityPostActionParams = CommunityAuthParams & {
  postId: string;
};

type CommunityGetCommentsParams = CommunityPostActionParams & {
  query?: CommunityCommentQuery;
};

type CommunityCreateCommentParams = CommunityPostActionParams & {
  payload: CommunityCreateCommentPayload;
};

type CommunityCommentActionParams = CommunityPostActionParams & {
  commentId: string;
};

type CommunityUpdateCommentParams = CommunityCommentActionParams & {
  payload: CommunityUpdateCommentPayload;
};

export type CommunityLikeMutationResponse = {
  likeCount: number | null;
  liked: boolean;
};

const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const toNullableString = (value: unknown) => {
  const normalized = toTrimmedString(value);
  return normalized || null;
};

const toFiniteNumber = (value: unknown, fallback = 0) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return value;
};

const toBoolean = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const toVisibility = (value: unknown): CommunityVisibility => {
  const normalized = toTrimmedString(value).toUpperCase();
  return normalized === "PRIVATE" ? "PRIVATE" : "PUBLIC";
};

const toPostStatus = (value: unknown): CommunityPostStatus | null => {
  const normalized = toTrimmedString(value).toUpperCase();

  if (normalized === "ACTIVE" || normalized === "DELETED" || normalized === "HIDDEN") {
    return normalized;
  }

  return null;
};

const toCommentStatus = (value: unknown): CommunityCommentStatus | null => {
  const normalized = toTrimmedString(value).toUpperCase();

  if (normalized === "ACTIVE" || normalized === "DELETED" || normalized === "HIDDEN") {
    return normalized;
  }

  return null;
};

const toMediaType = (value: unknown): CommunityMediaApiType | null => {
  const normalized = toTrimmedString(value).toUpperCase();

  if (normalized === "IMAGE" || normalized === "VIDEO") {
    return normalized;
  }

  return null;
};

const toHashtagArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const parsedTags = value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry.trim();
      }

      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;

        return (
          toTrimmedString(record.name) ||
          toTrimmedString(record.tag) ||
          toTrimmedString(record.value) ||
          toTrimmedString(record.normalizedName)
        );
      }

      return "";
    })
    .filter(Boolean);

  return Array.from(new Set(parsedTags));
};

const toUserRecord = (
  value: unknown,
  fallbackUserId = "",
): CommunityUserApiItem | undefined => {
  if (!value || typeof value !== "object") {
    return fallbackUserId ? { id: fallbackUserId } : undefined;
  }

  const record = value as Record<string, unknown>;
  const id =
    toTrimmedString(record.id) ||
    toTrimmedString(record.userId) ||
    toTrimmedString(record.uuid) ||
    fallbackUserId;

  if (!id) {
    return undefined;
  }

  return {
    ...record,
    firstName: toNullableString(record.firstName),
    id,
    isVerified:
      typeof record.isVerified === "boolean"
        ? record.isVerified
        : typeof record.verified === "boolean"
          ? record.verified
          : undefined,
    lastName: toNullableString(record.lastName),
    middleName: toNullableString(record.middleName),
    profilePicture:
      toNullableString(record.profilePicture) ||
      toNullableString(record.avatarUrl) ||
      toNullableString(record.avatar),
  };
};

const toMediaArray = (value: unknown): CommunityPostMediaApiItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const mediaItems = value
    .map((entry) => {
      if (!entry || typeof entry !== "object") {
        return null;
      }

      const record = entry as Record<string, unknown>;
      const mediaUrl =
        toTrimmedString(record.mediaUrl) || toTrimmedString(record.url);
      const mediaType = toMediaType(record.mediaType ?? record.type);

      if (!mediaUrl || !mediaType) {
        return null;
      }

      return {
        mediaType,
        mediaUrl,
        sortOrder: Math.max(0, Math.floor(toFiniteNumber(record.sortOrder, 0))),
      } satisfies CommunityPostMediaApiItem;
    })
    .filter((item): item is CommunityPostMediaApiItem => Boolean(item));

  return mediaItems.sort((left, right) => left.sortOrder - right.sortOrder);
};

const toPostRecord = (value: unknown): CommunityPostApiItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const postId = toTrimmedString(record.postId) || toTrimmedString(record.id);

  if (!postId) {
    return null;
  }

  const nestedUserRecord =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : null;
  const userId =
    toTrimmedString(record.userId) ||
    toTrimmedString(record.authorId) ||
    toTrimmedString(nestedUserRecord?.userId) ||
    toTrimmedString(nestedUserRecord?.id);

  return {
    ...record,
    commentCount: Math.max(0, Math.floor(toFiniteNumber(record.commentCount, 0))),
    content: toNullableString(record.content),
    createdAt: toNullableString(record.createdAt),
    hashtags: toHashtagArray(record.hashtags),
    likeCount: Math.max(0, Math.floor(toFiniteNumber(record.likeCount, 0))),
    likedByCurrentUser: toBoolean(record.likedByCurrentUser, false),
    media: toMediaArray(record.media),
    postId,
    status: toPostStatus(record.status),
    updatedAt: toNullableString(record.updatedAt),
    user: toUserRecord(record.user, userId),
    userId,
    visibility: toVisibility(record.visibility),
  };
};

const extractPostArray = (payload: unknown): CommunityPostApiItem[] => {
  const parseArray = (value: unknown) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map(toPostRecord)
      .filter((item): item is CommunityPostApiItem => Boolean(item));
  };

  const directItems = parseArray(payload);

  if (directItems.length) {
    return directItems;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.content,
      record.posts,
      record.data,
      record.result,
      record.results,
      record.items,
    ];

    for (const candidate of candidates) {
      const nestedItems = parseArray(candidate);

      if (nestedItems.length) {
        return nestedItems;
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
): CommunityFeedPagination => {
  const safeFallbackPage = Math.max(0, Math.floor(fallbackPage));
  const safeFallbackSize = Math.max(0, Math.floor(fallbackSize));
  const sourceRecord =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : null;
  const record =
    sourceRecord?.pagination && typeof sourceRecord.pagination === "object"
      ? (sourceRecord.pagination as Record<string, unknown>)
      : sourceRecord;
  const page = Math.max(
    0,
    Math.floor(toFiniteNumber(record?.page ?? record?.number, safeFallbackPage)),
  );
  const size = Math.max(
    0,
    Math.floor(
      toFiniteNumber(
        record?.size ?? record?.pageSize,
        safeFallbackSize > 0 ? safeFallbackSize : itemCount,
      ),
    ),
  );
  const totalElements = Math.max(
    0,
    Math.floor(
      toFiniteNumber(
        record?.totalElements ??
          record?.totalItems ??
          record?.numberOfElements,
        itemCount,
      ),
    ),
  );
  const computedTotalPages = size > 0 ? Math.ceil(totalElements / size) : 0;
  const totalPages = Math.max(
    0,
    Math.floor(
      toFiniteNumber(
        record?.totalPages ?? record?.pageCount,
        computedTotalPages,
      ),
    ),
  );
  const sortBy =
    toNullableString(record?.sortBy) ??
    toNullableString(record?.sortField) ??
    undefined;
  const sortDirection =
    toNullableString(record?.sortDirection) ??
    toNullableString(record?.sortDir) ??
    undefined;
  const normalizedSortDir = sortDirection?.toLowerCase();

  return {
    first: toBoolean(record?.first, page <= 0),
    ignorePagination: toBoolean(record?.ignorePagination, false),
    last: toBoolean(record?.last, totalPages <= 1 || page >= totalPages - 1),
    page,
    size,
    sortBy,
    sortDir:
      normalizedSortDir === "asc" || normalizedSortDir === "desc"
        ? normalizedSortDir
        : undefined,
    sortDirection,
    totalElements,
    totalPages,
  };
};

const isNoDataApiError = (error: unknown) => {
  return error instanceof ApiError && error.status === 404;
};

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

const buildFeedPath = ({
  hashtag,
  ignorePagination,
  keyword,
  page,
  size,
  sortBy,
  sortDir,
  userId,
}: CommunityFeedQuery = {}) => {
  const params = new URLSearchParams();

  if (toTrimmedString(userId)) {
    params.set("userId", toTrimmedString(userId));
  }

  if (toTrimmedString(hashtag)) {
    params.set("hashtag", toTrimmedString(hashtag));
  }

  if (toTrimmedString(keyword)) {
    params.set("keyword", toTrimmedString(keyword));
  }

  const normalizedPage = normalizePageParam(page);
  if (normalizedPage !== undefined) {
    params.set("page", String(normalizedPage));
  }

  const normalizedSize = normalizeSizeParam(size);
  if (normalizedSize !== undefined) {
    params.set("size", String(normalizedSize));
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
  }

  if (sortDir) {
    params.set("sortDir", sortDir);
  }

  if (typeof ignorePagination === "boolean") {
    params.set("ignorePagination", String(ignorePagination));
  }

  const queryString = params.toString();

  return queryString
    ? `${API_ENDPOINTS.community.base}?${queryString}`
    : API_ENDPOINTS.community.base;
};

const buildCommentsPath = (
  postId: string,
  {
    ignorePagination,
    page,
    size,
    sortBy,
    sortDir,
  }: CommunityCommentQuery = {},
) => {
  const params = new URLSearchParams();
  const normalizedPage = normalizePageParam(page);
  const normalizedSize = normalizeSizeParam(size);

  if (normalizedPage !== undefined) {
    params.set("page", String(normalizedPage));
  }

  if (normalizedSize !== undefined) {
    params.set("size", String(normalizedSize));
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
  }

  if (sortDir) {
    params.set("sortDir", sortDir);
  }

  if (typeof ignorePagination === "boolean") {
    params.set("ignorePagination", String(ignorePagination));
  }

  const basePath = API_ENDPOINTS.community.comments(postId);
  const queryString = params.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
};

const toLikeMutationResponse = (
  payload: unknown,
  fallbackLiked: boolean,
): CommunityLikeMutationResponse => {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const likeCount = Number.isFinite(record.likeCount)
      ? Number(record.likeCount)
      : null;

    return {
      likeCount: likeCount === null ? null : Math.max(0, Math.floor(likeCount)),
      liked: toBoolean(record.liked, fallbackLiked),
    };
  }

  return {
    likeCount: null,
    liked: fallbackLiked,
  };
};

const toCommentRecord = (
  value: unknown,
  fallbackPostId = "",
): CommunityCommentApiItem | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const nestedUserRecord =
    record.user && typeof record.user === "object"
      ? (record.user as Record<string, unknown>)
      : null;
  const nestedPostRecord =
    record.post && typeof record.post === "object"
      ? (record.post as Record<string, unknown>)
      : null;
  const commentId = toTrimmedString(record.commentId) || toTrimmedString(record.id);
  const status = toCommentStatus(record.status);
  const content =
    toTrimmedString(record.content) ||
    toTrimmedString(record.comment) ||
    toTrimmedString(record.message);

  if (
    !commentId ||
    (!content && status !== "DELETED" && status !== "HIDDEN")
  ) {
    return null;
  }

  const postId =
    toTrimmedString(record.postId) ||
    toTrimmedString(record.postID) ||
    toTrimmedString(nestedPostRecord?.postId) ||
    toTrimmedString(nestedPostRecord?.id) ||
    fallbackPostId;
  const userId =
    toTrimmedString(record.userId) ||
    toTrimmedString(record.authorId) ||
    toTrimmedString(nestedUserRecord?.userId) ||
    toTrimmedString(nestedUserRecord?.id);

  return {
    ...record,
    commentId,
    content,
    createdAt: toNullableString(record.createdAt),
    postId,
    status,
    updatedAt: toNullableString(record.updatedAt),
    user: toUserRecord(record.user, userId),
    userId,
  };
};

const extractCommentArray = (
  payload: unknown,
  fallbackPostId = "",
): CommunityCommentApiItem[] => {
  const parseArray = (value: unknown) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((entry) => toCommentRecord(entry, fallbackPostId))
      .filter((item): item is CommunityCommentApiItem => Boolean(item));
  };

  const directItems = parseArray(payload);

  if (directItems.length) {
    return directItems;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [
      record.content,
      record.comments,
      record.data,
      record.result,
      record.results,
      record.items,
    ];

    for (const candidate of candidates) {
      const nestedItems = parseArray(candidate);

      if (nestedItems.length) {
        return nestedItems;
      }
    }
  }

  return [];
};

const extractSingleComment = (
  payload: unknown,
  fallbackPostId = "",
): CommunityCommentApiItem => {
  const directComment = toCommentRecord(payload, fallbackPostId);

  if (directComment) {
    return directComment;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.result, record.comment];

    for (const candidate of candidates) {
      const nestedComment = toCommentRecord(candidate, fallbackPostId);

      if (nestedComment) {
        return nestedComment;
      }
    }
  }

  throw new Error("Unexpected response from community comments endpoint.");
};

const extractSinglePost = (payload: unknown): CommunityPostApiItem => {
  const directPost = toPostRecord(payload);

  if (directPost) {
    return directPost;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidates = [record.data, record.result, record.post];

    for (const candidate of candidates) {
      const nestedPost = toPostRecord(candidate);

      if (nestedPost) {
        return nestedPost;
      }
    }
  }

  throw new Error("Unexpected response from community posts endpoint.");
};

const toDeletePostResponse = (
  payload: unknown,
  fallbackPostId: string,
): CommunityDeletePostResponse => {
  const parsedPost = toPostRecord(payload);

  if (parsedPost) {
    return {
      deleted: parsedPost.status === "DELETED",
      deletedAt: toNullableString((parsedPost as Record<string, unknown>).deletedAt),
      postId: parsedPost.postId,
      status: parsedPost.status,
    };
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nestedPost = [record.data, record.result, record.post]
      .map((value) => toPostRecord(value))
      .find(Boolean);

    if (nestedPost) {
      return {
        deleted: nestedPost.status === "DELETED",
        deletedAt: toNullableString((nestedPost as Record<string, unknown>).deletedAt),
        postId: nestedPost.postId,
        status: nestedPost.status,
      };
    }

    const postId =
      toTrimmedString(record.postId) || toTrimmedString(record.id) || fallbackPostId;
    const status = toPostStatus(record.status);
    const deleted = toBoolean(record.deleted, status === "DELETED");

    if (postId) {
      return {
        deleted,
        deletedAt: toNullableString(record.deletedAt),
        postId,
        status,
      };
    }
  }

  return {
    deleted: true,
    deletedAt: null,
    postId: fallbackPostId,
    status: "DELETED",
  };
};

const toDeleteCommentResponse = (
  payload: unknown,
  fallbackPostId: string,
  fallbackCommentId: string,
): CommunityDeleteCommentResponse => {
  const parsedComment = toCommentRecord(payload, fallbackPostId);

  if (parsedComment) {
    return {
      commentId: parsedComment.commentId,
      deleted: parsedComment.status === "DELETED",
      postId: parsedComment.postId || fallbackPostId,
      status: parsedComment.status,
      updatedAt: parsedComment.updatedAt,
    };
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const nestedComment = [record.data, record.result, record.comment]
      .map((value) => toCommentRecord(value, fallbackPostId))
      .find(Boolean);

    if (nestedComment) {
      return {
        commentId: nestedComment.commentId,
        deleted: nestedComment.status === "DELETED",
        postId: nestedComment.postId || fallbackPostId,
        status: nestedComment.status,
        updatedAt: nestedComment.updatedAt,
      };
    }

    const commentId =
      toTrimmedString(record.commentId) ||
      toTrimmedString(record.id) ||
      fallbackCommentId;
    const postId =
      toTrimmedString(record.postId) ||
      toTrimmedString(record.postID) ||
      fallbackPostId;
    const status = toCommentStatus(record.status);
    const deleted = toBoolean(record.deleted, status === "DELETED");

    return {
      commentId,
      deleted,
      postId,
      status,
      updatedAt: toNullableString(record.updatedAt),
    };
  }

  return {
    commentId: fallbackCommentId,
    deleted: true,
    postId: fallbackPostId,
    status: "DELETED",
    updatedAt: null,
  };
};

export const communityService = {
  async createPost({ currentUserId, payload, token }: CommunityCreatePostParams) {
    const result = await apiClient.post<unknown, CommunityCreatePostPayload>(
      API_ENDPOINTS.community.base,
      payload,
      {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      },
    );

    return extractSinglePost(result);
  },
  async deletePost({ currentUserId, postId, token }: CommunityPostActionParams) {
    const result = await apiClient.delete<unknown>(API_ENDPOINTS.community.byId(postId), {
      headers: {
        [COMMUNITY_USER_ID_HEADER]: currentUserId,
      },
      token,
    });

    return toDeletePostResponse(result, postId);
  },
  async getPostById({ currentUserId, postId, token }: CommunityPostActionParams) {
    const payload = await apiClient.get<unknown>(API_ENDPOINTS.community.byId(postId), {
      headers: {
        [COMMUNITY_USER_ID_HEADER]: currentUserId,
      },
      token,
    });

    return extractSinglePost(payload);
  },
  async getPosts({ currentUserId, query, token }: CommunityGetPostsParams) {
    const path = buildFeedPath(query);

    try {
      const payload = await apiClient.get<unknown>(path, {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      });
      const items = extractPostArray(payload);

      return {
        items,
        pagination: normalizePagination(payload, items.length, query?.page, query?.size),
      } satisfies CommunityFeedResponse;
    } catch (error) {
      if (isNoDataApiError(error)) {
        return {
          items: [],
          pagination: normalizePagination([], 0, query?.page, query?.size),
        } satisfies CommunityFeedResponse;
      }

      throw error;
    }
  },
  async updatePost({
    currentUserId,
    payload,
    postId,
    token,
  }: CommunityUpdatePostParams) {
    const result = await apiClient.put<unknown, CommunityUpdatePostPayload>(
      API_ENDPOINTS.community.byId(postId),
      payload,
      {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      },
    );

    return extractSinglePost(result);
  },
  async getComments({
    currentUserId,
    postId,
    query,
    token,
  }: CommunityGetCommentsParams) {
    const path = buildCommentsPath(postId, query);

    try {
      const payload = await apiClient.get<unknown>(path, {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      });
      const items = extractCommentArray(payload, postId);

      return {
        items,
        pagination: normalizePagination(payload, items.length, query?.page, query?.size),
      } satisfies CommunityCommentsResponse;
    } catch (error) {
      if (isNoDataApiError(error)) {
        return {
          items: [],
          pagination: normalizePagination([], 0, query?.page, query?.size),
        } satisfies CommunityCommentsResponse;
      }

      throw error;
    }
  },
  async createComment({
    currentUserId,
    postId,
    payload,
    token,
  }: CommunityCreateCommentParams) {
    const result = await apiClient.post<unknown, CommunityCreateCommentPayload>(
      API_ENDPOINTS.community.comments(postId),
      payload,
      {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      },
    );

    return extractSingleComment(result, postId);
  },
  async deleteComment({
    commentId,
    currentUserId,
    postId,
    token,
  }: CommunityCommentActionParams) {
    const result = await apiClient.delete<unknown>(
      API_ENDPOINTS.community.commentById(postId, commentId),
      {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      },
    );

    return toDeleteCommentResponse(result, postId, commentId);
  },
  async likePost({ currentUserId, postId, token }: CommunityPostActionParams) {
    const result = await apiClient.post<unknown, undefined>(
      API_ENDPOINTS.community.likes(postId),
      undefined,
      {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      },
    );

    return toLikeMutationResponse(result, true);
  },
  async unlikePost({ currentUserId, postId, token }: CommunityPostActionParams) {
    const result = await apiClient.delete<unknown>(API_ENDPOINTS.community.likes(postId), {
      headers: {
        [COMMUNITY_USER_ID_HEADER]: currentUserId,
      },
      token,
    });

    return toLikeMutationResponse(result, false);
  },
  async updateComment({
    commentId,
    currentUserId,
    payload,
    postId,
    token,
  }: CommunityUpdateCommentParams) {
    const result = await apiClient.put<unknown, CommunityUpdateCommentPayload>(
      API_ENDPOINTS.community.commentById(postId, commentId),
      payload,
      {
        headers: {
          [COMMUNITY_USER_ID_HEADER]: currentUserId,
        },
        token,
      },
    );

    return extractSingleComment(result, postId);
  },
};
