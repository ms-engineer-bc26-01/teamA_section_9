const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

import { getHealth } from "@/api/health";

describe("health API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("ヘルスチェック取得で test エンドポイントを呼び出せる", async () => {
    getMock.mockResolvedValue({
      status: "success",
      message: "ok",
    });

    const result = await getHealth();

    expect(getMock).toHaveBeenCalledWith("/api/test");
    expect(result).toEqual({
      status: "success",
      message: "ok",
    });
  });
});
