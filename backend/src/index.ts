import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { PrismaClient } from "@prisma/client";

const app = new Hono();
const prisma = new PrismaClient();

// 全てのルートにcors適用
app.use("/*", cors());

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
