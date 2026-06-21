import { act, renderHook } from "@testing-library/react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

vi.mock("@/lib/firebase", () => ({
  auth: { mock: "auth" },
}));

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const executeAndCaptureError = async (callback: () => Promise<unknown>): Promise<Error | null> => {
    let thrownError: Error | null = null;

    await act(async () => {
      try {
        await callback();
      } catch (error) {
        thrownError = error as Error;
      }
    });

    return thrownError;
  };

  it("signInが成功したとき、ユーザーとIDトークンを返す", async () => {
    const getIdToken = vi.fn().mockResolvedValue("signin-token");
    const user = { getIdToken };

    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never);

    const { result } = renderHook(() => useAuth());

    let response!: { user: { getIdToken: () => Promise<string> }; idToken: string };
    await act(async () => {
      response = await result.current.signIn("user@example.com", "password123");
    });

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      "user@example.com",
      "password123",
    );
    expect(getIdToken).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ user, idToken: "signin-token" });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("signUpが成功したとき、ユーザーとIDトークンを返す", async () => {
    const getIdToken = vi.fn().mockResolvedValue("signup-token");
    const user = { getIdToken };

    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({ user } as never);

    const { result } = renderHook(() => useAuth());

    let response!: { user: { getIdToken: () => Promise<string> }; idToken: string };
    await act(async () => {
      response = await result.current.signUp("new-user@example.com", "password123");
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      "new-user@example.com",
      "password123",
    );
    expect(getIdToken).toHaveBeenCalledTimes(1);
    expect(response).toEqual({ user, idToken: "signup-token" });
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("signIn中はloadingがtrueになり、完了後にfalseへ戻る", async () => {
    const getIdToken = vi.fn().mockResolvedValue("signin-token");
    const user = { getIdToken };

    let resolveCredential!: (value: { user: { getIdToken: () => Promise<string> } }) => void;
    vi.mocked(signInWithEmailAndPassword).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCredential = resolve;
        }) as never,
    );

    const { result } = renderHook(() => useAuth());

    let signInPromise!: Promise<{ user: { getIdToken: () => Promise<string> }; idToken: string }>;
    act(() => {
      signInPromise = result.current.signIn("user@example.com", "password123");
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveCredential({ user });
      await signInPromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it("signInでメール形式エラーの場合、利用者向けメッセージに変換される", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({
      code: "auth/invalid-email",
    });

    const { result } = renderHook(() => useAuth());

    const thrownError = await executeAndCaptureError(() =>
      result.current.signIn("bad-mail", "password123"),
    );

    expect(thrownError?.message).toBe("メールアドレスの形式が正しくありません。");
    expect(result.current.error).toBe("メールアドレスの形式が正しくありません。");
    expect(result.current.loading).toBe(false);
  });

  it("signInで通信エラー文字列を含むErrorの場合、通信エラーメッセージに変換される", async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(
      new Error("Firebase: Error (auth/network-request-failed)."),
    );

    const { result } = renderHook(() => useAuth());

    const thrownError = await executeAndCaptureError(() =>
      result.current.signIn("user@example.com", "password123"),
    );

    expect(thrownError?.message).toBe(
      "通信に失敗しました。通信環境を確認して再度お試しください。",
    );
    expect(result.current.error).toBe(
      "通信に失敗しました。通信環境を確認して再度お試しください。",
    );
  });

  it("signUpでパスワード強度エラーの場合、利用者向けメッセージに変換される", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: "auth/weak-password",
    });

    const { result } = renderHook(() => useAuth());

    const thrownError = await executeAndCaptureError(() =>
      result.current.signUp("new-user@example.com", "123"),
    );

    expect(thrownError?.message).toBe("パスワードは8文字以上で入力してください。");
    expect(result.current.error).toBe("パスワードは8文字以上で入力してください。");
    expect(result.current.loading).toBe(false);
  });

  it("signUpで未定義のFirebaseエラーの場合、汎用メッセージに変換される", async () => {
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({
      code: "auth/some-unknown-error",
    });

    const { result } = renderHook(() => useAuth());

    const thrownError = await executeAndCaptureError(() =>
      result.current.signUp("new-user@example.com", "password123"),
    );

    expect(thrownError?.message).toBe(
      "新規登録に失敗しました。入力内容を確認して再度お試しください。",
    );
    expect(result.current.error).toBe(
      "新規登録に失敗しました。入力内容を確認して再度お試しください。",
    );
  });
});
