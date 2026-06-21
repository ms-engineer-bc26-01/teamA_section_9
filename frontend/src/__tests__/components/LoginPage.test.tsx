import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

vi.mock("@/features/auth/components/AuthScreen", () => ({
  AuthScreen: () => <div data-testid="auth-screen">認証画面</div>,
}));

describe("LoginPage", () => {
  it("AuthScreen を描画する", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("auth-screen")).toBeInTheDocument();
  });
});
