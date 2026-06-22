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

import { searchItems } from "@/api/items";

describe("items API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("アイテム検索で既定の limit と offset を付けて取得できる", async () => {
    getMock.mockResolvedValue({
      items: [
        {
          id: "item-1",
          brand: null,
          name: "化粧水A",
          category: {
            id: "cat-1",
            name: "化粧水",
          },
        },
      ],
      total: 1,
    });

    const result = await searchItems();

    expect(getMock).toHaveBeenCalledWith("/api/items?limit=20&offset=0");
    expect(result).toEqual({
      items: [
        {
          id: "item-1",
          brand: "",
          name: "化粧水A",
          category: {
            id: "cat-1",
            name: "化粧水",
          },
        },
      ],
      total: 1,
    });
  });

  it("アイテム検索でトリム済みキーワードとカテゴリ代替値を扱える", async () => {
    getMock.mockResolvedValue({
      items: [
        {
          id: "item-2",
          brand: "Brand B",
          name: "美容液B",
          category_id: "cat-2",
          category_name: "美容液",
        },
      ],
      total: 12,
    });

    const result = await searchItems({
      q: "  serum  ",
      limit: 5,
      offset: 10,
    });

    expect(getMock).toHaveBeenCalledWith("/api/items?q=serum&limit=5&offset=10");
    expect(result).toEqual({
      items: [
        {
          id: "item-2",
          brand: "Brand B",
          name: "美容液B",
          category: {
            id: "cat-2",
            name: "美容液",
          },
        },
      ],
      total: 12,
    });
  });
});
