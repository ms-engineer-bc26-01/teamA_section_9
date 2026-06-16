import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";
import { unauthorized } from "../lib/errors.js";

const app = new Hono();

// GET /api/daily_logs (期間指定の肌記録一覧・カレンダー表示用)
app.get("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return unauthorized(c);
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
    return unauthorized(c);
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
    return unauthorized(c);
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

// PATCH /api/daily_logs/:id (既存の肌記録を編集・S3-26)
app.patch("/:id", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return unauthorized(c);
  }

  const id = c.req.param("id");
  const body = await c.req.json();

  // --- 1. 送られてきた基本項目だけ更新データに詰める(部分更新) ---
  const data: {
    skin_condition?: number;
    weather?: string | null;
    sleep_level?: string | null;
    meal_balance?: string | null;
    free_note?: string | null;
    isMenstruation?: boolean;
  } = {};

  if (body.skin_condition !== undefined) {
    if (![1, 2, 3].includes(body.skin_condition)) {
      return c.json(
        { error: "BAD_REQUEST", message: "skin_condition は 1〜3 で指定してください" },
        400
      );
    }
    data.skin_condition = body.skin_condition;
  }
  if (body.weather !== undefined) data.weather = body.weather ?? null;
  if (body.sleep_level !== undefined) data.sleep_level = body.sleep_level ?? null;
  if (body.meal_balance !== undefined) data.meal_balance = body.meal_balance ?? null;
  if (body.free_note !== undefined) data.free_note = body.free_note ?? null;
  if (body.isMenstruation !== undefined) {
    if (typeof body.isMenstruation !== "boolean") {
      return c.json(
        { error: "BAD_REQUEST", message: "isMenstruation は true/false で指定してください" },
        400
      );
    }
    data.isMenstruation = body.isMenstruation;
  }

  // --- 2. 使用アイテムの指定があるか(朝・夜のどちらか) ---
  const hasUsedItems = Boolean(
    body.used_items?.morning?.item_ids || body.used_items?.night?.item_ids
  );

  // 基本項目も使用アイテムも一つも無ければ400
  if (Object.keys(data).length === 0 && !hasUsedItems) {
    return c.json(
      { error: "BAD_REQUEST", message: "更新する項目がありません" },
      400
    );
  }

  // --- 3. 本人の記録か確認(所有チェック)。無ければ404 ---
  const existing = await prisma.daily_logs.findFirst({
    where: { id, user_id: userId },
  });
  if (!existing) {
    return c.json(
      { error: "NOT_FOUND", message: "指定の肌記録が見つかりません" },
      404
    );
  }

  // --- 4. 基本項目を更新(更新するものがあれば) ---
  if (Object.keys(data).length > 0) {
    await prisma.daily_logs.update({ where: { id }, data });
  }

  // --- 5. 朝/夜の使用アイテムを更新(指定があった分だけ・POSTと同じ方式) ---
  for (const timeOfDay of ["morning", "night"] as const) {
    const group = body.used_items?.[timeOfDay];
    if (group?.item_ids) {
      await prisma.log_used_items.upsert({
        where: {
          daily_log_id_time_of_day: { daily_log_id: id, time_of_day: timeOfDay },
        },
        update: { items_ids: group.item_ids },
        create: {
          daily_log_id: id,
          time_of_day: timeOfDay,
          items_ids: group.item_ids,
          step_order: 1,
        },
      });
    }
  }

  // --- 6. 更新後の記録を、設計書の形(DailyLogDetail)で返す ---
  const log = await prisma.daily_logs.findUnique({ where: { id } });

  const groups = await prisma.log_used_items.findMany({
    where: { daily_log_id: id },
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
        .map((iid) => itemById.get(iid))
        .filter(Boolean)
        .map((it) => ({ id: it!.id, brand: it!.brand, name: it!.name })),
    };
  };

  return c.json({
    id: log!.id,
    user_id: log!.user_id,
    log_date: log!.log_date.toISOString().slice(0, 10),
    skin_condition: log!.skin_condition,
    weather: log!.weather,
    sleep_level: log!.sleep_level,
    meal_balance: log!.meal_balance,
    free_note: log!.free_note,
    isMenstruation: log!.isMenstruation,
    used_items: { morning: toGroupJson("morning"), night: toGroupJson("night") },
    created_at: log!.created_at,
    updated_at: log!.updated_at,
  });
});

export default app;
