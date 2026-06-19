import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/auth.js", () => ({
  getFirebaseUid: vi.fn(async () => "test-user-1"),
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    daily_logs: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    log_used_items: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    items: {
      findMany: vi.fn(),
    },
  },
}));

import dailyLogs from "./daily-logs.js";
import { prisma } from "../lib/prisma.js";

describe("daily_logs（正常系）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET 期間一覧を { logs: [...] } で返す", async () => {
    (prisma.daily_logs.findMany as any).mockResolvedValue([
      {
        id: "log-1",
        log_date: new Date("2026-06-15T00:00:00.000Z"),
        skin_condition: 2,
      },
    ]);

    const res = await dailyLogs.request("/?start_date=2026-06-01&end_date=2026-06-30");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      logs: [{ id: "log-1", log_date: "2026-06-15", skin_condition: 2 }],
    });
  });

  it("POST 肌記録を作成して詳細を返す", async () => {
    const ts = new Date("2026-06-19T10:00:00.000Z");
    (prisma.daily_logs.upsert as any).mockResolvedValue({
      id: "log-1",
      user_id: "test-user-1",
      log_date: new Date("2026-06-19T00:00:00.000Z"),
      skin_condition: 2,
      weather: null,
      sleep_level: null,
      meal_balance: null,
      free_note: null,
      isMenstruation: false,
      created_at: ts,
      updated_at: ts,
    });
    // 使用アイテム無しのシンプルな作成なので、関連取得は空配列でOK
    (prisma.log_used_items.findMany as any).mockResolvedValue([]);
    (prisma.items.findMany as any).mockResolvedValue([]);

    const res = await dailyLogs.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        log_date: "2026-06-19",
        skin_condition: 2,
        isMenstruation: false,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: "log-1",
      user_id: "test-user-1",
      log_date: "2026-06-19",
      skin_condition: 2,
      weather: null,
      sleep_level: null,
      meal_balance: null,
      free_note: null,
      isMenstruation: false,
      used_items: { morning: null, night: null },
      created_at: ts.toISOString(),
      updated_at: ts.toISOString(),
    });
  });
});
