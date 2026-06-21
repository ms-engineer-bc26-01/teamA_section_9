import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmModal } from "@/components/modal/ConfirmModal";

describe("ConfirmModal", () => {
  it("タイトル・メッセージ・デフォルトボタンラベルを表示する", () => {
    render(
      <ConfirmModal
        isOpen
        title="確認"
        message="本当に実行しますか"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("確認")).toBeInTheDocument();
    expect(screen.getByText("本当に実行しますか")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "実行する" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument();
  });

  it("確定とキャンセルでそれぞれのコールバックを呼ぶ", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <ConfirmModal
        isOpen
        title="確認"
        message="実行"
        confirmLabel="確定"
        cancelLabel="中止"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "確定" }));
    fireEvent.click(screen.getByRole("button", { name: "中止" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
