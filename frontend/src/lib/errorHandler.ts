import type {
  AppError,
  AppErrorCategory,
  ErrorFallbackContent,
} from "@/types/error";

type CreateAppErrorInput = {
  category: AppErrorCategory;
  message: string;
  details?: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
};

const APP_ERROR_NAME = "AppError";

const DEFAULT_MESSAGES: Record<AppErrorCategory, string> = {
  api: "データの取得または保存に失敗しました。時間をおいて再度お試しください。",
  network:
    "ネットワークに接続できませんでした。通信環境を確認して再度お試しください。",
  auth: "認証に失敗しました。再度ログインしてからもう一度お試しください。",
  ai: "AIの処理に失敗しました。少し時間をおいてから再試行してください。",
};

const ERROR_FALLBACK_CONTENT: Record<AppErrorCategory, ErrorFallbackContent> = {
  api: {
    category: "api",
    title: "データの読み込みに失敗しました",
    message: DEFAULT_MESSAGES.api,
    guidance: [
      "ページを再読み込みして、もう一度操作してください。",
      "何度も続く場合は時間をおいてから再度お試しください。",
    ],
    actionLabel: "再試行する",
  },
  network: {
    category: "network",
    title: "通信エラーが発生しました",
    message: DEFAULT_MESSAGES.network,
    guidance: [
      "Wi-Fi やモバイル通信の接続状況を確認してください。",
      "通信が安定したあとに、もう一度お試しください。",
    ],
    actionLabel: "再試行する",
  },
  auth: {
    category: "auth",
    title: "認証エラーが発生しました",
    message: DEFAULT_MESSAGES.auth,
    guidance: [
      "ログイン状態が切れていないか確認してください。",
      "再ログイン後に同じ操作をやり直してください。",
    ],
    actionLabel: "再試行する",
  },
  ai: {
    category: "ai",
    title: "AIの提案を生成できませんでした",
    message: DEFAULT_MESSAGES.ai,
    guidance: [
      "入力内容や対象データを確認してから再試行してください。",
      "しばらく待っても改善しない場合は別の時間にお試しください。",
    ],
    actionLabel: "もう一度試す",
  },
};

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getStringValue = (value: unknown) => {
  return typeof value === "string" ? value : undefined;
};

const getNumberValue = (value: unknown) => {
  return typeof value === "number" ? value : undefined;
};

const inferCategoryFromError = (
  error: unknown,
  fallbackMessage?: string,
): AppErrorCategory => {
  const message = [
    fallbackMessage,
    error instanceof Error ? error.message : undefined,
    isObject(error) ? getStringValue(error.message) : undefined,
    isObject(error) ? getStringValue(error.code) : undefined,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" ");

  const statusCode = isObject(error)
    ? getNumberValue(error.statusCode) ?? getNumberValue(error.status)
    : undefined;

  if (statusCode === 401 || statusCode === 403) {
    return "auth";
  }

  if (
    /network|failed to fetch|load failed|offline|connection|fetch/i.test(message)
  ) {
    return "network";
  }

  if (/401|403|unauthorized|forbidden|token|認証|権限|期限切れ/i.test(message)) {
    return "auth";
  }

  if (/ai|suggestion|summary|response|解析|提案|生成/i.test(message)) {
    return "ai";
  }

  return "api";
};

/**
 * AppError を構築して画面側で安全に扱える共通形に揃える。
 */
export const createAppError = ({
  category,
  message,
  details,
  code,
  statusCode,
  originalError,
}: CreateAppErrorInput): AppError => {
  return {
    name: APP_ERROR_NAME,
    category,
    message,
    details,
    code,
    statusCode,
    originalError,
  } as AppError;
};

export const isAppError = (error: unknown): error is AppError => {
  return (
    isObject(error) &&
    error.name === APP_ERROR_NAME &&
    typeof error.category === "string" &&
    typeof error.message === "string"
  );
};

/**
 * unknown な例外を AppError に正規化する。
 * 既に AppError ならそのまま返し、それ以外は message / status から分類する。
 */
export const classifyApiError = (
  error: unknown,
  fallbackMessage?: string,
): AppError => {
  if (isAppError(error)) {
    return error;
  }

  const category = inferCategoryFromError(error, fallbackMessage);
  const rawMessage =
    (error instanceof Error ? error.message : undefined) ??
    (isObject(error) ? getStringValue(error.message) : undefined);
  const message =
    category === "api" && fallbackMessage
      ? fallbackMessage
      : DEFAULT_MESSAGES[category];
  const statusCode = isObject(error)
    ? getNumberValue(error.statusCode) ?? getNumberValue(error.status)
    : undefined;
  const code = isObject(error) ? getStringValue(error.code) : undefined;

  return createAppError({
    category,
    message,
    details: rawMessage,
    statusCode,
    code,
    originalError: error,
  });
};

/**
 * エラーカテゴリーに応じた UI 文言とアクションガイダンスを返す。
 */
export const getErrorFallbackContent = (
  error: unknown,
): ErrorFallbackContent => {
  const normalizedError = classifyApiError(error);
  const content = ERROR_FALLBACK_CONTENT[normalizedError.category];

  return {
    ...content,
    message: normalizedError.message || content.message,
  };
};

/**
 * 開発時に category / code / status をまとめて確認できるよう統一ログを出す。
 */
export const logError = (error: unknown, context?: string) => {
  const normalizedError = classifyApiError(error);

  console.error("[app-error]", {
    context,
    category: normalizedError.category,
    statusCode: normalizedError.statusCode,
    code: normalizedError.code,
    message: normalizedError.message,
    details: normalizedError.details,
    originalError: normalizedError.originalError,
  });
};
