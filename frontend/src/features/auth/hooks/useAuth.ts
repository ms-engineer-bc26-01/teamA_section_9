import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // さっき作った設定ファイルをインポート

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // 3. 【動作確認用】手元で確認できるようにトークンとUIDをコンソールに出す
      console.log("====== Firebase 認証成功！ ======");
      console.log("Firebase UID (これを最終的にDBに入れたい):", user.uid);
      console.log("IDトークン (これをHonoに送る用):", idToken);

      // 次のステップで、この idToken をバックエンドに POST する処理をここに書き足します！
      return { user, idToken };
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "認証に失敗しました";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUp,
    loading,
    error,
  };
};
