import type { ImageSourcePropType } from "react-native";
import type { PetType } from "@/features/pets/pets.types";

export type DashboardPromoItem = {
  id: string;
  image: ImageSourcePropType;
};

export type DashboardCategoryItem = {
  id: string;
  iconSource: ImageSourcePropType;
  label: string;
};

export type DashboardPetItem = {
  age: string;
  vaccinated: boolean;
  id: string;
  petId: string;
  image?: ImageSourcePropType | string;
  name: string;
  type: PetType;
  sex: "Male" | "Female";
};

export type DashboardBottomNavKey =
  | "home"
  | "chat"
  | "sos"
  | "community"
  | "profile";

export const DASHBOARD_ASSETS = {
  TitleLogo2: require("../../assets/images/title-logo-2.png"),
  communityBanner: require("../../assets/images/carousel/community-banner.png"),
  donateBanner: require("../../assets/images/carousel/donate-banner.png"),
  petHugging: require("../../assets/images/pet-hugging.png"),
  dogDefault: require("../../assets/images/dog.png"),
  catDefault: require("../../assets/images/cat.png"),
  categoryVeterinary: require("../../assets/images/veterinary-icon.png"),
  categoryTracker: require("../../assets/images/tracker-icon.png"),
  navChat: require("../../assets/images/chat-icon.png"),
  categoryAdoptPets: require("../../assets/images/adopt-pets-icon.png"),
  categoryEvents: require("../../assets/images/events-icon.png"),
  categoryCommunity: require("../../assets/images/community-icon.png"),
  categoryWishlist: require("../../assets/images/wishlist-icon.png"),
  categoryVolunteer: require("../../assets/images/volunteer-icon.png"),
  categoryHeroesWall: require("../../assets/images/heroes-wall-icon.png"),
} as const;

export const DASHBOARD_PROMO_ITEMS: DashboardPromoItem[] = [
  {
    id: "donate-banner",
    image: DASHBOARD_ASSETS.donateBanner,
  },
  {
    id: "community-banner",
    image: DASHBOARD_ASSETS.communityBanner,
  },
];

export const DASHBOARD_CATEGORIES: DashboardCategoryItem[] = [
  {
    id: "veterinary",
    iconSource: DASHBOARD_ASSETS.categoryVeterinary,
    label: "Veterinary",
  },
  {
    id: "tracker",
    iconSource: DASHBOARD_ASSETS.categoryTracker,
    label: "Tracker",
  },
  {
    id: "adopt-pets",
    iconSource: DASHBOARD_ASSETS.categoryAdoptPets,
    label: "Adopt Pets",
  },
  {
    id: "events",
    iconSource: DASHBOARD_ASSETS.categoryEvents,
    label: "Events",
  },
  {
    id: "community",
    iconSource: DASHBOARD_ASSETS.categoryCommunity,
    label: "Community",
  },
  {
    id: "wishlist",
    iconSource: DASHBOARD_ASSETS.categoryWishlist,
    label: "Wishlist",
  },
  {
    id: "volunteer",
    iconSource: DASHBOARD_ASSETS.categoryVolunteer,
    label: "Volunteer",
  },
  {
    id: "heroes-wall",
    iconSource: DASHBOARD_ASSETS.categoryHeroesWall,
    label: "Heroes Wall",
  },
];

export const DASHBOARD_WAITING_PETS: DashboardPetItem[] = [
  {
    id: "waiting-pet-1",
    petId: "pet-1",
    image: DASHBOARD_ASSETS.dogDefault,
    name: "Bruno",
    type: "dog",
    sex: "Male",
    age: "1 year old",
    vaccinated: true,
  },
  {
    id: "waiting-pet-2",
    petId: "pet-7",
    image: DASHBOARD_ASSETS.catDefault,
    name: "Luna",
    type: "cat",
    sex: "Female",
    age: "2 years old",
    vaccinated: true,
  },
  {
    id: "waiting-pet-3",
    petId: "pet-4",
    image: DASHBOARD_ASSETS.dogDefault,
    name: "Yuki",
    type: "dog",
    sex: "Male",
    age: "1 year old",
    vaccinated: false,
  },
];
