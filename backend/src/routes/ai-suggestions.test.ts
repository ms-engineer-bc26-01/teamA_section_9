import { describe, it, expect, vi, beforeEach } from "vitest";

// --- OpenAI をモック ---
// ai-suggestions.ts は `const openai = new OpenAI()` をモジュール読み込み時に実行するので、
// vi.hoisted で先にモック関数を用意し、それを new OpenAI().chat.completions.create に差し込む。
// これでテストごとに「AIが返す中身」を自由に差し替えられる。
const { mockCreate } = vi.hoisted(() => ({ mockCreate: vi.fn() }));
vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: mockCreate } };
  },
}));

// --- 認証をモック（他テストと同じ。常に test-user-1 を返す）---
vi.mock("../lib/auth.js", () => ({
  getFirebaseUid: vi.fn(async () => "test-user-1"),
}));

// --- prisma をモック（POST処理で触るモデルだけ）---
vi.mock("../lib/prisma.js", () => ({
  prisma: {
    profiles: { findUnique: vi.fn() },
    daily_logs: { findMany: vi.fn() },
    user_items: { findMany: vi.fn() },
    ingredients: { findMany: vi.fn() },
    ai_suggestions: { create: vi.fn() },
  },
}));

import aiSuggestions from "./ai-suggestions.js";
import { prisma } from "../lib/prisma.js";

// POST /api/ai_suggestions を叩く共通ヘルパー
const postSuggestion = () =>
  aiSuggestions.request("/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      suggestion_type: "daily_comment",
      target_date: "2026-06-19",
    }),
  });

describe("ai_suggestions・JSONパース処理（正常 / 不正 / 項目不足）", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // POST処理が途中で参照するデータは、空 or 最小でOK（プロンプト生成は空でも動く）
    (prisma.profiles.findUnique as any).mockResolvedValue({
      id: "test-user-1",
      skin_type: "normal",
    });
    (prisma.daily_logs.findMany as any).mockResolvedValue([]);
    (prisma.user_items.findMany as any).mockResolvedValue([]);
    (prisma.ingredients.findMany as any).mockResolvedValue([]);
    // create は渡されたデータをそのまま返す（保存結果＝レスポンスになる）
    (prisma.ai_suggestions.create as any).mockImplementation(
      async ({ data }: any) => ({ id: "sugg-1", ...data }),
    );
  });

  it("正常: AIが正しいJSONを返したら、その内容を返す", async () => {
    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "テスト提案",
              body: "今日はシンプルケアがおすすめです",
              basis: null,
            }),
          },
        },
      ],
    });

    const res = await postSuggestion();
    expect(res.status).toBe(201);

    const body = await res.json();
    expect(body.title).toBe("テスト提案");
    expect(body.body).toBe("今日はシンプルケアがおすすめです");
  });

  it("不正JSON: AIが壊れた文字列を返しても、落ちずにフォールバックを返す", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "これはJSONではありません" } }],
    });

    const res = await postSuggestion();
    // 500で落ちず、201でフォールバックが返ることが肝
    expect(res.status).toBe(201);

    const body = await res.json();
    // ↓ ai-suggestions.ts の catch 内 title と同じ文字列にすること
    expect(body.title).toBe("今回はAIアドバイスを表示できませんでした");
  });

  it("項目不足: JSONだが title が無いとき、デフォルトのタイトルで埋まる", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "{}" } }],
    });

    const res = await postSuggestion();
    expect(res.status).toBe(201);

    const body = await res.json();
    // ↓ create時の `parsed.title ?? "..."` のデフォルト文字列と同じにすること
    expect(body.title).toBe("今日のスキンケア提案");
    expect(body.body).toBeNull();
  });
});
