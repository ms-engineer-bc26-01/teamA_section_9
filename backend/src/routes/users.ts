import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

const app = new Hono();

// 認証(Firebase)導入までの仮ユーザーID
// TODO: 認証方針確定後、Firebase ID Token検証に差し替える
const TEMP_USER_ID = "test-user-001";

// GET /api/users/me (プロフィール取得・未登録時は初期作成)
app.get("/me", async (c) => {
  const userId = TEMP_USER_ID;

  // 1. DBから該当ユーザーを探す
  let profile = await prisma.profiles.findUnique({
    where: { id: userId },
  });

  // 2. いなければ新規作成(API設計書「未登録時は初期作成」に対応)
  if (!profile) {
    profile = await prisma.profiles.create({
      data: { id: userId },
    });
  }

  // 3. API設計書のUserスキーマの形で返す
  return c.json({
    id: profile.id,
    name: profile.name,
    birth_day: profile.birth_day
      ? profile.birth_day.toISOString().slice(0, 10) // "1995-04-01" 形式に
      : null,
    skin_type: profile.skin_type,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  });
});

// PATCH /api/users/me (プロフィール編集) ※S3-10で実装予定
app.patch("/me", (c) => {
  return c.json({ message: "プロフィール編集" });
});

export default app;
