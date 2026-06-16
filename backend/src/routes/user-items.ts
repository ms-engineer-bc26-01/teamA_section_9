import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";
import { errorResponse, unauthorized, badRequest, notFound, conflict, internalError } from "../lib/errors.js";

const app = new Hono();

// GET /api/user_items (自分の手持ちアイテム一覧)
app.get("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return unauthorized(c);
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
    return unauthorized(c);
  }

  // --- ボディ取得 ---
  let body: { item_id?: string };
  try {
    body = await c.req.json();
  } catch {
    return badRequest(c, "リクエストボディが不正です");
  }

  const itemId = body.item_id;
  if (!itemId) {
    return badRequest(c, "item_id は必須です");
  }

  try {
    // --- 1. 指定アイテムがマスタに存在するか確認 ---
    const item = await prisma.items.findUnique({ where: { id: itemId } });
    if (!item) {
      return notFound(c, "指定されたアイテムが存在しません");
    }

    // --- 2. すでに手持ち登録済みか確認(重複防止) ---
    const existing = await prisma.user_items.findFirst({
      where: { user_id: userId, item_id: itemId },
    });
    if (existing) {
      return conflict(c, "ALREADY_EXISTS", "すでに手持ちアイテムとして登録済みです");
    }

    // --- 3. 上限10件チェック ---
    const count = await prisma.user_items.count({ where: { user_id: userId } });
    if (count >= 10) {
      return errorResponse(c, 400, "ITEM_LIMIT_EXCEEDED", "手持ちアイテムは10件までです");
    }

    // --- 4. 登録 ---
    const created = await prisma.user_items.create({
      data: { user_id: userId, item_id: itemId },
    });

    // --- 設計書の形 { id, item_id } で返す ---
    return c.json({ id: created.id, item_id: created.item_id }, 201);
  } catch (error) {
    console.error("手持ちアイテム追加エラー:", error);
    return internalError(c, "登録に失敗しました");
  }
});

// DELETE /api/user_items/:id (手持ちアイテムを削除)
// 自分の手持ちアイテムのみ削除可能。過去の肌記録(log_used_items)は保持される。
app.delete("/:id", async (c) => {
  // --- 認証(他のエンドポイントと統一) ---
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return unauthorized(c);
  }

  const id = c.req.param("id");

  try {
    // --- 自分(user_id)のレコードに限定して削除 ---
    // 他人のIDを指定された場合は user_id 条件で弾かれ、count=0 → 404になる
    const result = await prisma.user_items.deleteMany({
      where: { id, user_id: userId },
    });

    if (result.count === 0) {
      return notFound(c, "指定された手持ちアイテムが存在しません");
    }

    // --- 成功: 204 No Content (ボディなし) ---
    return c.body(null, 204);
  } catch (error) {
    console.error("手持ちアイテム削除エラー:", error);
    return internalError(c, "削除に失敗しました");
  }
});

export default app;
