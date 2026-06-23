import { fireEvent, render, screen } from "@testing-library/react";
import { LifestyleFields } from "@/features/daily-log/components/LifestyleFields";

describe("LifestyleFields", () => {
  it("睡眠ドロップダウン選択で sleepLevel を返す", () => {
    const onChange = vi.fn();

    render(
      <LifestyleFields
        weather=""
        sleepLevel=""
        mealBalance=""
        freeNote=""
        isMenstruation={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "睡眠" }));
    fireEvent.click(screen.getByRole("option", { name: "普通" }));

    expect(onChange).toHaveBeenCalledWith({ sleepLevel: "normal" });
  });

  it("食事のバランスドロップダウン選択で mealBalance を返す", () => {
    const onChange = vi.fn();

    render(
      <LifestyleFields
        weather=""
        sleepLevel=""
        mealBalance=""
        freeNote=""
        isMenstruation={false}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "食事のバランス" }));
    fireEvent.click(screen.getByRole("option", { name: "良い" }));

    expect(onChange).toHaveBeenCalledWith({ mealBalance: "good" });
  });
});
