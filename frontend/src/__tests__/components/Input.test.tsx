import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "@/components/common/Input";

describe("Input", () => {
  it("label と error を表示し、error 時のクラスを適用する", () => {
    render(
      <Input
        id="email"
        label="メールアドレス"
        error="必須です"
        className="custom-input"
      />,
    );

    expect(screen.getByText("メールアドレス")).toHaveAttribute("for", "email");
    expect(screen.getByText("必須です")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass("border-red-300", "custom-input");
  });

  it("入力イベントで onChange が呼ばれる", () => {
    const handleChange = vi.fn();

    render(<Input aria-label="名前" onChange={handleChange} />);

    fireEvent.change(screen.getByLabelText("名前"), {
      target: { value: "テスト" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
