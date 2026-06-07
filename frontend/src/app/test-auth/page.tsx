"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth"; 

export default function TestAuthPage() {
  const { signUp, signIn, loading, error } = useAuth();
  const [email, setEmail] = useState("test-user@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState("");

  /**
   * 共通のバックエンド送信処理
   * Firebaseの処理が終わって、トークンが取れたらここを呼び出す！
   */
  const sendToBackend = async (idToken: string, modeMessage: string) => {
    setStatus(`${modeMessage}成功！\n設計書通り GET http://127.0.0.1:8000/api/users/me へトークンを送信中...🚀`);
    console.log("送信するトークン:", idToken);

    const response = await fetch("http://127.0.0.1:8000/api/users/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${idToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "バックエンドへの送信に失敗しました");
    }

    console.log("バックエンドからの返事（プロフィールデータ）:", result);
    
    setStatus(`🎉 完全成功！！！\n\n【バックエンドからのレスポンス】\nID (UID): ${result.id}\n名前 (想定通り): ${result.name}`);
  };

  // 🟦 【新規登録】テスト
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("1. Firebaseにユーザーを【新規登録中】...");
    try {
      const res = await signUp(email, password);
      // 共通のバックエンド送信へゴー！
      await sendToBackend(res.idToken, "1. Firebase新規登録");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "詳細はコンソールを確認してください";
      setStatus(`❌ 新規登録エラー: ${msg}`);
    }
  };

  // 🟩 【ログイン】テスト
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("1. Firebaseでユーザーを【ログイン（サインイン）中】...");
    try {
      const res = await signIn(email, password);
      // 共通のバックエンド送信
      await sendToBackend(res.idToken, "1. Firebaseログイン");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "詳細はコンソールを確認してください";
      setStatus(`❌ ログインエラー: ${msg}`);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>🔐 Firebase 新規登録・ログインテスト画面</h2>
      
      <form style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <label style={{ color: "#000", fontWeight: "bold" }}>
          ✉️ メールアドレス (新規時は毎回変更する): <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", marginTop: "5px" }} />
        </label>
        <label style={{ color: "#000", fontWeight: "bold" }}>
          🔑 パスワード: <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px", color: "#000", marginTop: "5px" }} />
        </label>

        {error && <p style={{ color: "red", fontSize: "14px", margin: 0 }}>エラー: {error}</p>}

        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          {/* 🟦 新規登録テストボタン */}
          <button 
            type="button"
            onClick={handleSignUpSubmit}
            disabled={loading} 
            style={{ padding: "12px", flex: 1, background: "#0070f3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {loading ? "処理中..." : "新規登録テスト"}
          </button>

          {/* 🟩 ログインテストボタン */}
          <button 
            type="button"
            onClick={handleSignInSubmit}
            disabled={loading} 
            style={{ padding: "12px", flex: 1, background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
          >
            {loading ? "処理中..." : "ログインテスト"}
          </button>
        </div>
      </form>

      {status && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#f0f0f0", borderRadius: "5px", whiteSpace: "pre-wrap", color: "#333", border: "1px solid #ccc" }}>
          <strong>ステータスログ:</strong> <br />{status}
        </div>
      )}
    </div>
  );
}