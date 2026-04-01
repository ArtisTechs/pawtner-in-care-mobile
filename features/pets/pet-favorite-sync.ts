export type PetFavoriteChangedPayload = {
  favorited: boolean;
  petId: string;
};

type PetFavoriteChangedListener = (payload: PetFavoriteChangedPayload) => void;

const listeners = new Set<PetFavoriteChangedListener>();

export const emitPetFavoriteChanged = (payload: PetFavoriteChangedPayload) => {
  for (const listener of listeners) {
    try {
      listener(payload);
    } catch (error) {
      console.warn("[pet-favorite-sync] Listener failed", error);
    }
  }
};

export const subscribePetFavoriteChanged = (
  listener: PetFavoriteChangedListener,
) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};
