import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";

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

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getHomeSummaryAiSuggestionMock.mockResolvedValue(null);
    sessionStorage.clear();
  });

  it("初期表示でローディング文言を表示する", () => {
    getDailyLogsMock.mockReturnValue(new Promise(() => undefined));
    getLatestHomeSummaryAiSuggestionMock.mockResolvedValue(null);
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<HomePage />);

    expect(screen.getByText("ホーム画面を読み込み中...")).toBeInTheDocument();
  });

  it("正常時に主要コンテンツを表示する", async () => {
    getDailyLogsMock.mockResolvedValue([]);
    getLatestHomeSummaryAiSuggestionMock.mockResolvedValue(null);
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("ai-suggestion-card")).toBeInTheDocument();
      expect(screen.getByTestId("skin-calendar")).toBeInTheDocument();
    });
  });

  it("error がある場合は ErrorFallback を表示する", async () => {
    getDailyLogsMock.mockResolvedValue([]);
    getLatestHomeSummaryAiSuggestionMock.mockResolvedValue(null);
    useApiErrorMock.mockReturnValue({
      error: new Error("failed"),
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("error-fallback")).toBeInTheDocument();
    });
  });
});
