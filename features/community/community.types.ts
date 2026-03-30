import type { ImageSourcePropType } from "react-native";

export type CommunityImageSource = ImageSourcePropType | string;

export type CommunityMediaAction = "image" | "emoji" | "video";
export type CommunityPostMediaType = "image" | "video";

export type CommunityPost = {
  id: string;
  userName: string;
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
};

export type CreateCommunityPostInput = {
  caption: string;
  hashtags?: string[];
  userName: string;
  userAvatar: CommunityImageSource;
  isVerified?: boolean;
  imageUris?: string[];
  videoUri?: string | null;
};

export type SubmitCommunityPostInput = {
  caption: string;
  imageUris: string[];
  videoUri: string | null;
};
