import { fireEvent, render, screen } from "@testing-library/react";
import { Textarea } from "@/components/common/Textarea";

describe("Textarea", () => {
  it("label と error を表示し、error 時のクラスを適用する", () => {
    render(
      <Textarea
        id="memo"
        label="メモ"
        error="入力してください"
        className="custom-textarea"
      />,
    );

    expect(screen.getByText("メモ")).toHaveAttribute("for", "memo");
    expect(screen.getByText("入力してください")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveClass(
      "border-red-300",
      "custom-textarea",
    );
  });

  it("入力イベントで onChange が呼ばれる", () => {
    const handleChange = vi.fn();

    render(<Textarea aria-label="自由記述" onChange={handleChange} />);

    fireEvent.change(screen.getByLabelText("自由記述"), {
      target: { value: "内容" },
    });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
