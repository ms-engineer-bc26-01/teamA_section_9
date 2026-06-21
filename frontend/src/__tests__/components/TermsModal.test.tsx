import { fireEvent, render, screen } from "@testing-library/react";
import { TermsModal } from "@/components/common/TermsModal";

describe("TermsModal", () => {
  it("isOpen=false のとき描画しない", () => {
    render(<TermsModal isOpen={false} onClose={vi.fn()} />);

    expect(
      screen.queryByText("利用規約・プライバシーポリシー"),
    ).not.toBeInTheDocument();
  });

  it("開いた状態で本文を表示し、閉じる操作で onClose を呼ぶ", () => {
    const handleClose = vi.fn();

    render(<TermsModal isOpen onClose={handleClose} />);

    expect(screen.getByText("利用規約・プライバシーポリシー")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "利用規約" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "プライバシーポリシー" }));
    expect(screen.getByText("SkinMate プライバシーポリシー")).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: "閉じる" });

    fireEvent.click(closeButtons[0]);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(closeButtons[1]);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });
});
