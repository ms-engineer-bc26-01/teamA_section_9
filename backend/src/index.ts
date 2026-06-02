import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

// 全てのルートにcors適用
app.use("/*", cors());

// サーバー内部で例外が起きた時の処理
app.onError((err, c) => {
  console.error("[ERROR] API Exception:", err);
  return c.json(
    {
      status: "error",
      message: err.message || "予期せぬエラーが発生しました",
      // development環境の時だけ詳細を表示
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
    500,
  );
});

// 存在しないURLが叩かれた時の処理
app.notFound((c) => {
  return c.json(
    {
      status: "error",
      message: "指定されたAPIエンドポイントが見つかりません",
    },
    404,
  );
});

// バックエンド疎通確認用
app.get("/", async (c) => {
  let dbStatus = "Checking...";
  try {
    // DBへクエリを投げて接続をテスト
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "✅ 接続完了 (Connected)";
  } catch (e) {
    console.error("DB Connection Error:", e);
    dbStatus = "❌ 接続エラー (Disconnected)";
  }

  return c.html(`
    <div style="font-family: sans-serif; padding: 2rem; text-align: center;">
      <h1>SkinMate Backend Status</h1>
      <p style="font-size: 1.2rem;">Database: <strong>${dbStatus}</strong></p>
      <hr />
      <p>API: <a href="/api/test">/api/test</a></p>
    </div>
  `);
});

// APIテスト用
app.get("/api/test", (c) => {
  return c.json({
    status: "success",
    message: "Hello Hono!",
  });
});

serve({ fetch: app.fetch, port: 8000 });
