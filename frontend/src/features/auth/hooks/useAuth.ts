import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const getFirebaseErrorCode = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;

    if (typeof code === "string") {
      return code;
    }
  }

  if (error instanceof Error) {
    return error.message.match(/auth\/[a-z0-9-]+/i)?.[0];
  }

  return undefined;
};

const getSignInErrorMessage = (error: unknown) => {
  const code = getFirebaseErrorCode(error);

  switch (code) {
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";

    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "メールアドレスまたはパスワードが正しくありません。";

    case "auth/network-request-failed":
      return "通信に失敗しました。通信環境を確認して再度お試しください。";

    default:
      return "ログインに失敗しました。入力内容を確認して再度お試しください。";
  }
};

const getSignUpErrorMessage = (error: unknown) => {
  const code = getFirebaseErrorCode(error);

  switch (code) {
    case "auth/email-already-in-use":
      return "このメールアドレスはすでに登録されています。ログイン画面からログインしてください。";

    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。入力内容を確認してください。";

    case "auth/weak-password":
      return "パスワードは8文字以上で入力してください。";

    case "auth/network-request-failed":
      return "通信に失敗しました。通信環境を確認して再度お試しください。";

    default:
      return "新規登録に失敗しました。入力内容を確認して再度お試しください。";
  }
};

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * メールアドレスとパスワードでログイン（サインイン）する
   */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Firebase Authにメール/パスワードを送信してログイン
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. バックエンド（Hono）の通信に使うための最新の「IDトークン」を取得
      const idToken = await user.getIdToken();

      return { user, idToken };
    } catch (err: unknown) {
      const errorMessage = getSignInErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * メールアドレスとパスワードでユーザーを新規登録し、バックエンド用のIDトークンを取得する
   */
  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 1. Firebase Authにメール/パスワードを送信してユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // 2. バックエンドに渡すための「IDトークン（JWT）」を発行してもらう
      const idToken = await user.getIdToken();

      return { user, idToken };
    } catch (err: unknown) {
      const errorMessage = getSignUpErrorMessage(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    loading,
    error,
  };
};
