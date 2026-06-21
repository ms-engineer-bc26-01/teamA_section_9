import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/common/Button";

describe("Button", () => {
  it("children を描画し、variant/size/fullWidth/className をクラスに反映する", () => {
    render(
      <Button variant="danger" size="lg" fullWidth className="custom-class">
        送信
      </Button>,
    );

    const button = screen.getByRole("button", { name: "送信" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-red-500");
    expect(button).toHaveClass("px-5", "py-4", "w-full", "custom-class");
  });

  it("type のデフォルトは button で、disabled 時はクリック発火しない", () => {
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>保存</Button>);

    const button = screen.getByRole("button", { name: "保存" });

    expect(button).toHaveAttribute("type", "button");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);

    handleClick.mockClear();
    render(
      <Button onClick={handleClick} disabled>
        無効
      </Button>,
    );

    fireEvent.click(screen.getByRole("button", { name: "無効" }));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
