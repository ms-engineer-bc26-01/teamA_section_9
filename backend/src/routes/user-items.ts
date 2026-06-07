import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

const app = new Hono();

// 認証(Firebase)導入までの仮ユーザーID
// TODO: 認証方針確定後、Firebase ID Token検証に差し替える
const TEMP_USER_ID = "test-user-001";

// GET /api/user_items (自分の手持ちアイテム一覧)
app.get("/", async (c) => {
  const userId = TEMP_USER_ID;

  // user_itemsを取得し、関連するitem(とそのカテゴリ)も一緒に取る
  const userItems = await prisma.user_items.findMany({
    where: { user_id: userId },
    include: {
      item: {
        include: { category: true },
      },
    },
    orderBy: { created_at: "asc" },
  });

  // API設計書の形(user_items: [{ id, item: {...} }])に整えて返す
  return c.json({
    user_items: userItems.map((ui) => ({
      id: ui.id,
      item: {
        id: ui.item.id,
        brand: ui.item.brand,
        name: ui.item.name,
        category_id: ui.item.categories_id,
        category_name: ui.item.category.name,
        created_at: ui.item.created_at,
        updated_at: ui.item.updated_at,
      },
    })),
  });
});

// POST /api/user_items (手持ち追加) ※S3-12で実装予定
app.post("/", (c) => {
  return c.json({ message: "手持ちアイテムに追加" }, 201);
});

export default app;
