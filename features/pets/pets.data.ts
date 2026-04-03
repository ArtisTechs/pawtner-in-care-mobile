import { petService } from "@/services/pets/pet.service";
import { ApiError } from "@/services/api/api-error";
import type {
  AdoptionRequestApiItem,
  PetAdoptedByUser,
  PetApiItem,
  PetPagination,
  PetSortDirection,
} from "@/types/pet";

import type {
  PetDetailsItem,
  PetFilter,
  PetListingPage,
  PetListingItem,
  PetListingPagination,
  PetMediaItem,
  PetType,
} from "@/features/pets/pets.types";
import { normalizePetStatus } from "@/features/pets/pet-status";

type PetFilterOption = {
  key: PetFilter;
  label: string;
};

type PetAuthParams = {
  token: string;
  userId: string;
};

type FetchPetDetailsParams = PetAuthParams & {
  petId: string;
};

type SetPetFavoriteParams = PetAuthParams & {
  favorited: boolean;
  petId: string;
};

type CreatePetAdoptionRequestParams = PetAuthParams & {
  petId: string;
  message?: string;
};

type CancelPendingPetAdoptionRequestParams = PetAuthParams & {
  petId: string;
  reviewNotes?: string;
};

type FetchPetListingPageParams = PetAuthParams & {
  ignorePagination?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: PetSortDirection;
};

const FALLBACK_PET_LOCATION = "Unknown location";
const FALLBACK_PET_DISTANCE = "N/A";

export const PET_ASSETS = {
  adoptPetsIcon: require("../../assets/images/adopt-pets-icon.png"),
  confirmAdoptPetIcon: require("../../assets/images/confrim-adopt-pet-icon.png"),
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

const normalizeType = (type?: string | null): PetType =>
  type?.trim().toLowerCase() === "cat" ? "cat" : "dog";

const normalizeGender = (gender?: string | null): "Male" | "Female" =>
  gender?.trim().toLowerCase() === "female" ? "Female" : "Male";

type PetAgeParts = {
  months: number;
  years: number;
};

const resolveAgePartsFromBirthDate = (
  birthDate?: string | null,
): PetAgeParts | null => {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) {
    return null;
  }

  const today = new Date();

  if (birth > today) {
    return {
      months: 0,
      years: 0,
    };
  }

  let totalMonths =
    (today.getFullYear() - birth.getFullYear()) * 12 +
    (today.getMonth() - birth.getMonth());

  if (today.getDate() < birth.getDate()) {
    totalMonths -= 1;
  }

  const normalizedTotalMonths = Math.max(0, totalMonths);

  return {
    months: normalizedTotalMonths % 12,
    years: Math.floor(normalizedTotalMonths / 12),
  };
};

const resolveAgePartsFromNumericAge = (
  age?: number | null,
): PetAgeParts | null => {
  if (typeof age !== "number" || !Number.isFinite(age)) {
    return null;
  }

  const normalizedAge = Math.max(0, age);
  const totalMonths = Math.max(0, Math.round(normalizedAge * 12));

  return {
    months: totalMonths % 12,
    years: Math.floor(totalMonths / 12),
  };
};

const resolveAgeParts = (
  age?: number | null,
  birthDate?: string | null,
): PetAgeParts | null =>
  resolveAgePartsFromBirthDate(birthDate) ?? resolveAgePartsFromNumericAge(age);

const formatAge = (age?: number | null, birthDate?: string | null) => {
  const ageParts = resolveAgeParts(age, birthDate);

  if (!ageParts) {
    return undefined;
  }

  if (ageParts.years <= 0) {
    if (ageParts.months <= 0) {
      return "Less than 1 month old";
    }

    return ageParts.months === 1
      ? "1 month old"
      : `${ageParts.months} months old`;
  }

  return ageParts.years === 1 ? "1 year old" : `${ageParts.years} years old`;
};

const formatNumber = (value?: number | null): string | null => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, "");
};

const formatWeight = (value?: number | null) => {
  const normalized = formatNumber(value);
  return normalized ? `${normalized} kg` : undefined;
};

const formatHeight = (value?: number | null) => {
  const normalized = formatNumber(value);
  return normalized ? `${normalized} cm` : undefined;
};

const normalizeImage = (photo?: string | null) => {
  const normalized = photo?.trim();
  return normalized ? normalized : undefined;
};

const normalizeDescription = (description?: string | null) => {
  const normalized = description?.trim();
  return normalized ? normalized : "";
};

const normalizeOptionalText = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const resolveAdoptedByDisplayName = (
  adoptedBy?: PetAdoptedByUser | string | null,
) => {
  if (!adoptedBy) {
    return undefined;
  }

  if (typeof adoptedBy === "string") {
    return normalizeOptionalText(adoptedBy);
  }

  const nameParts = [
    normalizeOptionalText(adoptedBy.firstName),
    normalizeOptionalText(adoptedBy.middleName),
    normalizeOptionalText(adoptedBy.lastName),
  ].filter(Boolean);
  const fullName = nameParts.join(" ").trim();

  if (fullName) {
    return fullName;
  }

  return normalizeOptionalText(adoptedBy.email);
};

const resolveAdoptedByAvatar = (
  adoptedBy?: PetAdoptedByUser | string | null,
) => {
  if (!adoptedBy || typeof adoptedBy === "string") {
    return undefined;
  }

  return normalizeOptionalText(adoptedBy.profilePicture);
};

const normalizeAdoptionRequestStatus = (status?: string | null) => {
  const normalized = status?.trim();
  return normalized ? normalized.toUpperCase() : undefined;
};

const resolveAdoptionRequestPetId = (adoptionRequest: AdoptionRequestApiItem) => {
  const directPetId = normalizeOptionalText(adoptionRequest.petId);

  if (directPetId) {
    return directPetId;
  }

  const nestedPetId = adoptionRequest.pet?.id;

  return typeof nestedPetId === "string" && nestedPetId.trim()
    ? nestedPetId.trim()
    : undefined;
};

const formatDisplayDate = (value?: string | null) => {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return undefined;
  }

  const parsedDate = new Date(normalized);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalized;
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (value?: string | null) => {
  const normalized = normalizeOptionalText(value);

  if (!normalized) {
    return undefined;
  }

  return normalized
    .toLowerCase()
    .split("_")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
};

const resolvePetVideoUrl = (pet: PetApiItem) => {
  const singleVideo = pet.video?.trim();

  if (singleVideo) {
    return singleVideo;
  }

  const legacyFirstVideo = pet.videos
    ?.split(",")
    .map((value) => value.trim())
    .find(Boolean);

  return legacyFirstVideo;
};

const mapVideoToMedia = (pet: PetApiItem): PetMediaItem[] => {
  const videoUrl = resolvePetVideoUrl(pet);

  if (!videoUrl) {
    return [];
  }

  return [
    {
      id: `${pet.id}-video-1`,
      type: "video",
      videoUrl,
    },
  ];
};

const mapPetToListingItem = (
  pet: PetApiItem,
  favoritePetIds: Set<string>,
): PetListingItem => {
  const type = normalizeType(pet.type);
  const normalizedBreed = pet.race?.trim() || (type === "cat" ? "Cat" : "Dog");

  return {
    age: formatAge(pet.age, pet.birthDate) ?? "",
    breed: normalizedBreed,
    id: pet.id,
    image: normalizeImage(pet.photo),
    isFavorite: favoritePetIds.has(pet.id),
    location: FALLBACK_PET_LOCATION,
    name: pet.name?.trim() || "Unnamed pet",
    sex: normalizeGender(pet.gender),
    status: normalizePetStatus(pet.status),
    type,
    vaccinated: Boolean(pet.isVaccinated),
  };
};

const mapPetToDetailsItem = (
  pet: PetApiItem,
  favoritePetIds: Set<string>,
): PetDetailsItem => {
  const adoptedByName = resolveAdoptedByDisplayName(pet.adoptedBy);

  return {
    adoptionDate: formatDisplayDate(pet.adoptionDate),
    age: (formatAge(pet.age, pet.birthDate)?.replace(" old", "") ?? ""),
    birthDate: formatDisplayDate(pet.birthDate),
    breed: normalizeOptionalText(pet.race),
    description: normalizeDescription(pet.description),
    distance: FALLBACK_PET_DISTANCE,
    fosterAvatar: resolveAdoptedByAvatar(pet.adoptedBy),
    fosterName: adoptedByName,
    fosterRole: adoptedByName ? "Adopted by" : undefined,
    height: formatHeight(pet.height) ?? "",
    id: pet.id,
    image: normalizeImage(pet.photo),
    isFavorite: favoritePetIds.has(pet.id),
    location: `In ${FALLBACK_PET_LOCATION}`,
    media: mapVideoToMedia(pet),
    name: pet.name?.trim() || "Unnamed pet",
    rescuedDate: formatDisplayDate(pet.rescuedDate),
    sex: normalizeGender(pet.gender),
    status: formatStatus(pet.status),
    type: normalizeType(pet.type),
    vaccinated: Boolean(pet.isVaccinated),
    weight: formatWeight(pet.weight) ?? "",
  };
};

const fetchFavoritePets = async ({
  token,
  userId,
}: PetAuthParams): Promise<PetApiItem[]> => {
  try {
    return await petService.getUserFavoritePets({ token, userId });
  } catch (error) {
    if (error instanceof ApiError) {
      console.warn(
        `[pets.data] Favorites fetch skipped due to ${error.status}. Continuing with non-favorite listing.`,
      );
      return [];
    }

    console.warn(
      "[pets.data] Favorites fetch failed with a non-API error. Continuing with non-favorite listing.",
      error,
    );
    return [];
  }
};

const fetchFavoritePetIds = async (params: PetAuthParams): Promise<Set<string>> => {
  const favorites = await fetchFavoritePets(params);
  return new Set(favorites.map((pet) => pet.id));
};

const mergePetSources = (
  favoritePets: PetApiItem[],
  listedPets: PetApiItem[],
): PetApiItem[] => {
  const petsById = new Map<string, PetApiItem>();

  for (const favoritePet of favoritePets) {
    petsById.set(favoritePet.id, favoritePet);
  }

  for (const listedPet of listedPets) {
    const existingPet = petsById.get(listedPet.id);

    if (!existingPet) {
      petsById.set(listedPet.id, listedPet);
      continue;
    }

    // Keep one entry per pet id while preferring latest listing details.
    petsById.set(listedPet.id, {
      ...existingPet,
      ...listedPet,
      id: listedPet.id,
    });
  }

  return Array.from(petsById.values());
};

const normalizeListingPagination = (
  pagination: PetPagination,
): PetListingPagination => ({
  first: pagination.first,
  ignorePagination: pagination.ignorePagination,
  last: pagination.last,
  page: pagination.page,
  size: pagination.size,
  sortBy: pagination.sortBy,
  sortDirection: pagination.sortDirection,
  totalElements: pagination.totalElements,
  totalPages: pagination.totalPages,
});

export const fetchPetListingPage = async ({
  ignorePagination,
  page,
  size,
  sortBy,
  sortDirection,
  token,
  userId,
}: FetchPetListingPageParams): Promise<PetListingPage> => {
  const [listedPetsResponse, favoritePets] = await Promise.all([
    petService.getPets({
      ignorePagination,
      page,
      size,
      sortBy,
      sortDirection,
      token,
    }),
    fetchFavoritePets({ token, userId }),
  ]);
  const favoritePetIds = new Set(favoritePets.map((pet) => pet.id));
  const mergedPets = mergePetSources(favoritePets, listedPetsResponse.items);

  return {
    items: mergedPets.map((pet) => mapPetToListingItem(pet, favoritePetIds)),
    pagination: normalizeListingPagination(listedPetsResponse.pagination),
  };
};

export const fetchPetListingItems = async ({
  token,
  userId,
}: PetAuthParams): Promise<PetListingItem[]> => {
  const listingPage = await fetchPetListingPage({
    ignorePagination: true,
    page: 0,
    token,
    userId,
  });

  return listingPage.items;
};

export const fetchPetDetailsItem = async ({
  petId,
  token,
  userId,
}: FetchPetDetailsParams): Promise<PetDetailsItem> => {
  const [pet, favoritePetIds] = await Promise.all([
    petService.getPetById({ petId, token }),
    fetchFavoritePetIds({ token, userId }),
  ]);

  return mapPetToDetailsItem(pet, favoritePetIds);
};

export const updatePetFavorite = async ({
  favorited,
  petId,
  token,
  userId,
}: SetPetFavoriteParams): Promise<boolean> => {
  return favorited
    ? petService.addFavorite({ petId, token, userId })
    : petService.removeFavorite({ petId, token, userId });
};

export const createPetAdoptionRequest = async ({
  message,
  petId,
  token,
  userId,
}: CreatePetAdoptionRequestParams) => {
  return petService.createAdoptionRequest({
    message,
    petId,
    token,
    userId,
  });
};

export const cancelPendingPetAdoptionRequest = async ({
  petId,
  reviewNotes,
  token,
  userId,
}: CancelPendingPetAdoptionRequestParams) => {
  const adoptionRequests = await petService.getUserAdoptionRequests({
    token,
    userId,
  });
  const pendingAdoptionRequest = adoptionRequests.find((adoptionRequest) => {
    const requestPetId = resolveAdoptionRequestPetId(adoptionRequest);
    const requestStatus = normalizeAdoptionRequestStatus(adoptionRequest.status);

    return requestPetId === petId && requestStatus === "PENDING";
  });

  if (!pendingAdoptionRequest) {
    throw new Error("No pending adoption request found for this pet.");
  }

  return petService.updateAdoptionRequestStatus({
    requestId: pendingAdoptionRequest.id,
    reviewNotes,
    status: "CANCELLED",
    token,
    userId,
  });
};
