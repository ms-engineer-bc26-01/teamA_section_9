"use client";

import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth"; 

export default function TestAuthPage() {
  const { signUp, loading } = useAuth();
  const [email, setEmail] = useState("test-user@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState("");

  const handleTestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("1. Firebaseにユーザーを登録中...");
    try {
      // ① Firebaseに登録して証明書（IdToken）をもらう
      const userCredential = await signUp(email, password);
      
      // Firebaseから本物のトークンを取り出す
      const idToken = await userCredential.user.getIdToken();
      
      setStatus("2. Firebase登録完了！設計書通り GET /api/users/me へデータを送信中...");
      console.log("取得したトークン:", idToken);

      // ② Authorizationヘッダーにトークンを載せてGETで叩く
      const response = await fetch("http://localhost:8000/api/users/me", {
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
      
      setStatus(`🎉 完全成功！\n\n【バックエンドからのレスポンス】\nID (UID): ${result.id}\n名前 (nullが想定通り): ${result.name}`);

    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "詳細はコンソールを確認してください";
      setStatus(`❌ エラー発生: ${msg}`);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2>🧪 Firebase × Hono 疎通テストページ</h2>
      <p style={{ color: "#666" }}>メールとパスワードで認証とDB初期登録を行うテスト</p>
      
      <form onSubmit={handleTestSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <label>
          ✉️ メールアドレス (テストごとに変えてね): <br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px" }} />
        </label>
        <label>
          🔑 パスワード: <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px" }} />
        </label>

        <button type="submit" disabled={loading} style={{ padding: "10px", background: "#0070f3", color: "white", border: "none", cursor: "pointer" }}>
          {loading ? "送信中..." : "firebase登録"}
        </button>
      </form>

      {status && (
        <div style={{ marginTop: "20px", padding: "15px", background: "#f0f0f0", borderRadius: "5px", whiteSpace: "pre-wrap" }}>
          <strong>ステータス:</strong> <br />{status}
        </div>
      )}
    </div>
  );
}