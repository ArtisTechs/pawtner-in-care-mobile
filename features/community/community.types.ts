import type { ImageSourcePropType } from "react-native";

export type CommunityImageSource = ImageSourcePropType | string;

export type CommunityMediaAction = "image" | "emoji" | "video";
export type CommunityPostMediaType = "image" | "video";
export type CommunityComposerMediaType = "image" | "video";
export type CommunityPostStatus = "ACTIVE" | "DELETED" | "HIDDEN" | null;
export type CommunityCommentStatus = "ACTIVE" | "DELETED" | "HIDDEN" | null;

export type CommunityPost = {
  createdAt?: string | null;
  id: string;
  userName: string;
  userId: string;
  userAvatar: CommunityImageSource;
  isVerified: boolean;
  caption: string;
  images?: CommunityImageSource[];
  videoUri?: string;
  mediaType?: CommunityPostMediaType;
  likeCount: number;
  commentCount: number;
  createdAtLabel: string;
  hashtags: string[];
  liked?: boolean;
  status?: CommunityPostStatus;
};

export type CommunityComment = {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: CommunityImageSource;
  isVerified: boolean;
  content: string;
  createdAt?: string | null;
  createdAtLabel: string;
  status?: CommunityCommentStatus;
};

export type CommunityComposerMediaAsset = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

export type SubmitCommunityPostInput = {
  caption: string;
  photos: CommunityComposerMediaAsset[];
  video: CommunityComposerMediaAsset | null;
};
