import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import RecordPage from "@/app/record/page";

const pushMock = vi.fn();
const getMyUserItemsMock = vi.fn();
const getDailyLogByDateMock = vi.fn();
const saveDailyLogMock = vi.fn();
const updateDailyLogMock = vi.fn();
const getDailyCommentAiSuggestionMock = vi.fn();
const useApiErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/api/userItems", () => ({
  getMyUserItems: (...args: unknown[]) => getMyUserItemsMock(...args),
}));

vi.mock("@/api/dailyLogs", () => ({
  getDailyLogByDate: (...args: unknown[]) => getDailyLogByDateMock(...args),
  saveDailyLog: (...args: unknown[]) => saveDailyLogMock(...args),
  updateDailyLog: (...args: unknown[]) => updateDailyLogMock(...args),
}));

vi.mock("@/api/aiSuggestions", () => ({
  getDailyCommentAiSuggestion: (...args: unknown[]) =>
    getDailyCommentAiSuggestionMock(...args),
}));

vi.mock("@/hooks/useApiError", () => ({
  useApiError: () => useApiErrorMock(),
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/features/daily-log/components/DateSelectorButton", () => ({
  DateSelectorButton: () => <button type="button">日付選択</button>,
}));

vi.mock("@/features/daily-log/components/DailyLogForm", () => ({
  DailyLogForm: () => <div data-testid="daily-log-form">フォーム</div>,
}));

vi.mock("@/features/daily-log/components/DateSelectModal", () => ({
  DateSelectModal: () => null,
}));

vi.mock("@/features/daily-log/components/AiCommentModal", () => ({
  AiCommentModal: () => null,
}));

vi.mock("@/components/common/ErrorFallback", () => ({
  ErrorFallback: () => <div data-testid="error-fallback">エラー</div>,
}));

vi.mock("@/features/daily-log/utils", () => ({
  getTodayDateString: () => "2026-06-21",
  createEmptyDailyLogFormValues: (date: string) => ({
    logDate: date,
    skinCondition: "",
    weather: "",
    sleepLevel: "",
    mealBalance: "",
    freeNote: "",
    isMenstruation: false,
    morningItemIds: [],
    nightItemIds: [],
  }),
}));

describe("RecordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMyUserItemsMock.mockResolvedValue([]);
    getDailyCommentAiSuggestionMock.mockResolvedValue(null);
    saveDailyLogMock.mockResolvedValue(null);
    updateDailyLogMock.mockResolvedValue(null);
  });

  it("初期表示でローディング文言を表示する", () => {
    getMyUserItemsMock.mockReturnValue(new Promise(() => undefined));
    getDailyLogByDateMock.mockReturnValue(new Promise(() => undefined));
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<RecordPage />);

    expect(screen.getByText("記録画面を読み込み中...")).toBeInTheDocument();
  });

  it("正常時にフォームを表示する", async () => {
    getDailyLogByDateMock.mockResolvedValue(null);
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<RecordPage />);

    await waitFor(() => {
      expect(screen.getByTestId("daily-log-form")).toBeInTheDocument();
    });
  });

  it("error がある場合は ErrorFallback を表示する", async () => {
    getDailyLogByDateMock.mockResolvedValue(null);
    useApiErrorMock.mockReturnValue({
      error: new Error("failed"),
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<RecordPage />);

    await waitFor(() => {
      expect(screen.getByTestId("error-fallback")).toBeInTheDocument();
    });
  });
});
