import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import ContactPage from "@/app/contact/page";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

describe("ContactPage", () => {
  it("お問い合わせ先とメール送信リンクを表示する", () => {
    render(<ContactPage />);

    expect(screen.getByText("support@example.com")).toBeInTheDocument();
    expect(
      screen.getByText("退会をご希望の場合も、お問い合わせ先までご連絡ください。"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "現時点ではアプリ内の退会機能は未実装です。退会をご希望の場合も、お問い合わせ先までご連絡ください。",
      ),
    ).not.toBeInTheDocument();

    const mailLink = screen.getByRole("link", { name: "メールを送る" });
    expect(mailLink).toHaveAttribute("href");
    expect(mailLink.getAttribute("href")).toContain("mailto:support@example.com");
  });
});
