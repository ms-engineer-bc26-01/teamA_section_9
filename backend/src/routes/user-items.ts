import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";

const app = new Hono();

// GET /api/user_items (自分の手持ちアイテム一覧)
app.get("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

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

// DELETE /api/user_items/:id (手持ちアイテムを削除)
// 自分の手持ちアイテムのみ削除可能。過去の肌記録(log_used_items)は保持される。
app.delete("/:id", async (c) => {
  // --- 認証(他のエンドポイントと統一) ---
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  const id = c.req.param("id");

  try {
    // --- 自分(user_id)のレコードに限定して削除 ---
    // 他人のIDを指定された場合は user_id 条件で弾かれ、count=0 → 404になる
    const result = await prisma.user_items.deleteMany({
      where: { id, user_id: userId },
    });

    if (result.count === 0) {
      return c.json(
        { error: "NOT_FOUND", message: "指定された手持ちアイテムが存在しません" },
        404
      );
    }

    // --- 成功: 204 No Content (ボディなし) ---
    return c.body(null, 204);
  } catch (error) {
    console.error("手持ちアイテム削除エラー:", error);
    return c.json({ error: "Internal Server Error: 削除に失敗しました" }, 500);
  }
});

export default app;
