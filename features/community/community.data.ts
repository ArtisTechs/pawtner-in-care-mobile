import type {
  CommunityImageSource,
  CommunityPost,
  CreateCommunityPostInput,
} from "@/features/community/community.types";
import type { ImageSourcePropType } from "react-native";

const HASHTAG_PATTERN = /#[A-Za-z0-9_]+/g;

export const COMMUNITY_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
} as const;

export const COMMUNITY_CURRENT_USER = {
  name: "Pawtner User",
  avatar: "",
  isVerified: false,
} as const;

export const COMMUNITY_POSTS_MOCK_DATA: CommunityPost[] = [
  {
    id: "community-post-sarah-lee",
    userName: "Sarah Lee",
    userAvatar:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=2",
    isVerified: true,
    caption: "sarap ng tulog ng babies ko hehe.",
    hashtags: ["#catslife", "#orangecat", "#puspin"],
    mediaType: "image",
    images: [
      "https://images.pexels.com/photos/16074114/pexels-photo-16074114.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=2",
    ],
    likeCount: 21,
    commentCount: 32,
    createdAtLabel: "2h",
    liked: false,
  },
  {
    id: "community-post-faye-almarez",
    userName: "Faye Almarez",
    userAvatar:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&dpr=2",
    isVerified: true,
    caption: "meet my newly adopted catto, kwekwek :3",
    hashtags: [],
    mediaType: "image",
    images: [
      "https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=2",
    ],
    likeCount: 17,
    commentCount: 12,
    createdAtLabel: "4h",
    liked: false,
  },
];

export const getCommunityPosts = () =>
  COMMUNITY_POSTS_MOCK_DATA.map((post) => ({ ...post }));

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

const normalizeHashtag = (hashtag: string) => {
  const cleaned = hashtag.trim().replace(/^#+/, "");
  return cleaned ? `#${cleaned}` : "";
};

const createPostId = () => {
  return `community-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createLocalCommunityPost = ({
  caption,
  hashtags = [],
  userName,
  userAvatar,
  isVerified = false,
  imageUris = [],
  videoUri = null,
}: CreateCommunityPostInput): CommunityPost => {
  const trimmedCaption = caption.trim();
  const captionHashtags = extractHashtags(trimmedCaption);
  const combinedHashtags = Array.from(
    new Set([...captionHashtags, ...hashtags].map(normalizeHashtag).filter(Boolean)),
  );
  const normalizedImageUris = imageUris
    .map((uri) => uri.trim())
    .filter(Boolean)
    .slice(0, 5);
  const normalizedVideoUri = videoUri?.trim() ? videoUri.trim() : undefined;
  const mediaType = normalizedVideoUri
    ? "video"
    : normalizedImageUris.length
      ? "image"
      : undefined;

  return {
    id: createPostId(),
    userName,
    userAvatar,
    isVerified,
    caption: trimmedCaption,
    hashtags: combinedHashtags,
    mediaType,
    images: normalizedImageUris,
    videoUri: normalizedVideoUri,
    likeCount: 0,
    commentCount: 0,
    createdAtLabel: "Just now",
    liked: false,
  };
};
