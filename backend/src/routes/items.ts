import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";

const app = new Hono();

// GET /api/items?q=キーワード (化粧品マスタ検索・S3-11)
// 商品名 / ブランド / カテゴリ名 を部分一致(大文字小文字無視)で検索。
// q が無ければ全件返す。
app.get("/", async (c) => {
  // --- 認証(他のGETと統一) ---
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  const q = c.req.query("q")?.trim();

  // --- 検索(q があれば name/brand/カテゴリ名 をOR部分一致、無ければ全件) ---
  const items = await prisma.items.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } },
            { category: { name: { contains: q, mode: "insensitive" } } },
          ],
        }
      : undefined,
    include: { category: true },
    orderBy: { name: "asc" },
  });

  // --- 設計書の形で返す ---
  return c.json({
    items: items.map((it) => ({
      id: it.id,
      brand: it.brand,
      name: it.name,
      category: { id: it.category.id, name: it.category.name },
    })),
  });
});

export default app;
