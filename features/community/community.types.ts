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
  image?: CommunityImageSource;
  mediaType?: CommunityPostMediaType;
  likeCount: number;
  commentCount: number;
  createdAtLabel: string;
  hashtags: string[];
  liked?: boolean;
};

export type CreateCommunityPostInput = {
  caption: string;
  userName: string;
  userAvatar: CommunityImageSource;
  isVerified?: boolean;
  mediaUri?: string | null;
  mediaType?: CommunityPostMediaType | null;
};

export type SubmitCommunityPostInput = {
  caption: string;
  mediaUri: string | null;
  mediaType: CommunityPostMediaType | null;
};
