import { fireEvent, render, screen } from "@testing-library/react";
import { AlertModal } from "@/components/modal/AlertModal";

describe("AlertModal", () => {
  it("タイトル・メッセージ・ボタンを表示する", () => {
    render(
      <AlertModal
        isOpen
        title="お知らせ"
        message="完了しました"
        buttonLabel="閉じる"
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("お知らせ")).toBeInTheDocument();
    expect(screen.getByText("完了しました")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "閉じる" })).toHaveLength(2);
  });

  it("ボタン押下で onClose を呼ぶ", () => {
    const handleClose = vi.fn();

    render(
      <AlertModal isOpen title="確認" message="メッセージ" onClose={handleClose} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
