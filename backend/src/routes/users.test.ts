import { describe, it, expect, vi, beforeEach } from "vitest";

// users.ts は getFirebaseUid ではなく adminAuth.verifyIdToken を直接使うので、
// モックするのは ../config/firebase.js（他ルートと違う点）
vi.mock("../config/firebase.js", () => ({
  adminAuth: {
    verifyIdToken: vi.fn(async () => ({ uid: "test-user-1", name: "おまつ" })),
  },
}));

vi.mock("../lib/prisma.js", () => ({
  prisma: {
    profiles: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import users from "./users.js";
import { prisma } from "../lib/prisma.js";

describe("users プロフィール（正常系）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /me 既存プロフィールを返す", async () => {
    const created = new Date("2026-01-01T00:00:00.000Z");
    const updated = new Date("2026-06-01T00:00:00.000Z");
    (prisma.profiles.findUnique as any).mockResolvedValue({
      id: "test-user-1",
      name: "おまつ",
      birth_day: new Date("1990-05-15T00:00:00.000Z"),
      skin_type: "combination",
      created_at: created,
      updated_at: updated,
    });

    const res = await users.request("/me", {
      headers: { Authorization: "Bearer faketoken" },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: "test-user-1",
      name: "おまつ",
      birth_day: "1990-05-15",
      skin_type: "combination",
      created_at: created.toISOString(),
      updated_at: updated.toISOString(),
    });
  });

  it("PATCH /me プロフィールを更新して返す", async () => {
    const created = new Date("2026-01-01T00:00:00.000Z");
    const updated = new Date("2026-06-19T00:00:00.000Z");
    (prisma.profiles.upsert as any).mockResolvedValue({
      id: "test-user-1",
      name: "新しい名前",
      birth_day: new Date("1990-01-01T00:00:00.000Z"),
      skin_type: "dry",
      created_at: created,
      updated_at: updated,
    });

    const res = await users.request("/me", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer faketoken",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "新しい名前", skin_type: "dry", birth_day: "1990-01-01" }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      id: "test-user-1",
      name: "新しい名前",
      birth_day: "1990-01-01",
      skin_type: "dry",
      created_at: created.toISOString(),
      updated_at: updated.toISOString(),
    });
  });
});
