const AUTH_BASE_PATH = "/auth";
const DONATION_CAMPAIGNS_BASE_PATH = "/donation-campaigns";
const PAYMENT_MODES_BASE_PATH = "/payment-modes";
const PETS_BASE_PATH = "/pets";
const USERS_BASE_PATH = "/users";
const ADOPTION_REQUESTS_BASE_PATH = "/adoption-requests";
const COMMUNITY_POSTS_BASE_PATH = "/community/posts";

export const API_ENDPOINTS = {
  auth: {
    base: AUTH_BASE_PATH,
    confirmOtp: `${AUTH_BASE_PATH}/confirm-otp`,
    login: `${AUTH_BASE_PATH}/login`,
    resetPassword: `${AUTH_BASE_PATH}/reset-password`,
    sendOtp: `${AUTH_BASE_PATH}/send-otp`,
    signUp: `${AUTH_BASE_PATH}/signup`,
  },
  donationCampaigns: {
    base: DONATION_CAMPAIGNS_BASE_PATH,
    byId: (id: string) =>
      `${DONATION_CAMPAIGNS_BASE_PATH}/${encodeURIComponent(id)}`,
    types: `${DONATION_CAMPAIGNS_BASE_PATH}/types`,
  },
  paymentModes: {
    base: PAYMENT_MODES_BASE_PATH,
    byId: (id: string) =>
      `${PAYMENT_MODES_BASE_PATH}/${encodeURIComponent(id)}`,
  },
  pets: {
    base: PETS_BASE_PATH,
    byId: (id: string) => `${PETS_BASE_PATH}/${encodeURIComponent(id)}`,
    adoptionRequests: (petId: string) =>
      `${PETS_BASE_PATH}/${encodeURIComponent(petId)}/adoption-requests`,
    favorites: (petId: string) =>
      `${PETS_BASE_PATH}/${encodeURIComponent(petId)}/favorites`,
  },
  users: {
    base: USERS_BASE_PATH,
    adoptionRequests: (userId: string) =>
      `${USERS_BASE_PATH}/${encodeURIComponent(userId)}/adoption-requests`,
    byId: (id: string) => `${USERS_BASE_PATH}/${encodeURIComponent(id)}`,
    favoritePets: (userId: string) =>
      `${USERS_BASE_PATH}/${encodeURIComponent(userId)}/favorite-pets`,
  },
  adoptionRequests: {
    base: ADOPTION_REQUESTS_BASE_PATH,
    statusById: (requestId: string) =>
      `${ADOPTION_REQUESTS_BASE_PATH}/${encodeURIComponent(requestId)}/status`,
  },
  community: {
    base: COMMUNITY_POSTS_BASE_PATH,
    byId: (postId: string) =>
      `${COMMUNITY_POSTS_BASE_PATH}/${encodeURIComponent(postId)}`,
    likes: (postId: string) =>
      `${COMMUNITY_POSTS_BASE_PATH}/${encodeURIComponent(postId)}/likes`,
    comments: (postId: string) =>
      `${COMMUNITY_POSTS_BASE_PATH}/${encodeURIComponent(postId)}/comments`,
    commentById: (postId: string, commentId: string) =>
      `${COMMUNITY_POSTS_BASE_PATH}/${encodeURIComponent(postId)}/comments/${encodeURIComponent(
        commentId,
      )}`,
  },
} as const;
