import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import type { DailyLog } from "@/types/models";

const getDailyLogsMock = vi.fn();
const getLatestHomeSummaryAiSuggestionMock = vi.fn();
const getHomeSummaryAiSuggestionMock = vi.fn();
const useApiErrorMock = vi.fn();

vi.mock("@/api/dailyLogs", () => ({
  getDailyLogs: (...args: unknown[]) => getDailyLogsMock(...args),
}));

vi.mock("@/api/aiSuggestions", () => ({
  getLatestHomeSummaryAiSuggestion: (...args: unknown[]) =>
    getLatestHomeSummaryAiSuggestionMock(...args),
  getHomeSummaryAiSuggestion: (...args: unknown[]) =>
    getHomeSummaryAiSuggestionMock(...args),
}));

vi.mock("@/hooks/useApiError", () => ({
  useApiError: () => useApiErrorMock(),
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/features/home/components/AiSuggestionCard", () => ({
  AiSuggestionCard: () => <div data-testid="ai-suggestion-card">AI提案</div>,
}));

vi.mock("@/features/home/components/SkinCalendar", () => ({
  SkinCalendar: () => <div data-testid="skin-calendar">カレンダー</div>,
}));

vi.mock("@/components/common/ErrorFallback", () => ({
  ErrorFallback: () => <div data-testid="error-fallback">エラー</div>,
}));

const createDailyLog = (logDate: string): DailyLog => ({
  id: "log-1",
  userId: "user-1",
  logDate,
  skinCondition: 3,
  isMenstruation: false,
  usedItems: [],
  createdAt: "2026-06-21T12:00:00Z",
  updatedAt: "2026-06-21T12:00:00Z",
});

describe("HomePage today CTA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getLatestHomeSummaryAiSuggestionMock.mockResolvedValue(null);
    getHomeSummaryAiSuggestionMock.mockResolvedValue(null);
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });
    sessionStorage.clear();
  });

  it("当日の記録がない場合は CTA と記録リンクを表示する", async () => {
    getDailyLogsMock.mockResolvedValue([createDailyLog("2026-06-01")]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("今日の記録がまだありません")).toBeInTheDocument();
    });

    expect(screen.getByText("入力しましょう📝")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "記録する" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  it("当日の記録がある場合は 入力済み文言を表示して記録リンクを隠す", async () => {
    const today = new Date();
    const todayDate = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, "0")}-${`${today.getDate()}`.padStart(2, "0")}`;
    getDailyLogsMock.mockResolvedValue([createDailyLog(todayDate)]);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByText("今日の記録は入力済みです✨")).toBeInTheDocument();
    });

    expect(screen.queryByRole("link", { name: "記録する" })).not.toBeInTheDocument();
  });
});
