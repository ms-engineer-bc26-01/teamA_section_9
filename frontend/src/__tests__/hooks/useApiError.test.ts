import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useApiError } from "@/hooks/useApiError";
import * as errorHandler from "@/lib/errorHandler";
import type { AppError } from "@/types/error";

describe("useApiError", () => {
  beforeEach(() => {
    vi.spyOn(errorHandler, "logError").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handleError が未知のエラーを AppError に変換して保持する", () => {
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new TypeError("Failed to fetch"));
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.category).toBe("network");
  });

  it("clearError がエラーステートを null に戻す", () => {
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new Error("any"));
    });

    expect(result.current.error).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it("withErrorHandling は成功時に結果を返しエラーを残さない", async () => {
    const { result } = renderHook(() => useApiError());

    let response: { ok: boolean } | null = null;
    await act(async () => {
      response = await result.current.withErrorHandling(async () => ({ ok: true }));
    });

    expect(response).toEqual({ ok: true });
    expect(result.current.error).toBeNull();
  });

  it("withErrorHandling は失敗時に null を返しエラーを保持する", async () => {
    const { result } = renderHook(() => useApiError());
    const appError: AppError = {
      category: "auth",
      message: "認証エラー",
      statusCode: 401,
    };

    let response: string | null = "initial";
    await act(async () => {
      response = await result.current.withErrorHandling(async () => {
        throw appError;
      });
    });

    expect(response).toBeNull();
    expect(result.current.error).toEqual(appError);
  });

  it("複数回のシーケンスで前回エラーをクリアしてから新しい処理を行う", async () => {
    const { result } = renderHook(() => useApiError());

    await act(async () => {
      await result.current.withErrorHandling(async () => {
        throw new Error("AI suggestion error");
      });
    });
    expect(result.current.error?.category).toBe("ai");

    let successValue: number | null = null;
    await act(async () => {
      successValue = await result.current.withErrorHandling(async () => 42);
    });

    expect(successValue).toBe(42);
    expect(result.current.error).toBeNull();
  });
});
