/**
 * フロントエンド全体で共通利用する API エラーの分類。
 * 画面側は category を見て、適切なフォールバック UI を表示する。
 */
export type AppErrorCategory = "api" | "network" | "auth" | "ai";

type AppErrorBase = {
  name: "AppError";
  category: AppErrorCategory;
  message: string;
  details?: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
};

export type ApiError = AppErrorBase & {
  category: "api";
};

export type NetworkError = AppErrorBase & {
  category: "network";
};

export type AuthError = AppErrorBase & {
  category: "auth";
  statusCode?: 401 | 403;
};

export type AiProcessingError = AppErrorBase & {
  category: "ai";
};

export type AppError = ApiError | NetworkError | AuthError | AiProcessingError;

export type ErrorFallbackContent = {
  category: AppErrorCategory;
  title: string;
  message: string;
  guidance: string[];
  actionLabel: string;
};
