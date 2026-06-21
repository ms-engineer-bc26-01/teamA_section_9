import { describe, expect, it } from "vitest";
import { getPreviousDate } from "@/utils/date";

describe("getPreviousDate", () => {
  it("同じ月内では前日の日付を返す", () => {
    expect(getPreviousDate("2026-06-20")).toBe("2026-06-19");
  });

  it("月またぎでも正しく前日を返す", () => {
    expect(getPreviousDate("2026-03-01")).toBe("2026-02-28");
  });

  it("うるう年の境界でも正しく前日を返す", () => {
    expect(getPreviousDate("2024-03-01")).toBe("2024-02-29");
  });
});
