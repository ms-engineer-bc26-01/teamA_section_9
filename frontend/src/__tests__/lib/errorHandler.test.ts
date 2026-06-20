import { describe, expect, it } from "vitest";
import {
  getErrorDisplayInfo,
  isAppError,
  toAppError,
} from "@/lib/errorHandler";
import type { AppError } from "@/types/error";

describe("errorHandler", () => {
  describe("エラーカテゴリー判定", () => {
    it("通信エラーを network カテゴリーとして判定する", () => {
      const appError = toAppError(new TypeError("Failed to fetch"));
      expect(appError.category).toBe("network");
    });

    it("認証エラーを auth カテゴリーとして判定する", () => {
      const appError = toAppError(new Error("401 Unauthorized"));
      expect(appError.category).toBe("auth");
      expect(appError.statusCode).toBe(401);
    });

    it("AI失敗エラーを ai カテゴリーとして判定する", () => {
      const appError = toAppError(new Error("AI suggestion failed"));
      expect(appError.category).toBe("ai");
    });

    it("通常エラーを api カテゴリーとして判定する", () => {
      const appError = toAppError(new Error("Internal Server Error"));
      expect(appError.category).toBe("api");
    });

    it("非Error値を unknown カテゴリーとして判定する", () => {
      const appError = toAppError({ code: "UNEXPECTED" });
      expect(appError.category).toBe("unknown");
    });
  });

  describe("エラーメッセージ生成", () => {
    it("サーバー由来メッセージがあれば detail に反映する", () => {
      const error: AppError = {
        category: "api",
        message: "サーバー側で詳細メッセージが返されました",
      };

      const info = getErrorDisplayInfo(error);

      expect(info.title).toBe("サーバーエラー");
      expect(info.detail).toBe("サーバー側で詳細メッセージが返されました");
      expect(info.guidance).toContain("しばらく時間をおいて");
    });
  });

  describe("リトライ可能判定", () => {
    it("network はリトライ可能である", () => {
      const info = getErrorDisplayInfo({ category: "network", message: "通信失敗" });
      expect(info.canRetry).toBe(true);
    });

    it("auth はリトライ不可である", () => {
      const info = getErrorDisplayInfo({
        category: "auth",
        message: "認証失敗",
      });
      expect(info.canRetry).toBe(false);
    });

    it("ai はリトライ可能である", () => {
      const info = getErrorDisplayInfo({ category: "ai", message: "AI失敗" });
      expect(info.canRetry).toBe(true);
    });

    it("api はリトライ可能である", () => {
      const info = getErrorDisplayInfo({ category: "api", message: "API失敗" });
      expect(info.canRetry).toBe(true);
    });

    it("unknown はリトライ可能である", () => {
      const info = getErrorDisplayInfo({ category: "unknown", message: "不明" });
      expect(info.canRetry).toBe(true);
    });
  });

  describe("Error型から AppError型への変換", () => {
    it("AppError が渡された場合は同じオブジェクトを返す", () => {
      const original: AppError = {
        category: "api",
        message: "すでに変換済み",
      };

      const converted = toAppError(original);

      expect(converted).toBe(original);
      expect(isAppError(converted)).toBe(true);
    });

    it("通常の Error を AppError に変換する", () => {
      const error = new Error("Something wrong");
      const converted = toAppError(error);

      expect(isAppError(converted)).toBe(true);
      expect(converted.originalError).toBe(error);
      expect(converted.category).toBe("api");
    });
  });

  describe("シナリオ別の分類結果", () => {
    it("通信障害シナリオで network として扱う", () => {
      const converted = toAppError(new Error("Network request failed"));
      expect(converted.category).toBe("network");
    });

    it("認証失敗シナリオで auth として扱う", () => {
      const converted = toAppError(new Error("forbidden"));
      expect(converted.category).toBe("auth");
      expect(converted.statusCode).toBe(401);
    });

    it("AI処理失敗シナリオで ai として扱う", () => {
      const converted = toAppError(new Error("分析処理に失敗しました"));
      expect(converted.category).toBe("ai");
    });
  });
});
