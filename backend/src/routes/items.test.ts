import { describe, it, expect, vi, beforeEach } from "vitest";

// --- モック①: 認証は常に成功させ、固定の userId を返す ---
vi.mock("../lib/auth.js", () => ({
  getFirebaseUid: vi.fn(async () => "test-user-1"),
}));

// --- モック②: Prisma（実DBには一切つながない） ---
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    items: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import items from "./items.js";
import { prisma } from "../lib/prisma.js";

describe("GET /api/items 化粧品検索（正常系）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("検索結果を { items, total } の形で返す", async () => {
    const mockItems = [
      {
        id: "item-1",
        brand: "テストブランド",
        name: "テスト化粧水",
        category: { id: "cat-1", name: "化粧水" },
      },
    ];
    (prisma.$transaction as any).mockResolvedValue([mockItems, 1]);

    const res = await items.request("/?q=化粧水");

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      items: [
        {
          id: "item-1",
          brand: "テストブランド",
          name: "テスト化粧水",
          category: { id: "cat-1", name: "化粧水" },
        },
      ],
      total: 1,
    });
  });
});
