import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../lib/auth.js", () => ({
  getFirebaseUid: vi.fn(async () => "test-user-1"),
}));

// このルートが使う Prisma のモデルだけモック
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    user_items: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    items: {
      findUnique: vi.fn(),
    },
  },
}));

import userItems from "./user-items.js";
import { prisma } from "../lib/prisma.js";

describe("user_items（正常系）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET 一覧を { user_items: [...] } の形で返す", async () => {
    const now = new Date("2026-06-19T00:00:00.000Z");
    (prisma.user_items.findMany as any).mockResolvedValue([
      {
        id: "ui-1",
        item: {
          id: "item-1",
          brand: "テストブランド",
          name: "テスト化粧水",
          categories_id: "cat-1",
          category: { name: "化粧水" },
          created_at: now,
          updated_at: now,
        },
      },
    ]);

    const res = await userItems.request("/");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      user_items: [
        {
          id: "ui-1",
          item: {
            id: "item-1",
            brand: "テストブランド",
            name: "テスト化粧水",
            category_id: "cat-1",
            category_name: "化粧水",
            created_at: now.toISOString(),
            updated_at: now.toISOString(),
          },
        },
      ],
    });
  });

  it("POST 登録に成功し 201 と { id, item_id } を返す", async () => {
    (prisma.items.findUnique as any).mockResolvedValue({ id: "item-1" });
    (prisma.user_items.findFirst as any).mockResolvedValue(null); // 重複なし
    (prisma.user_items.count as any).mockResolvedValue(0);        // 上限未満
    (prisma.user_items.create as any).mockResolvedValue({ id: "ui-1", item_id: "item-1" });

    const res = await userItems.request("/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: "item-1" }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual({ id: "ui-1", item_id: "item-1" });
  });
});
