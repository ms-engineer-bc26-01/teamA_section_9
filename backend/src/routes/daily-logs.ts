import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";

const app = new Hono();

// 認証(Firebase)導入までの仮ユーザーID
// TODO: 認証方針確定後、Firebase ID Token検証に差し替える
const TEMP_USER_ID = "test-user-001";

// GET /api/daily_logs ※S3-28等で実装予定
app.get("/", (c) => {
  return c.json({ message: "肌記録一覧取得の実装" });
});

// POST /api/daily_logs (肌記録の作成・更新)
app.post("/", async (c) => {
  const userId = TEMP_USER_ID;
  const body = await c.req.json();

  // --- 1. 入力チェック(必須項目) ---
  const { log_date, skin_condition, isMenstruation } = body;
  if (!log_date || !skin_condition || typeof isMenstruation !== "boolean") {
    return c.json(
      { error: "BAD_REQUEST", message: "log_date, skin_condition, isMenstruation は必須です" },
      400
    );
  }
  if (![1, 2, 3].includes(skin_condition)) {
    return c.json(
      { error: "BAD_REQUEST", message: "skin_condition は 1〜3 で指定してください" },
      400
    );
  }

  // --- 2. 肌記録を保存(同じユーザー×日付があれば更新、なければ作成) ---
  const log = await prisma.daily_logs.upsert({
    where: {
      user_id_log_date: { user_id: userId, log_date: new Date(log_date) },
    },
    update: {
      skin_condition,
      weather: body.weather ?? null,
      sleep_level: body.sleep_level ?? null,
      meal_balance: body.meal_balance ?? null,
      free_note: body.free_note ?? null,
      isMenstruation,
    },
    create: {
      user_id: userId,
      log_date: new Date(log_date),
      skin_condition,
      weather: body.weather ?? null,
      sleep_level: body.sleep_level ?? null,
      meal_balance: body.meal_balance ?? null,
      free_note: body.free_note ?? null,
      isMenstruation,
    },
  });

  // --- 3. 朝/夜の使用アイテムを保存(指定があった分だけ) ---
  for (const timeOfDay of ["morning", "night"] as const) {
    const group = body.used_items?.[timeOfDay];
    if (group?.item_ids) {
      await prisma.log_used_items.upsert({
        where: {
          daily_log_id_time_of_day: { daily_log_id: log.id, time_of_day: timeOfDay },
        },
        update: { items_ids: group.item_ids },
        create: {
          daily_log_id: log.id,
          time_of_day: timeOfDay,
          items_ids: group.item_ids,
          step_order: 1,
        },
      });
    }
  }

  // --- 4. 保存結果を設計書の形(DailyLogDetail)に整えて返す ---
  const groups = await prisma.log_used_items.findMany({
    where: { daily_log_id: log.id },
  });
  const allItemIds = [...new Set(groups.flatMap((g) => g.items_ids))];
  const items = await prisma.items.findMany({ where: { id: { in: allItemIds } } });
  const itemById = new Map(items.map((i) => [i.id, i]));

  const toGroupJson = (timeOfDay: "morning" | "night") => {
    const g = groups.find((x) => x.time_of_day === timeOfDay);
    if (!g) return null;
    return {
      id: g.id,
      time_of_day: g.time_of_day,
      item_ids: g.items_ids,
      items: g.items_ids
        .map((id) => itemById.get(id))
        .filter(Boolean)
        .map((it) => ({ id: it!.id, brand: it!.brand, name: it!.name })),
    };
  };

  return c.json({
    id: log.id,
    user_id: log.user_id,
    log_date: log.log_date.toISOString().slice(0, 10),
    skin_condition: log.skin_condition,
    weather: log.weather,
    sleep_level: log.sleep_level,
    meal_balance: log.meal_balance,
    free_note: log.free_note,
    isMenstruation: log.isMenstruation,
    used_items: { morning: toGroupJson("morning"), night: toGroupJson("night") },
    created_at: log.created_at,
    updated_at: log.updated_at,
  });
});

export default app;
