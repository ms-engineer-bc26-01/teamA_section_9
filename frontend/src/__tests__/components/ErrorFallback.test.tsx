import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import type { AppError, ErrorCategory } from "@/types/error";

const createError = (category: ErrorCategory, message: string): AppError => ({
  category,
  message,
});

describe("ErrorFallback", () => {
  it("通信エラーのタイトル・メッセージ・リトライボタンを表示する", () => {
    render(
      <ErrorFallback
        error={createError("network", "ネットワークに接続できません")}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("通信エラー")).toBeInTheDocument();
    expect(screen.getByText("ネットワークに接続できません")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行する" })).toBeInTheDocument();
  });

  it("認証エラーのタイトル・ログインボタンを表示しリトライボタンは表示しない", () => {
    render(
      <ErrorFallback
        error={createError("auth", "認証に失敗しました")}
        onRetry={vi.fn()}
        onLogin={vi.fn()}
      />,
    );

    expect(screen.getByText("認証エラー")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ログインし直す" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "再試行する" }),
    ).not.toBeInTheDocument();
  });

  it("AI失敗エラーのタイトルと再試行ボタンを表示する", () => {
    render(
      <ErrorFallback
        error={createError("ai", "AI処理に失敗しました")}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("AI処理エラー")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "再試行する" })).toBeInTheDocument();
  });

  it("通常APIエラーのタイトルを表示する", () => {
    render(<ErrorFallback error={createError("api", "サーバー内部エラー")} />);

    expect(screen.getByText("サーバーエラー")).toBeInTheDocument();
    expect(screen.getByText("サーバー内部エラー")).toBeInTheDocument();
  });

  it("不明なエラーのタイトルを表示する", () => {
    render(<ErrorFallback error={createError("unknown", "予期しないエラー")} />);

    expect(screen.getAllByText("予期しないエラー")).toHaveLength(2);
  });

  it("onRetry が未指定の場合はリトライボタンを表示しない", () => {
    render(<ErrorFallback error={createError("network", "通信エラー")} />);

    expect(
      screen.queryByRole("button", { name: "再試行する" }),
    ).not.toBeInTheDocument();
  });

  it("auth 以外では onLogin が指定されてもログインボタンを表示しない", () => {
    render(
      <ErrorFallback
        error={createError("api", "サーバーエラー")}
        onLogin={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "ログインし直す" }),
    ).not.toBeInTheDocument();
  });

  it("アクセシビリティ属性として role=alert と aria-live=assertive を持つ", () => {
    render(<ErrorFallback error={createError("unknown", "エラー")} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
  });

  it("リトライボタンクリック時に onRetry コールバックを実行する", () => {
    const onRetry = vi.fn();

    render(
      <ErrorFallback
        error={createError("network", "通信エラー")}
        onRetry={onRetry}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "再試行する" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("ログインボタンクリック時に onLogin コールバックを実行する", () => {
    const onLogin = vi.fn();

    render(
      <ErrorFallback error={createError("auth", "認証エラー")} onLogin={onLogin} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ログインし直す" }));
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});
