import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { PrismaClient } from "@prisma/client";
import dailyLogs from "./routes/daily-logs.js";
import users from "./routes/users.js";
import items from "./routes/items.js";
import userItems from "./routes/user-items.js";
import aiSuggestions from "./routes/ai-suggestions.js";
import { swaggerUI } from "@hono/swagger-ui";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();
const prisma = new PrismaClient();

// 全てのルートにcors適用（許可オリジンを限定）
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:3000",
      // 本番デプロイ時はフロントのURLをここに追加（例: "https://your-app.vercel.app"）
    ],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// 全てのリクエストのログ取得
app.use("*", logger());

// 各APIのルーティング
app.route("/api/users", users);
app.route("/api/daily_logs", dailyLogs);
app.route("/api/items", items);
app.route("/api/user_items", userItems);
app.route("/api/ai_suggestions", aiSuggestions);

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

// openapi.yml を静的ファイルとして配信
app.use("/docs/*", serveStatic({ root: "./" }));

// Swagger UI画面
app.get(
  "/docs",
  swaggerUI({
    url: "/docs/openapi.yml",
  }),
);

// APIテスト用
app.get("/api/test", (c) => {
  return c.json({
    status: "success",
    message: "Hello Hono!",
  });
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
    <div style="font-family: sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto;">
      <h1 style="text-align: center;">SkinMate Backend Status</h1>
      <div style="background: #f4f4f4; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; text-align: center;">
        <p style="font-size: 1.2rem; margin: 0;">Database: <strong>${dbStatus}</strong></p>
      </div>

      <h2 style="font-size: 1rem; color: #666; border-bottom: 2px solid #eee; padding-bottom: 0.5rem;">API Endpoints (GET)</h2>
      <ul style="list-style: none; padding: 0;">
        <li style="margin: 0.8rem 0;"><a href="/api/test" style="color: #007bff; text-decoration: none;">🔗 /api/test</a> (Hello Hono!)</li>
        <li style="margin: 0.8rem 0;"><a href="/api/users/me" style="color: #007bff; text-decoration: none;">🔗 /api/users/me</a> (Profile)</li>
        <li style="margin: 0.8rem 0;"><a href="/api/daily_logs" style="color: #007bff; text-decoration: none;">🔗 /api/daily_logs</a> (Logs)</li>
        <li style="margin: 0.8rem 0;"><a href="/api/items" style="color: #007bff; text-decoration: none;">🔗 /api/items</a> (Item Master)</li>
        <li style="margin: 0.8rem 0;"><a href="/api/user_items" style="color: #007bff; text-decoration: none;">🔗 /api/user_items</a> (My Items)</li>
        <li style="margin: 0.8rem 0;"><a href="/api/ai_suggestions" style="color: #007bff; text-decoration: none;">🔗 /api/ai_suggestions</a> (AI Suggestions)</li>
      </ul>
      
      <hr style="margin-top: 2rem; border: 0; border-top: 1px solid #eee;" />
      <p style="font-size: 0.8rem; color: #999; text-align: center;">SkinMate API v0.2.0 - Node.js Server</p>
    </div>
  `);
});

serve({ fetch: app.fetch, port: 8000 });
