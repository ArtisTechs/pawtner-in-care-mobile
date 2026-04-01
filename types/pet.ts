export type PetStatus =
  | "ADOPTED"
  | "AVAILABLE_FOR_ADOPTION"
  | "ONGOING_ADOPTION"
  | "RESCUED";

export type PetAdoptedByUser = {
  id?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  profilePicture?: string | null;
};

export type PetApiItem = {
  age?: number | null;
  adoptionDate?: string | null;
  adoptedBy?: PetAdoptedByUser | string | null;
  birthDate?: string | null;
  description?: string | null;
  gender?: string | null;
  height?: number | null;
  id: string;
  isVaccinated?: boolean | null;
  name?: string | null;
  photo?: string | null;
  race?: string | null;
  rescuedDate?: string | null;
  status?: PetStatus | string | null;
  type?: string | null;
  video?: string | null;
  videos?: string | null;
  weight?: number | null;
};

export type PetSortDirection = "asc" | "desc";

export type PetPagination = {
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

export type PetListResponse = {
  items: PetApiItem[];
  pagination: PetPagination;
};

export type PetMutationPayload = {
  adoptionDate?: string | null;
  birthDate?: string | null;
  description?: string | null;
  gender: string;
  height?: number | null;
  isVaccinated?: boolean | null;
  name: string;
  photo?: string | null;
  rescuedDate?: string | null;
  status: PetStatus;
  type: string;
  video?: string | null;
  weight?: number | null;
};

export type PetTokenParams = {
  token: string;
};

export type GetPetsParams = PetTokenParams & {
  ignorePagination?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: PetSortDirection;
};

export type GetPetByIdParams = PetTokenParams & {
  petId: string;
};

export type CreatePetParams = PetTokenParams & {
  payload: PetMutationPayload;
};

export type UpdatePetParams = PetTokenParams & {
  payload: PetMutationPayload;
  petId: string;
};

export type DeletePetParams = PetTokenParams & {
  petId: string;
};

export type PetFavoriteParams = PetTokenParams & {
  petId: string;
  userId: string;
};

export type GetUserFavoritePetsParams = PetTokenParams & {
  userId: string;
};

export type FavoriteMutationResponse = {
  favorited?: boolean;
};

export type CreateAdoptionRequestPayload = {
  message?: string;
};

export type AdoptionRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

type AdoptionRequestPetReference = {
  id?: string | null;
} | null;

export type AdoptionRequestApiItem = {
  id: string;
  requestNumber?: string | null;
  status?: AdoptionRequestStatus | string | null;
  message?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  petId?: string | null;
  pet?: AdoptionRequestPetReference;
};

export type CreateAdoptionRequestParams = PetTokenParams & {
  petId: string;
  userId: string;
  message?: string;
};

export type GetUserAdoptionRequestsParams = PetTokenParams & {
  userId: string;
};

export type UpdateAdoptionRequestStatusPayload = {
  status: Exclude<AdoptionRequestStatus, "PENDING">;
  reviewNotes?: string;
};

export type UpdateAdoptionRequestStatusParams = PetTokenParams & {
  requestId: string;
  userId: string;
} & UpdateAdoptionRequestStatusPayload;
