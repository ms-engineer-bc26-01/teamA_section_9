import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { AiSuggestionCard } from "@/features/home/components/AiSuggestionCard";
import { HomeHeaderActions } from "@/features/home/components/HomeHeaderActions";
import { HomeQuickActions } from "@/features/home/components/HomeQuickActions";
import { SkinCalendar } from "@/features/home/components/SkinCalendar";
import { SkinConditionBadge } from "@/features/home/components/SkinConditionBadge";
import type { AiSuggestion, DailyLog } from "@/types/models";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } &
    AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/items/components/ItemRegisterModal", () => ({
  ItemRegisterModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="item-register-modal">open</div> : null,
}));

describe("Home components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("AiSuggestionCard は提案がないときに記録導線を表示する", () => {
    render(<AiSuggestionCard suggestion={null} />);

    expect(screen.getByText("まだAI提案がありません")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "記録する" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  it("AiSuggestionCard は通常提案ならおすすめセットを表示する", () => {
    const suggestion: AiSuggestion = {
      id: "ai-1",
      userId: "user-1",
      suggestedAt: "2026-06-21T12:00:00Z",
      suggestionType: "home_summary",
      title: "今日のおすすめです",
      body: "刺激を抑えたケアを続けましょう。",
      basis: "化粧水A × 乳液B",
      createdAt: "2026-06-21T12:00:00Z",
    };

    render(<AiSuggestionCard suggestion={suggestion} />);

    expect(screen.getByText("おすすめのセット", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("化粧水A")).toBeInTheDocument();
    expect(screen.getByText("乳液B")).toBeInTheDocument();
  });

  it("AiSuggestionCard は SOS 系タイトルならおすすめセットを隠す", () => {
    const suggestion: AiSuggestion = {
      id: "ai-2",
      userId: "user-1",
      suggestedAt: "2026-06-21T12:00:00Z",
      suggestionType: "home_summary",
      title: "専門医にご相談ください",
      body: "赤みが強いときは受診を検討してください。",
      basis: "化粧水A × 乳液B",
      createdAt: "2026-06-21T12:00:00Z",
    };

    render(<AiSuggestionCard suggestion={suggestion} />);

    expect(
      screen.queryByText("おすすめのセット", { exact: false }),
    ).not.toBeInTheDocument();
  });

  it("SkinCalendar は記録がないときの案内を表示する", () => {
    render(<SkinCalendar dailyLogs={[]} />);

    expect(screen.getByText("まだ肌記録がありません")).toBeInTheDocument();
    expect(screen.getByText("直近1週間")).toBeInTheDocument();
  });

  it("SkinCalendar は記録済み日付の肌状態を表示する", () => {
    const dailyLogs: DailyLog[] = [
      {
        id: "log-1",
        userId: "user-1",
        logDate: "2026-06-21",
        skinCondition: 3,
        isMenstruation: false,
        usedItems: [],
        createdAt: "2026-06-21T12:00:00Z",
        updatedAt: "2026-06-21T12:00:00Z",
      },
    ];

    render(<SkinCalendar dailyLogs={dailyLogs} />);

    expect(screen.getAllByLabelText("良好").length).toBeGreaterThan(0);
  });

  it("SkinConditionBadge は condition に応じた表示を切り替える", () => {
    const { rerender } = render(<SkinConditionBadge />);

    expect(screen.getByText("-")).toBeInTheDocument();

    rerender(<SkinConditionBadge condition={1} />);

    expect(screen.getByLabelText("不調")).toHaveTextContent("😢");
  });

  it("HomeHeaderActions はアイテム登録モーダルを開ける", () => {
    render(<HomeHeaderActions onClickAddItem={vi.fn()} />);

    expect(screen.getByRole("link", { name: "今日を記録" })).toHaveAttribute(
      "href",
      "/record",
    );

    fireEvent.click(screen.getByRole("button", { name: "＋ アイテム登録" }));

    expect(screen.getByTestId("item-register-modal")).toBeInTheDocument();
  });

  it("HomeQuickActions はアイテム登録コールバックと記録リンクを提供する", () => {
    const onClickAddItemMock = vi.fn();

    render(<HomeQuickActions onClickAddItem={onClickAddItemMock} />);

    fireEvent.click(screen.getByRole("button", { name: "アイテム登録" }));

    expect(onClickAddItemMock).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "今日を記録" })).toHaveAttribute(
      "href",
      "/record",
    );
  });
});
