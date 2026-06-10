import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { adminAuth } from "../config/firebase.js";

const app = new Hono();

// GET /api/users/me (プロフィール取得・未登録時は初期作成)
app.get("/me", async (c) => {
  // 1. リクエストの Authorization ヘッダーから IDトークンを取得
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: トークンがありません" }, 401);
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // 2. Firebase Admin SDK でトークンを検証
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    // Firebase側に登録されている名前があれば取得（なければnull）
    const name = decodedToken.name || null;

    console.log(`🔥 [Backend] Firebase トークン解読成功！ UID: ${firebaseUid}`);

    // 3. DB（profiles）に該当UIDがいるか探す
    let profile = await prisma.profiles.findUnique({
      where: { id: firebaseUid },
    });

    // 4. DBにいなければ、その場で新規レコードを作成（未登録時は初期作成仕様）
    if (!profile) {
      console.log(`✨ 新規ユーザーのためDBにプロフィールを作成します: ${name}`);
      profile = await prisma.profiles.create({
        data: {
          id: firebaseUid,
          name: name,
        },
      });
    } else {
      console.log(`👋 既存ユーザーのログインです: ${profile.name}`);
    }

    // 5. API設計書のUserスキーマの形で返す
    return c.json(
      {
        id: profile.id,
        name: profile.name,
        birth_day: profile.birth_day
          ? profile.birth_day.toISOString().slice(0, 10) // "1995-04-01" 形式に変換
          : null,
        skin_type: profile.skin_type,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      200,
    );
  } catch (error) {
    console.error("認証エラー:", error);
    return c.json({ error: "Unauthorized: トークンの検証に失敗しました" }, 401);
  }
});

// PATCH /api/users/me (プロフィール編集・S3-10)
app.patch("/me", async (c) => {
  // --- 認証(GET /me と同じインライン方式) ---
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: トークンがありません" }, 401);
  }
  const idToken = authHeader.split("Bearer ")[1];

  let firebaseUid: string;
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    firebaseUid = decodedToken.uid;
  } catch (error) {
    console.error("認証エラー:", error);
    return c.json({ error: "Unauthorized: トークンの検証に失敗しました" }, 401);
  }

  // --- ボディ取得 ---
  let body: { name?: string | null; birth_day?: string | null; skin_type?: string | null };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Bad Request: JSONボディが不正です" }, 400);
  }

  // --- 送られてきた項目だけ更新データに詰める(部分更新) ---
  const data: { name?: string | null; birth_day?: Date | null; skin_type?: string | null } = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.skin_type !== undefined) data.skin_type = body.skin_type;
  if (body.birth_day !== undefined) {
    if (body.birth_day === null) {
      data.birth_day = null;
    } else {
      const d = new Date(body.birth_day);
      if (isNaN(d.getTime())) {
        return c.json({ error: "Bad Request: birth_day は YYYY-MM-DD 形式で送ってください" }, 400);
      }
      data.birth_day = d;
    }
  }

  // --- 保存(行が無ければ作る upsert) ---
  try {
    const profile = await prisma.profiles.upsert({
      where: { id: firebaseUid },
      update: data,
      create: { id: firebaseUid, ...data },
    });
    console.log(`📝 プロフィール更新: ${profile.id}`);
    return c.json(
      {
        id: profile.id,
        name: profile.name,
        birth_day: profile.birth_day
          ? profile.birth_day.toISOString().slice(0, 10)
          : null,
        skin_type: profile.skin_type,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
      200,
    );
  } catch (error) {
    console.error("プロフィール更新エラー:", error);
    return c.json({ error: "Internal Server Error: 更新に失敗しました" }, 500);
  }
});

export default app;
