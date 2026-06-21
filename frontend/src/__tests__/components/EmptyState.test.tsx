import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/common/EmptyState";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } &
    AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("EmptyState", () => {
  it("タイトル/説明/アイコンを表示する", () => {
    render(<EmptyState title="データなし" description="説明文" icon="📭" />);

    expect(screen.getByText("データなし")).toBeInTheDocument();
    expect(screen.getByText("説明文")).toBeInTheDocument();
    expect(screen.getByText("📭")).toBeInTheDocument();
  });

  it("actionHref 指定時はリンクを表示する", () => {
    render(<EmptyState title="空" actionLabel="移動" actionHref="/record" />);

    expect(screen.getByRole("link", { name: "移動" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  it("onAction 指定時はボタンを表示しクリックできる", () => {
    const handleAction = vi.fn();

    render(<EmptyState title="空" actionLabel="実行" onAction={handleAction} />);

    fireEvent.click(screen.getByRole("button", { name: "実行" }));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
