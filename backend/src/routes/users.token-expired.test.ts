import { describe, it, expect, vi, beforeEach } from "vitest";

// Firebase Admin の verifyIdToken をテストごとに差し替えられるようモック
const { mockVerifyIdToken } = vi.hoisted(() => ({
  mockVerifyIdToken: vi.fn(),
}));

vi.mock("../config/firebase.js", () => ({
  adminAuth: { verifyIdToken: mockVerifyIdToken },
}));

// 認証失敗時は prisma に到達しないが、import 解決のためモックしておく
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    profiles: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

import app from "./users.js";

describe("GET /api/users/me 認証切れの扱い", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("トークン期限切れ → 401 TOKEN_EXPIRED を返す", async () => {
    mockVerifyIdToken.mockRejectedValue({ code: "auth/id-token-expired" });

    const res = await app.request("/me", {
      headers: { Authorization: "Bearer expired-token" },
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("TOKEN_EXPIRED");
  });

  it("その他の不正トークン → 401 UNAUTHORIZED を返す", async () => {
    mockVerifyIdToken.mockRejectedValue({ code: "auth/argument-error" });

    const res = await app.request("/me", {
      headers: { Authorization: "Bearer invalid-token" },
    });

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: string };
    expect(body.error).toBe("UNAUTHORIZED");
  });
});
