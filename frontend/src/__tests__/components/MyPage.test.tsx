import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import MyPage from "@/app/my-page/page";

const replaceMock = vi.fn();
const getMyProfileMock = vi.fn();
const updateMyProfileMock = vi.fn();
const getMyUserItemsMock = vi.fn();
const deleteUserItemMock = vi.fn();
const useApiErrorMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

vi.mock("@/api/profiles", () => ({
  getMyProfile: (...args: unknown[]) => getMyProfileMock(...args),
  updateMyProfile: (...args: unknown[]) => updateMyProfileMock(...args),
}));

vi.mock("@/api/userItems", () => ({
  getMyUserItems: (...args: unknown[]) => getMyUserItemsMock(...args),
  deleteUserItem: (...args: unknown[]) => deleteUserItemMock(...args),
}));

vi.mock("@/hooks/useApiError", () => ({
  useApiError: () => useApiErrorMock(),
}));

vi.mock("@/lib/authClient", () => ({
  authClient: {
    logout: vi.fn(),
  },
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => (
    <div data-testid="app-shell">{children}</div>
  ),
}));

vi.mock("@/features/my-page/components/MyPageHeader", () => ({
  MyPageHeader: () => <div>ヘッダー</div>,
}));

vi.mock("@/features/my-page/components/ProfileCard", () => ({
  ProfileCard: () => <div data-testid="profile-card">プロフィール</div>,
}));

vi.mock("@/features/my-page/components/UserItemList", () => ({
  UserItemList: () => <div data-testid="user-item-list">アイテム一覧</div>,
}));

vi.mock("@/features/my-page/components/LogoutButton", () => ({
  LogoutButton: () => <button type="button">ログアウト</button>,
}));

vi.mock("@/features/my-page/components/ProfileEditModal", () => ({
  ProfileEditModal: () => null,
}));

vi.mock("@/features/items/components/ItemRegisterModal", () => ({
  ItemRegisterModal: () => null,
}));

vi.mock("@/components/common/ErrorFallback", () => ({
  ErrorFallback: () => <div data-testid="error-fallback">エラー</div>,
}));

describe("MyPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMyProfileMock.mockResolvedValue(null);
    deleteUserItemMock.mockResolvedValue(null);
  });

  it("初期表示でローディング文言を表示する", () => {
    getMyProfileMock.mockReturnValue(new Promise(() => undefined));
    getMyUserItemsMock.mockResolvedValue([]);
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<MyPage />);

    expect(screen.getByText("マイページを読み込み中...")).toBeInTheDocument();
  });

  it("正常時に主要コンテンツを表示する", async () => {
    getMyProfileMock.mockResolvedValue({
      id: "p1",
      name: "テスト",
      birthDay: "1990-01-01",
      skinType: "normal",
    });
    getMyUserItemsMock.mockResolvedValue([]);
    useApiErrorMock.mockReturnValue({
      error: null,
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByTestId("profile-card")).toBeInTheDocument();
      expect(screen.getByTestId("user-item-list")).toBeInTheDocument();
    });
  });

  it("error がある場合は ErrorFallback を表示する", async () => {
    getMyProfileMock.mockResolvedValue({
      id: "p1",
      name: "テスト",
      birthDay: "1990-01-01",
      skinType: "normal",
    });
    getMyUserItemsMock.mockResolvedValue([]);
    useApiErrorMock.mockReturnValue({
      error: new Error("failed"),
      clearError: vi.fn(),
      handleError: vi.fn(),
    });

    render(<MyPage />);

    await waitFor(() => {
      expect(screen.getByTestId("error-fallback")).toBeInTheDocument();
    });
  });
});
