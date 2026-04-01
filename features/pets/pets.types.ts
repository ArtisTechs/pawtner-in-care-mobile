import type { ImageSourcePropType } from "react-native";

export type PetType = "dog" | "cat";

export type PetFilter = "all" | "favorites" | "dogs" | "cats";

export type PetListingItem = {
  id: string;
  name: string;
  type: PetType;
  breed: string;
  sex: "Male" | "Female";
  age: string;
  vaccinated: boolean;
  location: string;
  image?: ImageSourcePropType | string;
  isFavorite?: boolean;
};

export type PetListingPagination = {
  first: boolean;
  ignorePagination: boolean;
  last: boolean;
  page: number;
  size: number;
  sortBy?: string;
  sortDirection?: string;
  totalElements: number;
  totalPages: number;
};

export type PetListingPage = {
  items: PetListingItem[];
  pagination: PetListingPagination;
};

export type PetMediaType = "photo" | "video";

export type PetMediaItem = {
  id: string;
  type: PetMediaType;
  thumbnail?: ImageSourcePropType | string;
  videoUrl?: string;
};

export type PetDetailsItem = {
  id: string;
  name: string;
  type: PetType;
  sex: "Male" | "Female";
  vaccinated: boolean;
  age: string;
  weight: string;
  height: string;
  adoptionDate?: string;
  birthDate?: string;
  rescuedDate?: string;
  breed?: string;
  status?: string;
  distance: string;
  location: string;
  description: string;
  image?: ImageSourcePropType | string;
  fosterName?: string;
  fosterRole?: string;
  fosterAvatar?: ImageSourcePropType | string;
  media: PetMediaItem[];
  isFavorite: boolean;
};
