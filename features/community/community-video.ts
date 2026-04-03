type BuildCommunityVideoHtmlParams = {
  videoUri: string;
  videoMimeType?: string | null;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const inferMimeTypeFromUri = (videoUri: string) => {
  const normalizedUri = videoUri.split("?")[0]?.split("#")[0] ?? "";
  const extension = normalizedUri.slice(normalizedUri.lastIndexOf(".") + 1).toLowerCase();

  switch (extension) {
    case "mp4":
    case "m4v":
      return "video/mp4";
    case "mov":
      return "video/quicktime";
    case "webm":
      return "video/webm";
    case "mkv":
      return "video/x-matroska";
    case "3gp":
      return "video/3gpp";
    default:
      return "";
  }
};

const toCloudinaryMp4Url = (url: string) => {
  if (!/res\.cloudinary\.com/i.test(url) || !/\/video\/upload\//i.test(url)) {
    return null;
  }

  const withFormatTransform = url.replace(/\/video\/upload\//i, "/video/upload/f_mp4/");

  return withFormatTransform.replace(/\.(webm|mov|mkv|m4v)(\?.*)?$/i, ".mp4$2");
};

export const buildCommunityVideoHtml = ({
  videoMimeType,
  videoUri,
}: BuildCommunityVideoHtmlParams) => {
  const normalizedVideoUri = videoUri.trim();
  const normalizedMimeType = videoMimeType?.trim() ?? "";
  const cloudinaryMp4Url = toCloudinaryMp4Url(normalizedVideoUri);
  const inferredMimeType = inferMimeTypeFromUri(normalizedVideoUri);
  const sourceEntries: Array<{ src: string; type?: string }> = [];
  const pushSource = (src: string, type?: string) => {
    const normalizedSrc = src.trim();

    if (!normalizedSrc) {
      return;
    }

    if (sourceEntries.some((entry) => entry.src === normalizedSrc && entry.type === type)) {
      return;
    }

    sourceEntries.push({ src: normalizedSrc, type });
  };

  if (cloudinaryMp4Url) {
    pushSource(cloudinaryMp4Url, "video/mp4");
  }

  if (normalizedMimeType) {
    pushSource(normalizedVideoUri, normalizedMimeType);
  } else if (inferredMimeType) {
    pushSource(normalizedVideoUri, inferredMimeType);
  }

  pushSource(normalizedVideoUri);

  const sourceTags = sourceEntries
    .map((entry) => {
      if (entry.type) {
        return `<source src="${escapeHtml(entry.src)}" type="${escapeHtml(entry.type)}" />`;
      }

      return `<source src="${escapeHtml(entry.src)}" />`;
    })
    .join("\n      ");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background: #0f1f33;
        overflow: hidden;
      }
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
        background: #0f1f33;
      }
    </style>
  </head>
  <body>
    <video controls playsinline preload="metadata" webkit-playsinline>
      ${sourceTags}
    </video>
  </body>
</html>`;
};
