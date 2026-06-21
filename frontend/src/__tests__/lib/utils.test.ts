import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("truthyなclass名だけを半角スペースで連結する", () => {
    expect(cn("px-4", false, "py-2", null, undefined, "rounded")).toBe(
      "px-4 py-2 rounded",
    );
  });

  it("有効なclass名がない場合は空文字を返す", () => {
    expect(cn("", false, null, undefined)).toBe("");
  });
});
