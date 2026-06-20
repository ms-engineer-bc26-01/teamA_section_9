/**
 * フロントエンドAPIエラーの型定義
 * 通信エラー・認証エラー・AI処理エラーの3カテゴリを扱う
 */

/** エラーカテゴリー */
export type ErrorCategory = "network" | "auth" | "ai" | "api" | "unknown";

/** APIエラーの基本型 */
export type AppError = {
  /** エラーカテゴリー */
  category: ErrorCategory;
  /** HTTPステータスコード（HTTP経由のエラーの場合） */
  statusCode?: number;
  /** ユーザー向けメッセージ */
  message: string;
  /** デバッグ用の元エラー */
  originalError?: unknown;
};

/** ネットワーク・通信エラー */
export type NetworkError = AppError & {
  category: "network";
};

/** 認証エラー（401 / 403） */
export type AuthError = AppError & {
  category: "auth";
};

/** AI処理エラー */
export type AiError = AppError & {
  category: "ai";
};

/** 一般的なAPIエラー（4xx / 5xx） */
export type ApiError = AppError & {
  category: "api";
};

/** 分類不能なエラー */
export type UnknownError = AppError & {
  category: "unknown";
};
