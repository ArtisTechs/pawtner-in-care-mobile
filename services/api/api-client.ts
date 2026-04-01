import { API_CONFIG } from "@/config/env";

import { ApiError } from "./api-error";

type RequestOptions<TBody> = {
  body?: TBody;
  headers?: Record<string, string>;
  method?: "DELETE" | "GET" | "PATCH" | "POST" | "PUT";
  token?: string;
};

const normalizeToken = (token?: string) => token?.replace(/^Bearer\s+/i, "").trim() ?? "";

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_CONFIG.baseUrl}${normalizedPath}`;
};

const parseResponseBody = (rawBody: string) => {
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
};

async function request<TResponse, TBody = undefined>(
  path: string,
  options: RequestOptions<TBody> = {},
) {
  const method = options.method ?? "GET";
  const url = buildUrl(path);
  const headers = new Headers(options.headers);

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedToken = normalizeToken(options.token);

  if (normalizedToken) {
    headers.set("Authorization", `Bearer ${normalizedToken}`);
  }

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    console.error("[apiClient] Network error", {
      error,
      method,
      url,
    });

    throw new Error(
      `Unable to reach the API. Verify the base URL in config/env.ts or EXPO_PUBLIC_API_BASE_URL. Current base URL: ${API_CONFIG.baseUrl}`,
    );
  }

  const rawBody = await response.text();
  const payload = parseResponseBody(rawBody);

  if (!response.ok) {
    console.error("[apiClient] Request failed", {
      method,
      payload,
      status: response.status,
      statusText: response.statusText,
      url,
    });

    throw ApiError.fromResponse(response.status, payload);
  }

  return payload as TResponse;
}

export const apiClient = {
  delete: <TResponse>(path: string, options?: RequestOptions<undefined>) =>
    request<TResponse>(path, { ...options, method: "DELETE" }),
  get: <TResponse>(path: string, options?: RequestOptions<undefined>) =>
    request<TResponse>(path, { ...options, method: "GET" }),
  patch: <TResponse, TBody>(
    path: string,
    body: TBody,
    options?: RequestOptions<TBody>,
  ) => request<TResponse, TBody>(path, { ...options, body, method: "PATCH" }),
  post: <TResponse, TBody>(
    path: string,
    body: TBody,
    options?: RequestOptions<TBody>,
  ) => request<TResponse, TBody>(path, { ...options, body, method: "POST" }),
  put: <TResponse, TBody>(
    path: string,
    body: TBody,
    options?: RequestOptions<TBody>,
  ) => request<TResponse, TBody>(path, { ...options, body, method: "PUT" }),
};
