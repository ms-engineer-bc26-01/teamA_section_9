import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

type MockUser = {
  getIdToken: () => Promise<string>;
};

const createMockResponse = (response: {
  ok: boolean;
  status: number;
  json: ReturnType<typeof vi.fn>;
}) => response as unknown as Response;

const importApiClient = async () => {
  const { apiClient } = await import("@/lib/apiClient");
  return apiClient;
};

const importAuthMocks = async () => {
  const { auth } = await import("@/lib/firebase");
  const { onAuthStateChanged } = await import("firebase/auth");

  return {
    auth: auth as { currentUser: MockUser | null },
    onAuthStateChanged: vi.mocked(onAuthStateChanged),
  };
};

const mockAuthStateChange = async (user: MockUser | null) => {
  const { onAuthStateChanged } = await importAuthMocks();
  onAuthStateChanged.mockImplementation((_auth, callback) => {
    queueMicrotask(() => {
      if (typeof callback === "function") {
        callback(user as never);
      }
    });
    return vi.fn();
  });
};

describe("apiClient", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.com/";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("GETリクエスト時に認証ヘッダー付きでAPIへアクセスできる", async () => {
    const apiClient = await importApiClient();
    const { auth } = await importAuthMocks();
    const user = {
      getIdToken: vi.fn().mockResolvedValue("token-123"),
    };
    auth.currentUser = user;
    vi.mocked(fetch).mockResolvedValue(createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ result: "ok" }),
    }));

    const result = await apiClient.get<{ result: string }>("/users", {
      headers: { "X-Trace-Id": "trace-1" },
    });

    expect(result).toEqual({ result: "ok" });
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: expect.stringMatching(new RegExp("^Bearer ")),
        "X-Trace-Id": "trace-1",
      },
    });
    expect(user.getIdToken).toHaveBeenCalledTimes(1);
  });

  it("currentUserがいない場合は認証状態の確定を待ってトークンを付与する", async () => {
    const apiClient = await importApiClient();
    const { auth, onAuthStateChanged } = await importAuthMocks();
    const user = {
      getIdToken: vi.fn().mockResolvedValue("delayed-token"),
    };
    auth.currentUser = null;
    onAuthStateChanged.mockImplementation((_auth, callback) => {
      queueMicrotask(() => {
        if (typeof callback === "function") {
          callback(user as never);
        }
      });
      return vi.fn();
    });
    vi.mocked(fetch).mockResolvedValue(createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: 1 }),
    }));

    await apiClient.get<{ id: number }>("profile");

    expect(onAuthStateChanged).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/profile", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: expect.stringMatching(new RegExp("^Bearer ")),
      },
    });
  });

  it("POSTリクエスト時にボディをJSON文字列化して送信できる", async () => {
    const apiClient = await importApiClient();
    const { auth } = await importAuthMocks();
    auth.currentUser = null;
    await mockAuthStateChange(null);
    vi.mocked(fetch).mockResolvedValue(createMockResponse({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ created: true }),
    }));

    const result = await apiClient.post<{ created: boolean }, { name: string }>(
      "/items",
      { name: "化粧水" },
      { headers: { "X-Test": "yes" } },
    );

    expect(result).toEqual({ created: true });
    expect(fetch).toHaveBeenCalledWith("https://api.example.com/items", {
      method: "POST",
      body: JSON.stringify({ name: "化粧水" }),
      headers: {
        "Content-Type": "application/json",
        "X-Test": "yes",
      },
    });
  });

  it("204レスポンスではundefinedを返す", async () => {
    const apiClient = await importApiClient();
    const { auth } = await importAuthMocks();
    auth.currentUser = null;
    await mockAuthStateChange(null);
    const json = vi.fn();
    vi.mocked(fetch).mockResolvedValue(createMockResponse({
      ok: true,
      status: 204,
      json,
    }));

    const result = await apiClient.delete("/items/1");

    expect(result).toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("エラーレスポンスのmessageを優先して例外にする", async () => {
    const apiClient = await importApiClient();
    const { auth } = await importAuthMocks();
    auth.currentUser = null;
    await mockAuthStateChange(null);
    vi.mocked(fetch).mockResolvedValue(createMockResponse({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ message: "入力内容が不正です" }),
    }));

    await expect(apiClient.get("/items")).rejects.toThrow(
      "データの取得または保存に失敗しました。時間をおいて再度お試しください。",
    );
  });

  it("エラー本文がJSONでない場合はステータスコードベースの文言を返す", async () => {
    const apiClient = await importApiClient();
    const { auth } = await importAuthMocks();
    auth.currentUser = null;
    await mockAuthStateChange(null);
    vi.mocked(fetch).mockResolvedValue(createMockResponse({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new Error("invalid json")),
    }));

    await expect(apiClient.get("/items")).rejects.toThrow(
      "データの取得または保存に失敗しました。時間をおいて再度お試しください。",
    );
  });

  it("APIのベースURLが未設定なら例外にする", async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    const apiClient = await importApiClient();
    const { auth } = await importAuthMocks();
    auth.currentUser = null;
    await mockAuthStateChange(null);

    await expect(apiClient.get("/items")).rejects.toThrow(
      "ネットワークに接続できませんでした。通信環境を確認して再度お試しください。",
    );
  });
});
