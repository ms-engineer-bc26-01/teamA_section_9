import { fireEvent, render, screen } from "@testing-library/react";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { createAppError } from "@/lib/errorHandler";

describe("ErrorFallback", () => {
  it("通信エラー時にネットワーク向けガイダンスを表示する", () => {
    render(
      <ErrorFallback
        error={createAppError({
          category: "network",
          message:
            "ネットワークに接続できませんでした。通信環境を確認して再度お試しください。",
          details: "Failed to fetch",
          originalError: new TypeError("Failed to fetch"),
        })}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("通信エラーが発生しました")).toBeInTheDocument();
    expect(
      screen.getByText("Wi-Fi やモバイル通信の接続状況を確認してください。"),
    ).toBeInTheDocument();
  });

  it("認証エラー時に再ログイン案内を表示する", () => {
    render(
      <ErrorFallback
        error={createAppError({
          category: "auth",
          message: "認証に失敗しました。再度ログインしてください。",
          details: "token expired",
          statusCode: 401,
          originalError: new Error("token expired"),
        })}
      />,
    );

    expect(screen.getByText("認証エラーが発生しました")).toBeInTheDocument();
    expect(
      screen.getByText("再ログイン後に同じ操作をやり直してください。"),
    ).toBeInTheDocument();
  });

  it("リトライボタン押下で再試行コールバックを呼び出す", () => {
    const onRetry = vi.fn();

    render(
      <ErrorFallback
        error={createAppError({
          category: "ai",
          message: "AIの処理に失敗しました。少し時間をおいてから再試行してください。",
          details: "response is missing title",
          originalError: new Error("response is missing title"),
        })}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "もう一度試す" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
