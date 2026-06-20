/**
 * useApiError カスタムフック
 * APIエラーのステートと処理ロジックをカプセル化する
 *
 * @example
 * const { error, handleError, clearError, withErrorHandling } = useApiError();
 *
 * // エラーハンドリング付きで非同期処理を実行する
 * await withErrorHandling(() => apiClient.get("/api/resource"));
 */

"use client";

import { useCallback, useState } from "react";
import type { AppError } from "@/types/error";
import { isAppError, logError, toAppError } from "@/lib/errorHandler";

type UseApiErrorReturn = {
  /** 現在のエラー（エラーがなければ null） */
  error: AppError | null;
  /** エラーをセットする */
  handleError: (error: unknown) => void;
  /** エラーをクリアする */
  clearError: () => void;
  /** エラーハンドリングを自動適用して非同期関数を実行する */
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
};

/**
 * APIエラーを管理するカスタムフック
 */
export const useApiError = (): UseApiErrorReturn => {
  const [error, setError] = useState<AppError | null>(null);

  /** エラー値を AppError に正規化してステートにセットする */
  const handleError = useCallback((err: unknown) => {
    const appError = isAppError(err) ? err : toAppError(err);
    logError(appError, "useApiError");
    setError(appError);
  }, []);

  /** エラーステートをクリアする */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 渡された非同期関数を実行し、エラー発生時に自動でハンドリングする
   * 成功時は結果値を、エラー時は null を返す
   */
  const withErrorHandling = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T | null> => {
      // 前のエラーをクリアしてから実行する
      clearError();
      try {
        return await fn();
      } catch (err) {
        handleError(err);
        return null;
      }
    },
    [clearError, handleError],
  );

  return { error, handleError, clearError, withErrorHandling };
};
