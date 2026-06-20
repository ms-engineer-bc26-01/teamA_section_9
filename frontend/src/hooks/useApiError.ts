import { useCallback, useMemo, useRef, useState } from "react";
import {
  classifyApiError,
  getErrorFallbackContent,
  logError,
} from "@/lib/errorHandler";
import type { AppError, ErrorFallbackContent } from "@/types/error";

type RetryAction = () => Promise<unknown>;

type HandleApiErrorOptions = {
  fallbackMessage?: string;
  retry?: RetryAction;
  context?: string;
};

type UseApiErrorResult = {
  error: AppError | null;
  content: ErrorFallbackContent | null;
  canRetry: boolean;
  isRetrying: boolean;
  handleError: (error: unknown, options?: HandleApiErrorOptions) => AppError;
  clearError: () => void;
  retry: () => Promise<void>;
};

/**
 * API エラーの正規化・保持・再試行ロジックをまとめるフック。
 */
export const useApiError = (): UseApiErrorResult => {
  const [error, setError] = useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const retryActionRef = useRef<RetryAction | null>(null);

  const handleError = useCallback(
    (nextError: unknown, options?: HandleApiErrorOptions) => {
      const normalizedError = classifyApiError(
        nextError,
        options?.fallbackMessage,
      );

      retryActionRef.current = options?.retry ?? null;
      setCanRetry(options?.retry !== undefined);
      setError(normalizedError);
      logError(normalizedError, options?.context);

      return normalizedError;
    },
    [],
  );

  const clearError = useCallback(() => {
    retryActionRef.current = null;
    setCanRetry(false);
    setError(null);
  }, []);

  const retry = useCallback(async () => {
    if (!retryActionRef.current) {
      return;
    }

    const retryAction = retryActionRef.current;

    setIsRetrying(true);
    setError(null);

    try {
      await retryAction();
    } catch (retryError) {
      handleError(retryError, { retry: retryAction, context: "useApiError" });
    } finally {
      setIsRetrying(false);
    }
  }, [handleError]);

  const content = useMemo(() => {
    return error ? getErrorFallbackContent(error) : null;
  }, [error]);

  return {
    error,
    content,
    canRetry,
    isRetrying,
    handleError,
    clearError,
    retry,
  };
};
