import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type RequestOptions = {
  headers?: HeadersInit;
};

const waitForCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const user = auth.currentUser ?? (await waitForCurrentUser());

  if (!user) {
    return {};
  }

  const idToken = await user.getIdToken();

  return {
    Authorization: `Bearer ${idToken}`,
  };
};

const buildApiUrl = (path: string) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined.");
  }

  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

const request = async <TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> => {
  const authHeaders = await getAuthHeaders();

  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const errorBody = await response.json();
      message = errorBody.message ?? errorBody.error ?? message;
    } catch {
      // JSON以外のエラーはそのまま扱う
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
};

export const apiClient = {
  get: async <TResponse>(path: string, options?: RequestOptions) => {
    return request<TResponse>(path, {
      method: "GET",
      headers: options?.headers,
    });
  },

  post: async <TResponse, TRequest = unknown>(
    path: string,
    body: TRequest,
    options?: RequestOptions,
  ) => {
    return request<TResponse>(path, {
      method: "POST",
      body: JSON.stringify(body),
      headers: options?.headers,
    });
  },
};
