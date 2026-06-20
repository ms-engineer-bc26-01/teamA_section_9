/**
 * ErrorFallback コンポーネント
 * APIエラー発生時に表示するフォールバックUI
 * エラーカテゴリー（通信・認証・AI・その他）ごとに異なるメッセージとアクションを表示する
 */

import { Button } from "@/components/common/Button";
import { getErrorDisplayInfo } from "@/lib/errorHandler";
import type { AppError } from "@/types/error";

type ErrorFallbackProps = {
  /** 表示するエラー情報 */
  error: AppError;
  /** リトライ時のコールバック（省略可） */
  onRetry?: () => void;
  /** ログイン画面へ遷移するコールバック（認証エラー時に使用、省略可） */
  onLogin?: () => void;
};

/** エラーカテゴリーごとの絵文字アイコン */
const CATEGORY_ICON: Record<AppError["category"], string> = {
  network: "📡",
  auth: "🔐",
  ai: "🤖",
  api: "⚠️",
  unknown: "❓",
};

/** エラーカテゴリーごとの配色（ライト / ダークモード対応） */
const CATEGORY_COLOR: Record<
  AppError["category"],
  { border: string; bg: string; title: string; icon: string }
> = {
  network: {
    border: "border-blue-100 dark:border-blue-900",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    title: "text-blue-700 dark:text-blue-300",
    icon: "bg-blue-100 dark:bg-blue-900",
  },
  auth: {
    border: "border-amber-100 dark:border-amber-900",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    title: "text-amber-700 dark:text-amber-300",
    icon: "bg-amber-100 dark:bg-amber-900",
  },
  ai: {
    border: "border-rose-100 dark:border-rose-900",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    title: "text-rose-700 dark:text-rose-300",
    icon: "bg-rose-100 dark:bg-rose-900",
  },
  api: {
    border: "border-red-100 dark:border-red-900",
    bg: "bg-red-50 dark:bg-red-950/30",
    title: "text-red-700 dark:text-red-300",
    icon: "bg-red-100 dark:bg-red-900",
  },
  unknown: {
    border: "border-gray-100 dark:border-gray-800",
    bg: "bg-gray-50 dark:bg-gray-900/30",
    title: "text-gray-700 dark:text-gray-300",
    icon: "bg-gray-100 dark:bg-gray-800",
  },
};

/**
 * APIエラー時のフォールバックUIコンポーネント
 *
 * @example
 * <ErrorFallback
 *   error={appError}
 *   onRetry={handleRetry}
 *   onLogin={() => router.push("/login")}
 * />
 */
export const ErrorFallback = ({
  error,
  onRetry,
  onLogin,
}: ErrorFallbackProps) => {
  const info = getErrorDisplayInfo(error);
  const icon = CATEGORY_ICON[error.category];
  const color = CATEGORY_COLOR[error.category];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`rounded-2xl border p-4 ${color.border} ${color.bg}`}
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${color.icon}`}
          aria-hidden="true"
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          {/* タイトル */}
          <p className={`text-sm font-bold ${color.title}`}>{info.title}</p>

          {/* 詳細メッセージ */}
          <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
            {info.detail}
          </p>

          {/* アクションガイダンス */}
          <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-500">
            💡 {info.guidance}
          </p>

          {/* アクションボタン */}
          <div className="mt-3 flex flex-wrap gap-2">
            {/* 認証エラー時はログインボタンを優先表示 */}
            {error.category === "auth" && onLogin && (
              <Button size="sm" variant="primary" onClick={onLogin}>
                ログインし直す
              </Button>
            )}

            {/* リトライ可能な場合はリトライボタンを表示 */}
            {info.canRetry && onRetry && (
              <Button size="sm" variant="secondary" onClick={onRetry}>
                再試行する
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
