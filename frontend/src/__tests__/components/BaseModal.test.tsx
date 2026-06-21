import { fireEvent, render, screen } from "@testing-library/react";
import { BaseModal } from "@/components/modal/BaseModal";

describe("BaseModal", () => {
  it("isOpen=false のとき何も描画しない", () => {
    render(
      <BaseModal isOpen={false} onClose={vi.fn()} title="タイトル">
        <div>本文</div>
      </BaseModal>,
    );

    expect(screen.queryByText("タイトル")).not.toBeInTheDocument();
    expect(screen.queryByText("本文")).not.toBeInTheDocument();
  });

  it("isOpen=true で title と children を描画し、閉じるで onClose を呼ぶ", () => {
    const handleClose = vi.fn();

    render(
      <BaseModal isOpen onClose={handleClose} title="モーダル" className="custom-modal">
        <div>コンテンツ</div>
      </BaseModal>,
    );

    expect(screen.getByText("モーダル")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ")).toBeInTheDocument();
    expect(screen.getByText("コンテンツ").closest("div")?.parentElement).toHaveClass(
      "custom-modal",
    );

    fireEvent.click(screen.getByRole("button", { name: "閉じる" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
