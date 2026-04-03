const normalizeStatusToken = (status?: string | null) => {
  const normalized = status?.trim();

  if (!normalized) {
    return undefined;
  }

  return normalized.toUpperCase().replace(/[\s-]+/g, "_");
};

export const normalizePetStatus = (status?: string | null) =>
  normalizeStatusToken(status);

export const isInProgressPetStatus = (status?: string | null) => {
  const normalized = normalizeStatusToken(status);

  return normalized === "ONGOING_ADOPTION" || normalized === "IN_PROGRESS";
};

export const IN_PROGRESS_ADOPTION_LABEL = "ONGOING ADOPTATION...";
