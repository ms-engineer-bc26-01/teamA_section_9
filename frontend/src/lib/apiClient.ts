import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { AppError } from "@/types/error";
import { logError } from "@/lib/errorHandler";

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

  let response: Response;
  try {
    response = await fetch(buildApiUrl(path), {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options.headers,
      },
    });
  } catch (fetchError) {
    // ネットワーク障害
    const networkError: AppError = {
      category: "network",
      message:
        "ネットワークに接続できませんでした。通信環境を確認して再度お試しください。",
      originalError: fetchError,
    };
    logError(networkError, "apiClient");
    throw networkError;
  }

  if (!response.ok) {
    let serverMessage = `API request failed: ${response.status}`;

    try {
      const errorBody = await response.json();
      serverMessage = errorBody.message ?? errorBody.error ?? serverMessage;
    } catch {
      // JSON以外のエラーはそのまま扱う
    }

    // 認証エラー
    if (response.status === 401 || response.status === 403) {
      const authError: AppError = {
        category: "auth",
        statusCode: response.status,
        message:
          response.status === 403
            ? "このリソースへのアクセス権がありません。"
            : "認証に失敗しました。再度ログインしてください。",
        originalError: new Error(serverMessage),
      };
      logError(authError, "apiClient");
      throw authError;
    }

    // AI処理エラー（AIエンドポイントからの 5xx）
    if (
      response.status >= 500 &&
      (path.includes("suggestion") || path.includes("ai"))
    ) {
      const aiError: AppError = {
        category: "ai",
        statusCode: response.status,
        message: serverMessage,
        originalError: new Error(serverMessage),
      };
      logError(aiError, "apiClient");
      throw aiError;
    }

    // その他のAPIエラー
    const apiError: AppError = {
      category: "api",
      statusCode: response.status,
      message: serverMessage,
      originalError: new Error(serverMessage),
    };
    logError(apiError, "apiClient");
    throw apiError;
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

  patch: async <TResponse, TRequest = unknown>(
    path: string,
    body: TRequest,
    options?: RequestOptions,
  ) => {
    return request<TResponse>(path, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: options?.headers,
    });
  },

  delete: async <TResponse = void>(path: string, options?: RequestOptions) => {
    return request<TResponse>(path, {
      method: "DELETE",
      headers: options?.headers,
    });
  },
};
