const {
  getMock,
  postMock,
  patchMock,
  deleteMock,
  createAppErrorMock,
  logErrorMock,
} = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
  createAppErrorMock: vi.fn(),
  logErrorMock: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

vi.mock("@/lib/errorHandler", () => ({
  createAppError: createAppErrorMock,
  logError: logErrorMock,
}));

import {
  createAiSuggestion,
  getDailyCommentAiSuggestion,
  getLatestAiSuggestion,
  getLatestHomeSummaryAiSuggestion,
} from "@/api/aiSuggestions";

describe("aiSuggestions API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
    createAppErrorMock.mockReset();
    logErrorMock.mockReset();
    createAppErrorMock.mockImplementation((input) => ({
      name: "AppError",
      ...input,
    }));
  });

  it("AI提案作成で home_summary のリクエストとレスポンス整形ができる", async () => {
    postMock.mockResolvedValue({
      id: "ai-1",
      user_id: "user-1",
      suggested_at: "2026-06-20",
      suggestion_type: "home_summary",
      title: "今週のまとめ",
      body: null,
      basis: "記録データ",
      created_at: "2026-06-20T10:00:00.000Z",
    });

    const result = await createAiSuggestion({
      suggestionType: "home_summary",
      startDate: "2026-06-01",
      endDate: "2026-06-07",
    });

    expect(postMock).toHaveBeenCalledWith("/api/ai_suggestions", {
      suggestion_type: "home_summary",
      start_date: "2026-06-01",
      end_date: "2026-06-07",
    });
    expect(result).toEqual({
      id: "ai-1",
      userId: "user-1",
      suggestedAt: "2026-06-20",
      suggestionType: "home_summary",
      title: "今週のまとめ",
      body: undefined,
      basis: "記録データ",
      createdAt: "2026-06-20T10:00:00.000Z",
    });
  });

  it("日次コメント取得ヘルパーで daily_comment の作成リクエストを送れる", async () => {
    postMock.mockResolvedValue({
      id: "ai-2",
      user_id: "user-2",
      suggested_at: "2026-06-21",
      suggestion_type: "daily_comment",
      title: "今日のコメント",
      body: "保湿を意識しましょう",
      basis: null,
      created_at: "2026-06-21T09:00:00.000Z",
    });

    const result = await getDailyCommentAiSuggestion("2026-06-21");

    expect(postMock).toHaveBeenCalledWith("/api/ai_suggestions", {
      suggestion_type: "daily_comment",
      target_date: "2026-06-21",
    });
    expect(result).toEqual({
      id: "ai-2",
      userId: "user-2",
      suggestedAt: "2026-06-21",
      suggestionType: "daily_comment",
      title: "今日のコメント",
      body: "保湿を意識しましょう",
      basis: undefined,
      createdAt: "2026-06-21T09:00:00.000Z",
    });
  });

  it("最新提案取得で検索クエリを付けて先頭要素を整形できる", async () => {
    getMock.mockResolvedValue({
      suggestions: [
        {
          id: "ai-3",
          user_id: "user-3",
          suggested_at: "2026-06-22",
          suggestion_type: "daily_comment",
          title: "最新の提案",
          body: "睡眠を確保しましょう",
          basis: "睡眠データ",
          created_at: "2026-06-22T08:00:00.000Z",
        },
      ],
      total: 1,
    });

    const result = await getLatestAiSuggestion("daily_comment");

    expect(getMock).toHaveBeenCalledWith(
      "/api/ai_suggestions?suggestion_type=daily_comment&sort=desc&limit=1",
    );
    expect(result).toEqual({
      id: "ai-3",
      userId: "user-3",
      suggestedAt: "2026-06-22",
      suggestionType: "daily_comment",
      title: "最新の提案",
      body: "睡眠を確保しましょう",
      basis: "睡眠データ",
      createdAt: "2026-06-22T08:00:00.000Z",
    });
  });

  it("最新ホーム提案取得ヘルパーで候補がなければ null を返す", async () => {
    getMock.mockResolvedValue({
      suggestions: [],
      total: 0,
    });

    await expect(getLatestHomeSummaryAiSuggestion()).resolves.toBeNull();
    expect(getMock).toHaveBeenCalledWith(
      "/api/ai_suggestions?suggestion_type=home_summary&sort=desc&limit=1",
    );
  });

  it("AI提案作成で必須項目が欠けたレスポンスなら AppError を投げて記録する", async () => {
    postMock.mockResolvedValue({
      id: "broken-ai",
      title: "壊れたレスポンス",
    });

    await expect(
      createAiSuggestion({
        suggestionType: "daily_comment",
        targetDate: "2026-06-23",
      }),
    ).rejects.toMatchObject({
      category: "ai",
      message: "AIの応答形式が不正です。時間をおいて再度お試しください。",
      details:
        "createAiSuggestion response is missing required AI suggestion fields.",
    });

    expect(createAppErrorMock).toHaveBeenCalledWith({
      category: "ai",
      message: "AIの応答形式が不正です。時間をおいて再度お試しください。",
      details:
        "createAiSuggestion response is missing required AI suggestion fields.",
      originalError: expect.any(Error),
    });
    expect(logErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "ai",
      }),
      "aiSuggestions",
    );
  });

  it("最新提案取得で不正な提案要素を検知したら AppError を投げる", async () => {
    getMock.mockResolvedValue({
      suggestions: [
        {
          id: "ai-4",
          title: "invalid",
        },
      ],
      total: 1,
    });

    await expect(getLatestAiSuggestion("home_summary")).rejects.toMatchObject({
      category: "ai",
      message: "AIの応答形式が不正です。時間をおいて再度お試しください。",
      details:
        "getLatestAiSuggestion response contains an invalid AI suggestion entry.",
    });

    expect(createAppErrorMock).toHaveBeenCalledWith({
      category: "ai",
      message: "AIの応答形式が不正です。時間をおいて再度お試しください。",
      details:
        "getLatestAiSuggestion response contains an invalid AI suggestion entry.",
      originalError: expect.any(Error),
    });
    expect(logErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "ai",
      }),
      "aiSuggestions",
    );
  });
});
