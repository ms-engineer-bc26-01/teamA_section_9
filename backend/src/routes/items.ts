import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";
import { unauthorized, internalError } from "../lib/errors.js";

const app = new Hono();

// GET /api/items?q=キーワード&limit=20&offset=0 (化粧品マスタ検索・S3-11)
// 商品名 / ブランド名 を部分一致(大文字小文字無視)で検索。カテゴリ・成分検索はMVP対象外。
// q が無ければ全件対象。limit(デフォルト20, 最大100) / offset(デフォルト0) でページネーション。
app.get("/", async (c) => {
  // --- 認証(他のGETと統一) ---
  const userId = await getFirebaseUid(c);
  if (!userId) {
     return unauthorized(c);
  }

  const q = c.req.query("q")?.trim();

  // --- limit / offset (設計書: limit デフォルト20・1〜100, offset デフォルト0・0以上) ---
  const limitRaw = Number(c.req.query("limit") ?? 20);
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? Math.trunc(limitRaw) : 20, 1), 100);
  const offsetRaw = Number(c.req.query("offset") ?? 0);
  const offset = Math.max(Number.isFinite(offsetRaw) ? Math.trunc(offsetRaw) : 0, 0);

  // --- 検索条件(q があれば 商品名/ブランド名 のOR部分一致、無ければ全件) ---
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { brand: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  try {
    // --- 一覧と総件数を同時取得 ---
    const [items, total] = await prisma.$transaction([
      prisma.items.findMany({
        where,
        include: { category: true },
        orderBy: { name: "asc" },
        skip: offset,
        take: limit,
      }),
      prisma.items.count({ where }),
    ]);

    // --- 設計書の形 { items, total } で返す ---
    return c.json({
      items: items.map((it) => ({
        id: it.id,
        brand: it.brand,
        name: it.name,
        category: { id: it.category.id, name: it.category.name },
      })),
      total,
    });
  } catch (error) {
    console.error("マスタ検索エラー:", error);
    return internalError(c, "検索に失敗しました");
  }
});

export default app;
