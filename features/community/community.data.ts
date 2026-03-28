import type {
  CommunityImageSource,
  CommunityPost,
  CreateCommunityPostInput,
} from "@/features/community/community.types";

const HASHTAG_PATTERN = /#[A-Za-z0-9_]+/g;

export const COMMUNITY_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
  currentUserAvatar: require("../../assets/images/cat.png"),
} as const;

export const COMMUNITY_CURRENT_USER = {
  name: "Pawtner User",
  avatar: COMMUNITY_ASSETS.currentUserAvatar,
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
    image:
      "https://images.pexels.com/photos/16074114/pexels-photo-16074114.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=2",
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
    image:
      "https://images.pexels.com/photos/127028/pexels-photo-127028.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&dpr=2",
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

export const extractHashtags = (caption: string) => {
  return caption.match(HASHTAG_PATTERN) ?? [];
};

const removeHashtagsFromCaption = (caption: string) => {
  return caption.replace(HASHTAG_PATTERN, "").replace(/\s{2,}/g, " ").trim();
};

const createPostId = () => {
  return `community-post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const createLocalCommunityPost = ({
  caption,
  userName,
  userAvatar,
  isVerified = false,
  mediaUri = null,
  mediaType = null,
}: CreateCommunityPostInput): CommunityPost => {
  const trimmedCaption = caption.trim();
  const hashtags = extractHashtags(trimmedCaption);
  const captionWithoutHashtags = removeHashtagsFromCaption(trimmedCaption);

  return {
    id: createPostId(),
    userName,
    userAvatar,
    isVerified,
    caption: captionWithoutHashtags || trimmedCaption,
    hashtags,
    mediaType: mediaType ?? undefined,
    image: mediaType === "image" && mediaUri ? mediaUri : undefined,
    likeCount: 0,
    commentCount: 0,
    createdAtLabel: "Just now",
    liked: false,
  };
};
