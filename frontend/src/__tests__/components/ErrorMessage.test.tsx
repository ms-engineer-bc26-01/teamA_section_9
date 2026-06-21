import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "@/components/common/ErrorMessage";

describe("ErrorMessage", () => {
  it("message を表示する", () => {
    render(<ErrorMessage message="エラーです" />);

    expect(screen.getByText("エラーです")).toBeInTheDocument();
  });
});
