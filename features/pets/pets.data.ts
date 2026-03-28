import type {
  PetDetailsItem,
  PetFilter,
  PetListingItem,
} from "@/features/pets/pets.types";

type PetFilterOption = {
  key: PetFilter;
  label: string;
};

export const PET_ASSETS = {
  backIcon: require("../../assets/images/back-icon.png"),
  dogDefault: require("../../assets/images/dog.png"),
  catDefault: require("../../assets/images/cat.png"),
} as const;

export const PET_FILTER_OPTIONS: PetFilterOption[] = [
  { key: "all", label: "All" },
  { key: "favorites", label: "Favorites" },
  { key: "dogs", label: "Dogs" },
  { key: "cats", label: "Cats" },
];

const PET_PRELOADED_IMAGE_LINKS = {
  boxer:
    "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
  toller:
    "https://images.pexels.com/photos/4587996/pexels-photo-4587996.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
  bichon:
    "https://images.pexels.com/photos/1458916/pexels-photo-1458916.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
  shiba:
    "https://images.pexels.com/photos/4587971/pexels-photo-4587971.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
  chihuahua:
    "https://images.pexels.com/photos/1490908/pexels-photo-1490908.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
  shortHairCat:
    "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
  persian:
    "https://images.pexels.com/photos/617278/pexels-photo-617278.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=2",
} as const;

export const PET_LISTING_MOCK_DATA: PetListingItem[] = [
  {
    id: "pet-1",
    name: "Bruno",
    type: "dog",
    breed: "Boxer",
    sex: "Male",
    age: "1 year old",
    vaccinated: true,
    location: "Arayat, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.boxer,
    isFavorite: false,
  },
  {
    id: "pet-2",
    name: "Bruno",
    type: "dog",
    breed: "Nova Scotia Duck Tolling Retriever",
    sex: "Male",
    age: "1 year old",
    vaccinated: false,
    location: "Arayat, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.toller,
    isFavorite: true,
  },
  {
    id: "pet-3",
    name: "Snow",
    type: "dog",
    breed: "Bichon Frise",
    sex: "Female",
    age: "8 months old",
    vaccinated: false,
    location: "Arayat, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.bichon,
    isFavorite: false,
  },
  {
    id: "pet-4",
    name: "Yuki",
    type: "dog",
    breed: "Shiba Inu",
    sex: "Male",
    age: "1 year old",
    vaccinated: false,
    location: "Arayat, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.shiba,
    isFavorite: true,
  },
  {
    id: "pet-5",
    name: "Chico",
    type: "dog",
    breed: "Chihuahua",
    sex: "Male",
    age: "1 year old",
    vaccinated: false,
    location: "Arayat, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.chihuahua,
    isFavorite: false,
  },
  {
    id: "pet-6",
    name: "Milo",
    type: "cat",
    breed: "Domestic Shorthair",
    sex: "Male",
    age: "11 months old",
    vaccinated: true,
    location: "Arayat, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.shortHairCat,
    isFavorite: false,
  },
  {
    id: "pet-7",
    name: "Luna",
    type: "cat",
    breed: "Persian",
    sex: "Female",
    age: "2 years old",
    vaccinated: true,
    location: "Angeles, Pampanga",
    image: PET_PRELOADED_IMAGE_LINKS.persian,
    isFavorite: true,
  },
];

const PET_DETAILS_DESCRIPTION =
  "Want to add joy and warmth to your family? Meet adorable and cute Bruno! Anyone who saw him would definitely be captivated by his incomparable charm. This adoptable dog is full of joy and affection. His beautiful face with sparkling eyes and a big smile will make your heart melt every time you see him. He has a very well proportioned small to medium build, so it will be easy for you to take him on your daily adventures.";

const PET_DETAILS_FOSTER_AVATAR =
  "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=180&h=180&dpr=2";

const PET_DETAILS_DEFAULT_MEDIA = [
  { id: "media-1", type: "video" },
  { id: "media-2", type: "video" },
  { id: "media-3", type: "video" },
] as const;

export const PET_DETAILS_MOCK_DATA: PetDetailsItem[] = [
  {
    id: "pet-1",
    name: "Bruno",
    type: "dog",
    sex: "Male",
    vaccinated: true,
    age: "2 years",
    weight: "12 kg",
    height: "34 in",
    distance: "40.8 kilometers",
    location: "In Arayat, Pampanga",
    description: PET_DETAILS_DESCRIPTION,
    image: PET_PRELOADED_IMAGE_LINKS.boxer,
    fosterName: "Jedidiah",
    fosterRole: "Foster/Adoption Handler",
    fosterAvatar: PET_DETAILS_FOSTER_AVATAR,
    media: [...PET_DETAILS_DEFAULT_MEDIA],
    isFavorite: false,
  },
];

const DEFAULT_DISTANCE = "40.8 kilometers";
const DEFAULT_LOCATION_PREFIX = "In";

const mapListingToPetDetails = (pet: PetListingItem): PetDetailsItem => {
  const normalizedAge = pet.age.replace(" old", "");

  return {
    id: pet.id,
    name: pet.name,
    type: pet.type,
    sex: pet.sex,
    vaccinated: pet.vaccinated,
    age: normalizedAge,
    weight: "12 kg",
    height: "34 in",
    distance: DEFAULT_DISTANCE,
    location: `${DEFAULT_LOCATION_PREFIX} ${pet.location}`,
    description: PET_DETAILS_DESCRIPTION,
    image: pet.image,
    media: [...PET_DETAILS_DEFAULT_MEDIA],
    isFavorite: Boolean(pet.isFavorite),
  };
};

const PET_DETAILS_BY_ID = new Map(
  PET_DETAILS_MOCK_DATA.map((pet) => [pet.id, pet] as const),
);
const PET_LISTING_BY_ID = new Map(
  PET_LISTING_MOCK_DATA.map((pet) => [pet.id, pet] as const),
);

export const getPetDetailsById = (
  petId: string,
  favoriteOverride?: boolean,
): PetDetailsItem | null => {
  const directMatch = PET_DETAILS_BY_ID.get(petId);
  const listingMatch = PET_LISTING_BY_ID.get(petId);

  const basePet = directMatch ?? (listingMatch ? mapListingToPetDetails(listingMatch) : null);

  if (!basePet) {
    return null;
  }

  if (typeof favoriteOverride === "boolean") {
    return { ...basePet, isFavorite: favoriteOverride };
  }

  if (listingMatch && typeof listingMatch.isFavorite === "boolean") {
    return { ...basePet, isFavorite: listingMatch.isFavorite };
  }

  return basePet;
};
