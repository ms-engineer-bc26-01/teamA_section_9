import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ItemRegisterModal } from "@/features/items/components/ItemRegisterModal";
import { ItemSearchForm } from "@/features/items/components/ItemSearchForm";
import { ItemSearchResultList } from "@/features/items/components/ItemSearchResultList";
import type { Item } from "@/types/models";

const searchItemsMock = vi.fn();
const createUserItemMock = vi.fn();

vi.mock("@/api/items", () => ({
  searchItems: (...args: unknown[]) => searchItemsMock(...args),
}));

vi.mock("@/api/userItems", () => ({
  createUserItem: (...args: unknown[]) => createUserItemMock(...args),
}));

const item: Item = {
  id: "item-1",
  brand: "SkinMate",
  name: "モイストローション",
  createdAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
  category: {
    id: "category-1",
    name: "化粧水",
  },
  ingredients: [{ id: "ingredient-1", name: "セラミド" }],
};

describe("Item components", () => {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    searchItemsMock.mockResolvedValue({ items: [item] });
    createUserItemMock.mockResolvedValue(undefined);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("ItemRegisterModal は検索して選択したアイテムを登録できる", async () => {
    const onCloseMock = vi.fn();
    const onRegisteredMock = vi.fn().mockResolvedValue(undefined);

    render(
      <ItemRegisterModal
        isOpen
        onClose={onCloseMock}
        onRegistered={onRegisteredMock}
      />,
    );

    fireEvent.change(screen.getByLabelText("アイテム検索"), {
      target: { value: "ローション" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索する" }));

    await waitFor(() => {
      expect(searchItemsMock).toHaveBeenCalledWith({
        q: "ローション",
        limit: 20,
        offset: 0,
      });
    });

    fireEvent.click(screen.getByRole("button", { name: /モイストローション/ }));
    fireEvent.click(screen.getByRole("button", { name: "登録する" }));

    await waitFor(() => {
      expect(createUserItemMock).toHaveBeenCalledWith("item-1");
      expect(onRegisteredMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });

    expect(screen.getByText("アイテムを登録しました")).toBeInTheDocument();
  });

  it("ItemSearchForm はキーワードを送信し、検索中は無効化する", () => {
    const onSearchMock = vi.fn();

    render(
      <ItemSearchForm
        initialKeyword="美容液"
        isSearching={false}
        onSearch={onSearchMock}
      />,
    );

    fireEvent.change(screen.getByLabelText("アイテム検索"), {
      target: { value: "日焼け止め" },
    });
    fireEvent.click(screen.getByRole("button", { name: "検索する" }));

    expect(onSearchMock).toHaveBeenCalledWith("日焼け止め");
  });

  it("ItemSearchForm は検索中ラベルを表示する", () => {
    render(
      <ItemSearchForm initialKeyword="" isSearching onSearch={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "検索中..." })).toBeDisabled();
  });

  it("ItemSearchResultList は未検索時は何も表示しない", () => {
    const { container } = render(
      <ItemSearchResultList
        items={[]}
        hasSearched={false}
        onSelect={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("ItemSearchResultList は空結果メッセージを表示する", () => {
    render(
      <ItemSearchResultList items={[]} hasSearched onSelect={vi.fn()} />,
    );

    expect(screen.getByText("検索結果がありません")).toBeInTheDocument();
  });

  it("ItemSearchResultList は選択状態を表示して onSelect を呼ぶ", () => {
    const onSelectMock = vi.fn();

    render(
      <ItemSearchResultList
        items={[item]}
        selectedItemId="item-1"
        hasSearched
        onSelect={onSelectMock}
      />,
    );

    expect(screen.getByText("選択中")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /モイストローション/ }));

    expect(onSelectMock).toHaveBeenCalledWith(item);
  });
});
