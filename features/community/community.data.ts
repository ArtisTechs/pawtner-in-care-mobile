import type {
  CommunityComment,
  CommunityImageSource,
  CommunityPost,
  CommunityPostMediaType,
} from "@/features/community/community.types";
import type {
  CommunityCommentApiItem,
  CommunityPostApiItem,
} from "@/services/community/community.service";
import type { ImageSourcePropType } from "react-native";

const HASHTAG_PATTERN = /#[A-Za-z0-9_]+/g;

export const COMMUNITY_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
} as const;

export const COMMUNITY_CURRENT_USER = {
  avatar: "",
  isVerified: false,
  name: "Pawtner User",
} as const;

const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = toTrimmedString(record[key]);

    if (value) {
      return value;
    }
  }

  return "";
};

const pickBoolean = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
};

const joinNameParts = (parts: unknown[]) => {
  return parts
    .map((part) => toTrimmedString(part))
    .filter(Boolean)
    .join(" ")
    .trim();
};

const toStructuredName = (
  record: Record<string, unknown> | null,
  options?: {
    firstNameKeys?: string[];
    middleNameKeys?: string[];
    lastNameKeys?: string[];
  },
) => {
  if (!record) {
    return "";
  }

  const firstName = pickString(record, options?.firstNameKeys ?? ["firstName"]);
  const middleName = pickString(record, options?.middleNameKeys ?? ["middleName"]);
  const lastName = pickString(record, options?.lastNameKeys ?? ["lastName"]);

  return joinNameParts([firstName, middleName, lastName]);
};

const normalizeHashtag = (value: string) => {
  const normalized = value
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");

  return normalized ? `#${normalized}` : "";
};

const normalizeHashtagRequestValue = (value: string) => {
  return value
    .trim()
    .replace(/^#+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
};

const toRelativeTimeLabel = (isoDateTime: string | null) => {
  if (!isoDateTime) {
    return "Just now";
  }

  const parsedTimestamp = Date.parse(isoDateTime);

  if (Number.isNaN(parsedTimestamp)) {
    return "Just now";
  }

  const diffMs = Date.now() - parsedTimestamp;
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return "Just now";
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes}m`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays < 7) {
    return `${diffDays}d`;
  }

  const sourceDate = new Date(parsedTimestamp);

  return sourceDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
};

const resolvePostMediaType = (
  imageUris: string[],
  videoUri: string | undefined,
): CommunityPostMediaType | undefined => {
  if (videoUri) {
    return "video";
  }

  if (imageUris.length) {
    return "image";
  }

  return undefined;
};

type MapCommunityPostInput = {
  currentUserAvatar?: CommunityImageSource | null;
  currentUserId?: string | null;
  currentUserIsVerified?: boolean;
  currentUserName?: string | null;
  post: CommunityPostApiItem;
};

type MapCommunityCommentInput = {
  comment: CommunityCommentApiItem;
  currentUserAvatar?: CommunityImageSource | null;
  currentUserId?: string | null;
  currentUserIsVerified?: boolean;
  currentUserName?: string | null;
};

export const resolveImageSource = (source: CommunityImageSource) => {
  return typeof source === "string" ? { uri: source } : source;
};

export const resolveOptionalImageSource = (
  source?: CommunityImageSource | null,
): ImageSourcePropType | null => {
  if (!source) {
    return null;
  }

  if (typeof source === "string") {
    const normalizedSource = source.trim();
    return normalizedSource ? { uri: normalizedSource } : null;
  }

  return source;
};

export const extractHashtags = (caption: string) => {
  return caption.match(HASHTAG_PATTERN) ?? [];
};

export const toRequestHashtags = (caption: string) => {
  const tags = extractHashtags(caption)
    .map(normalizeHashtagRequestValue)
    .filter(Boolean);

  return Array.from(new Set(tags));
};

export const mapCommunityPostToViewModel = ({
  currentUserAvatar,
  currentUserId,
  currentUserIsVerified = false,
  currentUserName,
  post,
}: MapCommunityPostInput): CommunityPost => {
  const postRecord = post as Record<string, unknown>;
  const nestedUserRecord =
    post.user && typeof post.user === "object"
      ? (post.user as Record<string, unknown>)
      : null;
  const normalizedCurrentUserId = toTrimmedString(currentUserId);
  const isCurrentUser =
    normalizedCurrentUserId.length > 0 && post.userId === normalizedCurrentUserId;
  const nestedStructuredUserName = toStructuredName(nestedUserRecord);
  const topLevelStructuredUserName = toStructuredName(postRecord, {
    firstNameKeys: ["userFirstName", "firstName", "authorFirstName"],
    middleNameKeys: ["userMiddleName", "middleName", "authorMiddleName"],
    lastNameKeys: ["userLastName", "lastName", "authorLastName"],
  });
  const fallbackUserName = post.userId
    ? `User ${post.userId.slice(0, 8)}`
    : "Community User";
  const resolvedUserName =
    nestedStructuredUserName ||
    (nestedUserRecord
      ? pickString(nestedUserRecord, [
          "userName",
          "username",
          "authorName",
          "displayName",
          "fullName",
          "name",
        ])
      : "") ||
    topLevelStructuredUserName ||
    pickString(postRecord, [
      "userName",
      "username",
      "authorName",
      "displayName",
      "fullName",
      "name",
    ]) ||
    (isCurrentUser ? toTrimmedString(currentUserName) : "") ||
    fallbackUserName;
  const resolvedAvatar =
    (isCurrentUser ? currentUserAvatar : null) ||
    pickString(postRecord, ["userAvatar", "avatar", "avatarUrl", "profilePicture"]) ||
    (nestedUserRecord
      ? pickString(nestedUserRecord, ["avatar", "avatarUrl", "profilePicture"])
      : "") ||
    "";
  const resolvedIsVerified =
    (isCurrentUser ? currentUserIsVerified : null) ??
    pickBoolean(postRecord, ["isVerified", "verified"]) ??
    (nestedUserRecord
      ? pickBoolean(nestedUserRecord, ["isVerified", "verified"])
      : null) ??
    false;
  const normalizedContent = toTrimmedString(post.content);
  const tagsFromPost = post.hashtags.map(normalizeHashtag).filter(Boolean);
  const tagsFromContent = extractHashtags(normalizedContent)
    .map(normalizeHashtag)
    .filter(Boolean);
  const hashtags = Array.from(new Set([...tagsFromPost, ...tagsFromContent]));
  const imageUris = post.media
    .filter((item) => item.mediaType === "IMAGE")
    .map((item) => item.mediaUrl.trim())
    .filter(Boolean);
  const videoUri = post.media
    .find((item) => item.mediaType === "VIDEO")
    ?.mediaUrl.trim();

  return {
    caption: normalizedContent,
    commentCount: post.commentCount,
    createdAt: post.createdAt,
    createdAtLabel: toRelativeTimeLabel(post.createdAt),
    hashtags,
    id: post.postId,
    images: imageUris,
    isVerified: resolvedIsVerified,
    likeCount: post.likeCount,
    liked: post.likedByCurrentUser,
    mediaType: resolvePostMediaType(imageUris, videoUri),
    status: post.status,
    userAvatar: resolvedAvatar,
    userId: post.userId,
    userName: resolvedUserName,
    videoUri,
  };
};

export const mapCommunityCommentToViewModel = ({
  comment,
  currentUserAvatar,
  currentUserId,
  currentUserIsVerified = false,
  currentUserName,
}: MapCommunityCommentInput): CommunityComment => {
  const commentRecord = comment as Record<string, unknown>;
  const nestedUserRecord =
    comment.user && typeof comment.user === "object"
      ? (comment.user as Record<string, unknown>)
      : null;
  const normalizedCurrentUserId = toTrimmedString(currentUserId);
  const isCurrentUser =
    normalizedCurrentUserId.length > 0 && comment.userId === normalizedCurrentUserId;
  const nestedStructuredUserName = toStructuredName(nestedUserRecord);
  const topLevelStructuredUserName = toStructuredName(commentRecord, {
    firstNameKeys: ["userFirstName", "firstName", "authorFirstName"],
    middleNameKeys: ["userMiddleName", "middleName", "authorMiddleName"],
    lastNameKeys: ["userLastName", "lastName", "authorLastName"],
  });
  const fallbackUserName = comment.userId
    ? `User ${comment.userId.slice(0, 8)}`
    : "Community User";
  const resolvedUserName =
    nestedStructuredUserName ||
    (nestedUserRecord
      ? pickString(nestedUserRecord, [
          "userName",
          "username",
          "authorName",
          "displayName",
          "fullName",
          "name",
        ])
      : "") ||
    topLevelStructuredUserName ||
    pickString(commentRecord, [
      "userName",
      "username",
      "authorName",
      "displayName",
      "fullName",
      "name",
    ]) ||
    (isCurrentUser ? toTrimmedString(currentUserName) : "") ||
    fallbackUserName;
  const resolvedAvatar =
    (isCurrentUser ? currentUserAvatar : null) ||
    pickString(commentRecord, ["userAvatar", "avatar", "avatarUrl", "profilePicture"]) ||
    (nestedUserRecord
      ? pickString(nestedUserRecord, ["avatar", "avatarUrl", "profilePicture"])
      : "") ||
    "";
  const resolvedIsVerified =
    (isCurrentUser ? currentUserIsVerified : null) ??
    pickBoolean(commentRecord, ["isVerified", "verified"]) ??
    (nestedUserRecord
      ? pickBoolean(nestedUserRecord, ["isVerified", "verified"])
      : null) ??
    false;
  const normalizedContent = toTrimmedString(comment.content);

  return {
    content: normalizedContent,
    createdAt: comment.createdAt,
    createdAtLabel: toRelativeTimeLabel(comment.createdAt),
    id: comment.commentId,
    isVerified: resolvedIsVerified,
    postId: comment.postId,
    status: comment.status,
    userAvatar: resolvedAvatar,
    userId: comment.userId,
    userName: resolvedUserName,
  };
};
