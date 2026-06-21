import { fireEvent, render, screen } from "@testing-library/react";
import { Header } from "@/components/layout/Header";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/items/components/ItemRegisterModal", () => ({
  ItemRegisterModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="item-register-modal">open</div> : null,
}));

vi.mock("@/components/common/TermsModal", () => ({
  TermsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="terms-modal">open</div> : null,
}));

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("title を表示する", () => {
    render(<Header title="SkinMate" />);

    expect(screen.getByRole("heading", { name: "SkinMate" })).toBeInTheDocument();
  });

  it("メニューから画面遷移できる", () => {
    render(<Header title="SkinMate" />);

    fireEvent.click(screen.getByRole("button", { name: "メニューを開く" }));
    fireEvent.click(screen.getByRole("button", { name: "記録画面" }));

    expect(pushMock).toHaveBeenCalledWith("/record");
  });

  it("利用規約メニューで TermsModal を開く", () => {
    render(<Header title="SkinMate" />);

    fireEvent.click(screen.getByRole("button", { name: "メニューを開く" }));
    fireEvent.click(screen.getByRole("button", { name: "利用規約" }));

    expect(screen.getByTestId("terms-modal")).toBeInTheDocument();
  });
});
