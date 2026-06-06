import { Hono } from "hono";
import { PrismaClient } from "@prisma/client";
import { adminAuth } from "../config/firebase.js";

const app = new Hono();
const prisma = new PrismaClient();

app.get("/me", async (c) => {
  // 1. リクエストの Authorization ヘッダーから IDトークンを取得
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: トークンがありません" }, 401);
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // 2. Firebase Admin SDK でトークンを検証（解読）
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || null;

    console.log(`🔥 [Backend] Firebase トークン解読成功！ UID: ${firebaseUid}`);

    // 3. DB（profiles）に該当UIDがいるか探す
    let profile = await prisma.profiles.findUnique({
      where: { id: firebaseUid },
    });

    // 4. DBにいなければ、その場で新規レコードを作成
    if (!profile) {
      console.log(
        `✨ 新規ユーザーのため、DBにプロフィールを作成します: ${name}`,
      );
      profile = await prisma.profiles.create({
        data: {
          id: firebaseUid,
          name: name,
          // ※もしスキーマに他に必要な初期値があればここに追加
        },
      });
    } else {
      console.log(`👋 既存ユーザーのログインです: ${profile.name}`);
    }

    // 5. 取得、または新規作成したプロフィール情報を200で返す
    return c.json(profile, 200);
  } catch (error) {
    console.error("認証エラー:", error);
    return c.json({ error: "Unauthorized: トークンの検証に失敗しました" }, 401);
  }
});

export default app;
