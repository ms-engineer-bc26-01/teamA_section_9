import { render, screen } from "@testing-library/react";
import { Loading } from "@/components/common/Loading";

describe("Loading", () => {
  it("デフォルト文言を表示する", () => {
    render(<Loading />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("text プロップで文言を表示できる", () => {
    render(<Loading text="データ取得中..." />);

    expect(screen.getByText("データ取得中...")).toBeInTheDocument();
  });
});
