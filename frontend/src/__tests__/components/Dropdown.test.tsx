import { fireEvent, render, screen } from "@testing-library/react";
import { Dropdown } from "@/components/common/Dropdown";

describe("Dropdown", () => {
  const options = [
    { label: "晴れ", value: "sunny" },
    { label: "雨", value: "rainy" },
  ];

  it("ラベルと placeholder を表示する", () => {
    render(
      <Dropdown
        id="weather"
        label="天気"
        options={options}
        placeholder="選択してください"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText("天気")).toHaveAttribute("for", "weather");
    expect(screen.getByRole("button", { name: "天気" })).toHaveTextContent(
      "選択してください",
    );
  });

  it("クリックで開閉し aria-expanded を切り替える", () => {
    render(<Dropdown label="天気" options={options} onChange={vi.fn()} />);

    const trigger = screen.getByRole("button", { name: "天気" });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("項目選択時に value を返して閉じる", () => {
    const onChange = vi.fn();

    render(<Dropdown label="天気" options={options} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "天気" }));
    fireEvent.click(screen.getByRole("option", { name: "雨" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("rainy");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("外側クリックで閉じる", () => {
    render(
      <div>
        <Dropdown label="天気" options={options} onChange={vi.fn()} />
        <button type="button">外側</button>
      </div>,
    );

    fireEvent.click(screen.getByRole("button", { name: "天気" }));

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("button", { name: "外側" }));

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("value に対応する label を表示する", () => {
    render(
      <Dropdown
        label="天気"
        options={options}
        value="rainy"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "天気" })).toHaveTextContent("雨");
  });
});
