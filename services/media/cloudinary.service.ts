import { CLOUDINARY_CONFIG } from "@/config/env";

type CloudinaryUploadResponse = {
  secure_url?: unknown;
};

type UploadImageToCloudinaryParams = {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
};

const resolveMimeType = (mimeType?: string | null) => {
  if (mimeType?.trim()) {
    return mimeType;
  }

  return "image/jpeg";
};

const resolveFileName = (fileName?: string | null) => {
  if (fileName?.trim()) {
    return fileName;
  }

  return `profile-${Date.now()}.jpg`;
};

export const cloudinaryService = {
  async uploadImage({
    fileName,
    mimeType,
    uri,
  }: UploadImageToCloudinaryParams) {
    if (!CLOUDINARY_CONFIG.cloudName || !CLOUDINARY_CONFIG.uploadPreset) {
      throw new Error(
        "Cloudinary is not configured. Set EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME and EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
    }

    const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(
      CLOUDINARY_CONFIG.cloudName,
    )}/image/upload`;
    const formData = new FormData();

    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);

    if (CLOUDINARY_CONFIG.folder) {
      formData.append("folder", CLOUDINARY_CONFIG.folder);
    }

    formData.append(
      "file",
      {
        name: resolveFileName(fileName),
        type: resolveMimeType(mimeType),
        uri,
      } as unknown as Blob,
    );

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    const payload = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok) {
      throw new Error("Unable to upload profile photo to Cloudinary.");
    }

    if (typeof payload.secure_url !== "string" || !payload.secure_url.trim()) {
      throw new Error("Cloudinary upload did not return a valid image URL.");
    }

    return payload.secure_url.trim();
  },
};
