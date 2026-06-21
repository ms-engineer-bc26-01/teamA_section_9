import { fireEvent, render, screen } from "@testing-library/react";
import { Select } from "@/components/common/Select";

describe("Select", () => {
  const options = [
    { label: "晴れ", value: "sunny" },
    { label: "雨", value: "rainy" },
  ];

  it("placeholder・options・error を表示する", () => {
    render(
      <Select
        id="weather"
        label="天気"
        options={options}
        placeholder="選択してください"
        error="必須です"
      />,
    );

    expect(screen.getByText("天気")).toHaveAttribute("for", "weather");
    expect(screen.getByRole("option", { name: "選択してください" })).toHaveValue("");
    expect(screen.getByRole("option", { name: "晴れ" })).toHaveValue("sunny");
    expect(screen.getByText("必須です")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveClass("border-red-300");
  });

  it("選択変更時に onChange が呼ばれる", () => {
    const handleChange = vi.fn();

    render(<Select aria-label="天気" options={options} onChange={handleChange} />);

    fireEvent.change(screen.getByLabelText("天気"), { target: { value: "rainy" } });

    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
