import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/layout/AppShell";

vi.mock("@/components/layout/Header", () => ({
  Header: ({ title }: { title: string }) => <div data-testid="header">{title}</div>,
}));

vi.mock("@/components/layout/BottomNav", () => ({
  BottomNav: () => <div data-testid="bottom-nav">BottomNav</div>,
}));

describe("AppShell", () => {
  it("title と children を描画する", () => {
    render(
      <AppShell title="マイタイトル">
        <div>ページ内容</div>
      </AppShell>,
    );

    expect(screen.getByTestId("header")).toHaveTextContent("マイタイトル");
    expect(screen.getByText("ページ内容")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
  });

  it("showBottomNav=false のとき BottomNav を表示しない", () => {
    render(
      <AppShell showBottomNav={false}>
        <div>内容</div>
      </AppShell>,
    );

    expect(screen.queryByTestId("bottom-nav")).not.toBeInTheDocument();
  });
});
