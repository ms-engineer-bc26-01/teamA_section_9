import {
  classifyApiError,
  createAppError,
  getErrorFallbackContent,
} from "@/lib/errorHandler";

describe("errorHandler", () => {
  it("通信エラーを network カテゴリーに分類できる", () => {
    const error = classifyApiError(new TypeError("Failed to fetch"));

    expect(error.category).toBe("network");
    expect(getErrorFallbackContent(error).title).toBe("通信エラーが発生しました");
  });

  it("401 エラーを auth カテゴリーに分類できる", () => {
    const error = classifyApiError({
      message: "Unauthorized",
      statusCode: 401,
    });

    expect(error.category).toBe("auth");
    expect(getErrorFallbackContent(error).guidance).toContain(
      "再ログイン後に同じ操作をやり直してください。",
    );
  });

  it("AI エラーに対して専用メッセージとアクションを返す", () => {
    const error = createAppError({
      category: "ai",
      message: "AIの応答形式が不正です。時間をおいて再度お試しください。",
      details: "response is missing title",
      originalError: new Error("response is missing title"),
    });

    const content = getErrorFallbackContent(error);

    expect(content.title).toBe("AIの提案を生成できませんでした");
    expect(content.actionLabel).toBe("もう一度試す");
    expect(content.message).toBe(error.message);
  });

  it("分類済みの AppError はそのまま再利用できる", () => {
    const error = createAppError({
      category: "api",
      message: "手動で設定した API エラーです。",
      details: "server responded 500",
      originalError: new Error("server responded 500"),
    });

    expect(classifyApiError(error)).toBe(error);
  });
});
