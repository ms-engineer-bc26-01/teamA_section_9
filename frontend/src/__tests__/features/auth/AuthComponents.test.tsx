import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthScreen } from "@/features/auth/components/AuthScreen";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { SkinTypeSelector } from "@/features/auth/components/SkinTypeSelector";

const pushMock = vi.fn();
const signInMock = vi.fn();
const signUpMock = vi.fn();
const getMyProfileMock = vi.fn();
const updateMyProfileMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    signIn: signInMock,
    signUp: signUpMock,
    loading: false,
  }),
}));

vi.mock("@/api/profiles", () => ({
  getMyProfile: (...args: unknown[]) => getMyProfileMock(...args),
  updateMyProfile: (...args: unknown[]) => updateMyProfileMock(...args),
}));

vi.mock("@/components/common/TermsModal", () => ({
  TermsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="terms-modal">利用規約モーダル</div> : null,
}));

describe("Auth components", () => {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    signInMock.mockResolvedValue(undefined);
    signUpMock.mockResolvedValue(undefined);
    getMyProfileMock.mockResolvedValue(undefined);
    updateMyProfileMock.mockResolvedValue(undefined);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("AuthScreen でログイン後にホームへ遷移する", async () => {
    render(<AuthScreen />);

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "login@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith("login@example.com", "password123");
      expect(getMyProfileMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("AuthScreen で新規登録に切り替えてプロフィールも保存する", async () => {
    render(<AuthScreen />);

    fireEvent.click(screen.getByRole("button", { name: "新規登録" }));

    fireEvent.change(screen.getByLabelText("お名前"), {
      target: { value: "山田 花子" },
    });
    fireEvent.change(screen.getByLabelText("生年月日"), {
      target: { value: "1995-04-01" },
    });
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "register@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "登録してはじめる" }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith(
        "register@example.com",
        "password123",
      );
      expect(getMyProfileMock).toHaveBeenCalled();
      expect(updateMyProfileMock).toHaveBeenCalledWith({
        name: "山田 花子",
        birthDay: "1995-04-01",
        skinType: "normal",
      });
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("LoginForm は必須項目が未入力ならエラーを表示する", async () => {
    const onSubmitMock = vi.fn();

    render(
      <LoginForm
        onSubmit={onSubmitMock}
        onClickRegister={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      screen.getByText("メールアドレスとパスワードを入力してください。"),
    ).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it("LoginForm は入力値を送信し、新規登録導線も呼び出す", async () => {
    const onSubmitMock = vi.fn().mockResolvedValue(undefined);
    const onClickRegisterMock = vi.fn();

    render(
      <LoginForm
        onSubmit={onSubmitMock}
        onClickRegister={onClickRegisterMock}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "ログイン" }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "新規登録" }));

    expect(onClickRegisterMock).toHaveBeenCalled();
  });

  it("RegisterForm はモーダルを開き、Firebase のエラーコードを文言へ変換する", async () => {
    const onSubmitMock = vi
      .fn()
      .mockRejectedValue({ code: "auth/email-already-in-use" });

    render(
      <RegisterForm
        onSubmit={onSubmitMock}
        onClickLogin={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "利用規約・プライバシーポリシーを確認する" }),
    );

    expect(screen.getByTestId("terms-modal")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("お名前"), {
      target: { value: "田中 美咲" },
    });
    fireEvent.change(screen.getByLabelText("生年月日"), {
      target: { value: "1993-08-01" },
    });
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "used@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "登録してはじめる" }));

    expect(
      await screen.findByText(
        "このメールアドレスはすでに登録されています。ログイン画面からログインしてください。",
      ),
    ).toBeInTheDocument();
  });

  it("RegisterForm は肌タイプを含む入力値を送信する", async () => {
    const onSubmitMock = vi.fn().mockResolvedValue(undefined);

    render(
      <RegisterForm
        onSubmit={onSubmitMock}
        onClickLogin={vi.fn()}
        isSubmitting={false}
      />,
    );

    fireEvent.change(screen.getByLabelText("お名前"), {
      target: { value: "佐藤 葵" },
    });
    fireEvent.change(screen.getByLabelText("生年月日"), {
      target: { value: "1998-12-24" },
    });
    fireEvent.change(screen.getByLabelText("メールアドレス"), {
      target: { value: "new@example.com" },
    });
    fireEvent.change(screen.getByLabelText("パスワード"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "敏感肌" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "登録してはじめる" }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith({
        name: "佐藤 葵",
        birthDay: "1998-12-24",
        email: "new@example.com",
        password: "password123",
        skinType: "sensitive",
      });
    });
  });

  it("SkinTypeSelector は選択状態を表示し、クリック時に値を返す", () => {
    const onChangeMock = vi.fn();

    render(<SkinTypeSelector value="normal" onChange={onChangeMock} />);

    expect(screen.getByRole("button", { name: "普通肌" })).toHaveClass(
      "border-rose-300",
    );

    fireEvent.click(screen.getByRole("button", { name: "敏感肌" }));

    expect(onChangeMock).toHaveBeenCalledWith("sensitive");
  });
});
