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

// POST /api/user_items (手持ちアイテム追加・S3-12)
// 化粧品マスタのアイテムをログインユーザーの手持ちとして登録する。
// MVPでは手持ちの登録上限を10件とする。
app.post("/", async (c) => {
  // --- 認証(他のエンドポイントと統一) ---
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  // --- ボディ取得 ---
  let body: { item_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "BAD_REQUEST", message: "リクエストボディが不正です" }, 400);
  }

  const itemId = body.item_id;
  if (!itemId) {
    return c.json({ error: "BAD_REQUEST", message: "item_id は必須です" }, 400);
  }

  try {
    // --- 1. 指定アイテムがマスタに存在するか確認 ---
    const item = await prisma.items.findUnique({ where: { id: itemId } });
    if (!item) {
      return c.json(
        { error: "NOT_FOUND", message: "指定されたアイテムが存在しません" },
        404
      );
    }

    // --- 2. すでに手持ち登録済みか確認(重複防止) ---
    const existing = await prisma.user_items.findFirst({
      where: { user_id: userId, item_id: itemId },
    });
    if (existing) {
      return c.json(
        { error: "ALREADY_EXISTS", message: "すでに手持ちアイテムとして登録済みです" },
        409
      );
    }

    // --- 3. 上限10件チェック ---
    const count = await prisma.user_items.count({ where: { user_id: userId } });
    if (count >= 10) {
      return c.json(
        { error: "ITEM_LIMIT_EXCEEDED", message: "手持ちアイテムは10件までです" },
        400
      );
    }

    // --- 4. 登録 ---
    const created = await prisma.user_items.create({
      data: { user_id: userId, item_id: itemId },
    });

    // --- 設計書の形 { id, item_id } で返す ---
    return c.json({ id: created.id, item_id: created.item_id }, 201);
  } catch (error) {
    console.error("手持ちアイテム追加エラー:", error);
    return c.json({ error: "Internal Server Error: 登録に失敗しました" }, 500);
  }
});

export default app;
