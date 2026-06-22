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

import { createUserItem, deleteUserItem, getMyUserItems } from "@/api/userItems";

describe("userItems API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("所持アイテム一覧取得で item 情報を整形できる", async () => {
    getMock.mockResolvedValue({
      user_items: [
        {
          id: "user-item-1",
          item: {
            id: "item-1",
            brand: null,
            name: "保湿化粧水",
            category_id: "cat-1",
            category_name: null,
            created_at: "2026-06-20T00:00:00.000Z",
            updated_at: "2026-06-20T01:00:00.000Z",
          },
        },
      ],
    });

    const result = await getMyUserItems();

    expect(getMock).toHaveBeenCalledWith("/api/user_items");
    expect(result).toEqual([
      {
        id: "user-item-1",
        userId: "",
        item: {
          id: "item-1",
          brand: "",
          name: "保湿化粧水",
          category: {
            id: "cat-1",
            name: "未分類",
          },
          ingredients: [],
          createdAt: "2026-06-20T00:00:00.000Z",
          updatedAt: "2026-06-20T01:00:00.000Z",
        },
        createdAt: "",
        updatedAt: "",
      },
    ]);
  });

  it("所持アイテム登録で item_id を POST できる", async () => {
    postMock.mockResolvedValue({
      id: "user-item-2",
      item_id: "item-2",
    });

    const result = await createUserItem("item-2");

    expect(postMock).toHaveBeenCalledWith("/api/user_items", {
      item_id: "item-2",
    });
    expect(result).toEqual({
      id: "user-item-2",
      item_id: "item-2",
    });
  });

  it("所持アイテム削除で対象 ID の DELETE を呼び出す", async () => {
    deleteMock.mockResolvedValue(undefined);

    await expect(deleteUserItem("user-item-3")).resolves.toBeUndefined();

    expect(deleteMock).toHaveBeenCalledWith("/api/user_items/user-item-3");
  });
});
