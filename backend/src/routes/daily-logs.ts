import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";

const app = new Hono();

// GET /api/daily_logs (期間指定の肌記録一覧・カレンダー表示用)
app.get("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  const startDate = c.req.query("start_date");
  const endDate = c.req.query("end_date");

  if (!startDate || !endDate) {
    return c.json(
      { error: "BAD_REQUEST", message: "start_date と end_date は必須です" },
      400
    );
  }

  const logs = await prisma.daily_logs.findMany({
    where: {
      user_id: userId,
      log_date: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    orderBy: { log_date: "asc" },
    select: { id: true, log_date: true, skin_condition: true },
  });

  return c.json({
    logs: logs.map((l) => ({
      id: l.id,
      log_date: l.log_date.toISOString().slice(0, 10),
      skin_condition: l.skin_condition,
    })),
  });
});

// GET /api/daily_logs/:log_date (指定日の肌記録取得)
app.get("/:log_date", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  const logDate = c.req.param("log_date");

  const log = await prisma.daily_logs.findUnique({
    where: {
      user_id_log_date: { user_id: userId, log_date: new Date(logDate) },
    },
  });

  if (!log) {
    return c.json({ log: null });
  }

  const logGroups = await prisma.log_used_items.findMany({
    where: { daily_log_id: log.id },
  });
  const logItemIds = [...new Set(logGroups.flatMap((g) => g.items_ids))];
  const logItems = await prisma.items.findMany({
    where: { id: { in: logItemIds } },
  });
  const logItemById = new Map(logItems.map((i) => [i.id, i]));

  const toLogGroupJson = (timeOfDay: "morning" | "night") => {
    const g = logGroups.find((x) => x.time_of_day === timeOfDay);
    if (!g) return null;
    return {
      id: g.id,
      time_of_day: g.time_of_day,
      item_ids: g.items_ids,
      items: g.items_ids
        .map((id) => logItemById.get(id))
        .filter(Boolean)
        .map((it) => ({ id: it!.id, brand: it!.brand, name: it!.name })),
    };
  };

  return c.json({
    log: {
      id: log.id,
      user_id: log.user_id,
      log_date: log.log_date.toISOString().slice(0, 10),
      skin_condition: log.skin_condition,
      weather: log.weather,
      sleep_level: log.sleep_level,
      meal_balance: log.meal_balance,
      free_note: log.free_note,
      isMenstruation: log.isMenstruation,
      used_items: {
        morning: toLogGroupJson("morning"),
        night: toLogGroupJson("night"),
      },
      created_at: log.created_at,
      updated_at: log.updated_at,
    },
  });
});

// POST /api/daily_logs (肌記録の作成・更新)
app.post("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

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
