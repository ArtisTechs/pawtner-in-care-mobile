import { CLOUDINARY_CONFIG } from "@/config/env";

type CloudinaryUploadResponse = {
  error?: unknown;
  secure_url?: unknown;
};

type UploadMediaToCloudinaryParams = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

type CloudinaryResourceType = "image" | "video";

const toTrimmedString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const inferFileExtension = (value: string) => {
  const normalized = value.split("?")[0]?.split("#")[0] ?? "";
  const lastDotIndex = normalized.lastIndexOf(".");

  if (lastDotIndex < 0 || lastDotIndex === normalized.length - 1) {
    return "";
  }

  return normalized.slice(lastDotIndex + 1).toLowerCase();
};

const inferMimeTypeFromExtension = (
  resourceType: CloudinaryResourceType,
  extension: string,
) => {
  const ext = extension.trim().toLowerCase();

  if (resourceType === "image") {
    switch (ext) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "webp":
        return "image/webp";
      case "heic":
        return "image/heic";
      default:
        return "";
    }
  }

  switch (ext) {
    case "mp4":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "mkv":
      return "video/x-matroska";
    case "m4v":
      return "video/x-m4v";
    case "3gp":
      return "video/3gpp";
    default:
      return "";
  }
};

const normalizeUploadUri = (uri: string) => {
  const normalizedUri = toTrimmedString(uri);

  if (!normalizedUri) {
    throw new Error("Missing media file URI.");
  }

  if (
    /^([a-z][a-z0-9+.-]*):\/\//i.test(normalizedUri) ||
    /^ph:\/\//i.test(normalizedUri)
  ) {
    return normalizedUri;
  }

  if (normalizedUri.startsWith("/")) {
    return `file://${normalizedUri}`;
  }

  return normalizedUri;
};

const resolveMimeType = (
  resourceType: CloudinaryResourceType,
  mimeType?: string | null,
  fileName?: string | null,
  uri?: string,
) => {
  const normalizedMimeType = toTrimmedString(mimeType);

  if (normalizedMimeType) {
    return normalizedMimeType;
  }

  const extensionFromFileName = inferFileExtension(toTrimmedString(fileName));
  const extensionFromUri = inferFileExtension(toTrimmedString(uri));
  const inferredMimeType =
    inferMimeTypeFromExtension(resourceType, extensionFromFileName) ||
    inferMimeTypeFromExtension(resourceType, extensionFromUri);

  if (inferredMimeType) {
    return inferredMimeType;
  }

  return resourceType === "video" ? "video/mp4" : "image/jpeg";
};

const resolveFileName = (
  resourceType: CloudinaryResourceType,
  fileName?: string | null,
  uri?: string,
) => {
  const normalizedFileName = toTrimmedString(fileName);

  if (normalizedFileName) {
    return normalizedFileName;
  }

  const uriPathSegment = toTrimmedString(uri).split(/[/?#]/).filter(Boolean).pop() ?? "";
  const uriExtension = inferFileExtension(uriPathSegment);

  if (uriExtension) {
    return resourceType === "video"
      ? `community-video-${Date.now()}.${uriExtension}`
      : `community-image-${Date.now()}.${uriExtension}`;
  }

  return resourceType === "video"
    ? `community-video-${Date.now()}.mp4`
    : `community-image-${Date.now()}.jpg`;
};

const getCloudinaryErrorMessage = (payload: CloudinaryUploadResponse) => {
  const rawError = payload.error;

  if (typeof rawError === "string") {
    return rawError.trim();
  }

  if (rawError && typeof rawError === "object") {
    const message = toTrimmedString((rawError as Record<string, unknown>).message);

    if (message) {
      return message;
    }
  }

  return "";
};

const assertCloudinaryConfig = () => {
  if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
    throw new Error(
      "Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
    );
  }
};

const uploadToCloudinary = async (
  resourceType: CloudinaryResourceType,
  { fileName, mimeType, uri }: UploadMediaToCloudinaryParams,
) => {
  assertCloudinaryConfig();

  const normalizedUri = normalizeUploadUri(uri);
  const resolvedFileName = resolveFileName(resourceType, fileName, normalizedUri);
  const resolvedMimeType = resolveMimeType(
    resourceType,
    mimeType,
    resolvedFileName,
    normalizedUri,
  );
  const uploadResourceTypes =
    resourceType === "video"
      ? (["video", "auto"] as const)
      : ([resourceType] as const);
  let latestCloudinaryError = "";

  for (const uploadResourceType of uploadResourceTypes) {
    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      CLOUDINARY_CONFIG.cloudName,
    )}/${uploadResourceType}/upload`;
    const formData = new FormData();

    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

    if (CLOUDINARY_CONFIG.folder) {
      formData.append("folder", CLOUDINARY_CONFIG.folder);
    }

    formData.append(
      "file",
      {
        name: resolvedFileName,
        type: resolvedMimeType,
        uri: normalizedUri,
      } as unknown as Blob,
    );

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    let payload: CloudinaryUploadResponse = {};

    try {
      payload = (await response.json()) as CloudinaryUploadResponse;
    } catch {
      payload = {};
    }

    const cloudinaryError = getCloudinaryErrorMessage(payload);

    if (response.ok) {
      if (typeof payload.secure_url === "string" && payload.secure_url.trim()) {
        return payload.secure_url.trim();
      }

      latestCloudinaryError =
        cloudinaryError ||
        (resourceType === "video"
          ? "Cloudinary upload did not return a valid video URL."
          : "Cloudinary upload did not return a valid image URL.");
      continue;
    }

    latestCloudinaryError =
      cloudinaryError ||
      (resourceType === "video"
        ? "Unable to upload video to Cloudinary."
        : "Unable to upload image to Cloudinary.");
  }

  throw new Error(
    latestCloudinaryError ||
      (resourceType === "video"
        ? "Unable to upload video to Cloudinary."
        : "Unable to upload image to Cloudinary."),
  );
};

export const cloudinaryService = {
  uploadImage(params: UploadMediaToCloudinaryParams) {
    return uploadToCloudinary("image", params);
  },
  uploadVideo(params: UploadMediaToCloudinaryParams) {
    return uploadToCloudinary("video", params);
  },
};
