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

import { getMyProfile, updateMyProfile } from "@/api/profiles";

describe("profiles API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("プロフィール取得で null 値を既定値に補完して返せる", async () => {
    getMock.mockResolvedValue({
      id: "user-1",
      name: null,
      birth_day: null,
      skin_type: null,
      created_at: "2026-06-20T00:00:00.000Z",
      updated_at: "2026-06-20T01:00:00.000Z",
    });

    const result = await getMyProfile();

    expect(getMock).toHaveBeenCalledWith("/api/users/me");
    expect(result).toEqual({
      id: "user-1",
      name: "ゲストユーザー",
      birthDay: "2000-01-01",
      skinType: "normal",
      createdAt: "2026-06-20T00:00:00.000Z",
      updatedAt: "2026-06-20T01:00:00.000Z",
    });
  });

  it("プロフィール更新で snake_case に変換して整形済みプロフィールを返せる", async () => {
    patchMock.mockResolvedValue({
      id: "user-2",
      name: "花子",
      birth_day: "1995-02-03",
      skin_type: "dry",
      created_at: "2026-06-18T00:00:00.000Z",
      updated_at: "2026-06-21T00:00:00.000Z",
    });

    const result = await updateMyProfile({
      name: "花子",
      birthDay: "1995-02-03",
      skinType: "dry",
    });

    expect(patchMock).toHaveBeenCalledWith("/api/users/me", {
      name: "花子",
      birth_day: "1995-02-03",
      skin_type: "dry",
    });
    expect(result).toEqual({
      id: "user-2",
      name: "花子",
      birthDay: "1995-02-03",
      skinType: "dry",
      createdAt: "2026-06-18T00:00:00.000Z",
      updatedAt: "2026-06-21T00:00:00.000Z",
    });
  });
});
