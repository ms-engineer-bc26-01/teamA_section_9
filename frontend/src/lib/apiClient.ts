import { API_BASE_URL } from "@/lib/constants";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  headers?: HeadersInit;
};

export class ApiClientError extends Error {
  status: number;
  response?: unknown;

  constructor(message: string, status: number, response?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.response = response;
  }
}

const request = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { method = "GET", body, headers } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const responseBody = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof responseBody === "object" &&
      responseBody !== null &&
      "message" in responseBody
        ? String(responseBody.message)
        : "APIリクエストに失敗しました。";

    throw new ApiClientError(message, response.status, responseBody);
  }

  return responseBody as T;
};

export const apiClient = {
  get: <T>(path: string, headers?: HeadersInit) =>
    request<T>(path, { method: "GET", headers }),

  post: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: "POST", body, headers }),

  put: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: "PUT", body, headers }),

  patch: <T>(path: string, body?: unknown, headers?: HeadersInit) =>
    request<T>(path, { method: "PATCH", body, headers }),

  delete: <T>(path: string, headers?: HeadersInit) =>
    request<T>(path, { method: "DELETE", headers }),
};
