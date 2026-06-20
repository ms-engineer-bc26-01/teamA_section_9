"use client";

import { Button } from "@/components/common/Button";
import { getErrorFallbackContent, classifyApiError } from "@/lib/errorHandler";
import { cn } from "@/lib/utils";
import type { AppError } from "@/types/error";

type ErrorFallbackProps = {
  error: AppError | unknown;
  onRetry?: () => void | Promise<void>;
  isRetrying?: boolean;
  className?: string;
};

const ERROR_ICONS = {
  api: "⚠️",
  network: "📡",
  auth: "🔐",
  ai: "🤖",
} as const;

/**
 * API エラー時のフォールバック UI。
 * category ごとに見出し・案内文を切り替え、次のアクションを明確に伝える。
 */
export const ErrorFallback = ({
  error,
  onRetry,
  isRetrying = false,
  className,
}: ErrorFallbackProps) => {
  const normalizedError = classifyApiError(error);
  const content = getErrorFallbackContent(normalizedError);
  const details =
    normalizedError.details &&
    normalizedError.details !== normalizedError.message &&
    normalizedError.details !== content.message
      ? normalizedError.details
      : null;

  return (
    <section
      role="alert"
      aria-live="assertive"
      className={cn(
        "rounded-3xl border border-red-200 bg-red-50/90 p-5 shadow-sm dark:border-red-900/70 dark:bg-red-950/40",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-red-900/70"
        >
          {ERROR_ICONS[content.category]}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-[0.2em] text-red-500 uppercase dark:text-red-300">
              {content.title}
            </p>

            <h2 className="text-base font-bold text-red-900 dark:text-red-50">
              {content.message}
            </h2>

            {details && (
              <p className="text-sm leading-6 text-red-700 dark:text-red-200">
                {details}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-white/80 p-4 dark:bg-red-950/60">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              次にお試しください
            </p>

            <ul className="mt-2 space-y-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
              {content.guidance.map((guide) => (
                <li key={guide} className="flex gap-2">
                  <span aria-hidden="true" className="text-red-500">
                    •
                  </span>
                  <span>{guide}</span>
                </li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => void onRetry()}
                disabled={isRetrying}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-400 dark:active:bg-red-300"
              >
                {isRetrying ? "再試行中..." : content.actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
