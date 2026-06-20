/**
 * APIエラーハンドラーユーティリティ
 * エラーをカテゴリーに分類し、ユーザー向けメッセージとアクションガイダンスを提供する
 */

import type { AppError, ErrorCategory } from "@/types/error";

/** エラーカテゴリーごとのUI表示情報 */
export type ErrorDisplayInfo = {
  /** 表示タイトル */
  title: string;
  /** 詳細メッセージ */
  detail: string;
  /** ユーザーへのアクションガイダンス */
  guidance: string;
  /** リトライ可能かどうか */
  canRetry: boolean;
};

/** カテゴリーごとのデフォルト表示情報 */
const ERROR_DISPLAY_MAP: Record<ErrorCategory, ErrorDisplayInfo> = {
  network: {
    title: "通信エラー",
    detail: "ネットワークに接続できませんでした。",
    guidance:
      "インターネット接続を確認してから、もう一度お試しください。",
    canRetry: true,
  },
  auth: {
    title: "認証エラー",
    detail: "ログインセッションが無効または期限切れです。",
    guidance: "再度ログインしてからお試しください。",
    canRetry: false,
  },
  ai: {
    title: "AI処理エラー",
    detail: "AIによる分析処理に失敗しました。",
    guidance:
      "しばらく時間をおいてから再度お試しください。問題が続く場合はサポートまでお問い合わせください。",
    canRetry: true,
  },
  api: {
    title: "サーバーエラー",
    detail: "サーバーで問題が発生しました。",
    guidance: "しばらく時間をおいてから再度お試しください。",
    canRetry: true,
  },
  unknown: {
    title: "予期しないエラー",
    detail: "予期しないエラーが発生しました。",
    guidance: "ページをリロードして、再度お試しください。",
    canRetry: true,
  },
};

/**
 * AppError からUI表示情報を取得する
 */
export const getErrorDisplayInfo = (error: AppError): ErrorDisplayInfo => {
  const base = ERROR_DISPLAY_MAP[error.category];
  // サーバーから具体的なメッセージが取れている場合は detail に反映する
  return {
    ...base,
    detail: error.message || base.detail,
  };
};

/**
 * 任意のエラー値を AppError に変換する
 */
export const toAppError = (error: unknown): AppError => {
  // すでに AppError 形式の場合はそのまま返す
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return classifyError(error);
  }

  return {
    category: "unknown",
    message: "予期しないエラーが発生しました。",
    originalError: error,
  };
};

/**
 * Error オブジェクトをエラーカテゴリーに分類して AppError を返す
 */
const classifyError = (error: Error): AppError => {
  const message = error.message ?? "";

  // ネットワーク / タイムアウト系
  if (
    error.name === "TypeError" ||
    message.includes("Failed to fetch") ||
    message.includes("Network request failed") ||
    message.includes("network") ||
    error.name === "AbortError" ||
    message.includes("timeout") ||
    message.includes("Timeout")
  ) {
    return {
      category: "network",
      message: "ネットワークに接続できませんでした。通信環境をご確認ください。",
      originalError: error,
    };
  }

  // 認証エラー（ステータスコードがメッセージに含まれるケース）
  if (
    message.includes("401") ||
    message.includes("403") ||
    message.toLowerCase().includes("unauthorized") ||
    message.toLowerCase().includes("forbidden") ||
    message.includes("トークン")
  ) {
    return {
      category: "auth",
      statusCode: message.includes("403") ? 403 : 401,
      message: "認証に失敗しました。再度ログインしてください。",
      originalError: error,
    };
  }

  // AI処理エラー
  if (
    message.toLowerCase().includes("ai") ||
    message.includes("AI") ||
    message.toLowerCase().includes("suggestion") ||
    message.includes("提案") ||
    message.includes("分析")
  ) {
    return {
      category: "ai",
      message: "AI処理に失敗しました。しばらくお待ちください。",
      originalError: error,
    };
  }

  // その他のAPIエラー
  return {
    category: "api",
    message: message || "サーバーエラーが発生しました。",
    originalError: error,
  };
};

/**
 * 値が AppError かどうかを判定する型ガード
 */
export const isAppError = (value: unknown): value is AppError => {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "message" in value
  );
};

/**
 * デバッグ用にエラー情報をコンソール出力する
 */
export const logError = (error: AppError, context?: string): void => {
  const prefix = context ? `[${context}]` : "[ErrorHandler]";
  console.error(`${prefix} category=${error.category}`, {
    message: error.message,
    statusCode: error.statusCode,
    originalError: error.originalError,
  });
};
