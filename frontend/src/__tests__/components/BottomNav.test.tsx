import type { AnchorHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/layout/BottomNav";

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

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

describe("BottomNav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ナビゲーション項目を表示する", () => {
    usePathnameMock.mockReturnValue("/");

    render(<BottomNav />);

    expect(screen.getByRole("link", { name: "ホーム" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "記録" })).toHaveAttribute("href", "/record");
    expect(screen.getByRole("link", { name: "マイページ" })).toHaveAttribute(
      "href",
      "/my-page",
    );
  });

  it("現在パスのリンクにアクティブクラスを付与する", () => {
    usePathnameMock.mockReturnValue("/record");

    render(<BottomNav />);

    expect(screen.getByRole("link", { name: "記録" })).toHaveClass("bg-rose-50");
    expect(screen.getByRole("link", { name: "ホーム" })).not.toHaveClass("bg-rose-50");
  });
});
