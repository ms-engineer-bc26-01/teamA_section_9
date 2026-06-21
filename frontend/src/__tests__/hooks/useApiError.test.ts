import { act, renderHook } from "@testing-library/react";
import { useApiError } from "@/hooks/useApiError";

describe("useApiError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("handleError でエラー状態と表示内容を保持できる", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new TypeError("Failed to fetch"), {
        context: "test",
      });
    });

    expect(result.current.error?.category).toBe("network");
    expect(result.current.content?.title).toBe("通信エラーが発生しました");
    expect(result.current.canRetry).toBe(false);
  });

  it("clearError で保持しているエラーをクリアできる", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new Error("something went wrong"));
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.content).toBeNull();
    expect(result.current.canRetry).toBe(false);
  });

  it("retry で登録した再試行処理を実行できる", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retryAction = vi.fn(async () => undefined);
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new Error("retry me"), {
        retry: retryAction,
      });
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(retryAction).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it("retry 中に再度失敗した場合もエラーを再設定できる", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const retryAction = vi.fn(async () => {
      throw new Error("401 token expired");
    });
    const { result } = renderHook(() => useApiError());

    act(() => {
      result.current.handleError(new Error("first error"), {
        retry: retryAction,
      });
    });

    await act(async () => {
      await result.current.retry();
    });

    expect(retryAction).toHaveBeenCalledTimes(1);
    expect(result.current.error?.category).toBe("auth");
    expect(result.current.canRetry).toBe(true);
  });
});
