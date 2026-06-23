import { fireEvent, render, screen } from "@testing-library/react";
import { UserItemList } from "@/features/my-page/components/UserItemList";
import type { UserItem } from "@/types/models";

const createUserItem = (
  id: string,
  name: string,
  categoryName: string,
): UserItem => ({
  id: `user-${id}`,
  userId: "user-1",
  createdAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
  item: {
    id,
    brand: "SkinMate",
    name,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
    category: {
      id: `category-${categoryName}`,
      name: categoryName,
    },
    ingredients: [{ id: `${id}-ingredient`, name: "セラミド" }],
  },
});

describe("UserItemList", () => {
  it("登録ボタン押下で onClickRegister を呼ぶ", () => {
    const onClickRegister = vi.fn();

    render(
      <UserItemList
        userItems={[createUserItem("item-1", "モイストローション", "化粧水")]}
        onClickRegister={onClickRegister}
      />,
    );

    fireEvent.click(screen.getByLabelText("アイテムを登録"));

    expect(onClickRegister).toHaveBeenCalledTimes(1);
  });

  it("onClickRegister がない場合は登録ボタンを表示しない", () => {
    render(
      <UserItemList
        userItems={[createUserItem("item-1", "モイストローション", "化粧水")]}
      />,
    );

    expect(screen.queryByLabelText("アイテムを登録")).toBeNull();
  });

  it("見出しと現在登録数を表示する", () => {
    render(
      <UserItemList
        userItems={[
          createUserItem("item-1", "モイストローション", "化粧水"),
          createUserItem("item-2", "リペアセラム", "美容液"),
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "所有アイテム" })).toBeInTheDocument();
    expect(screen.getByText("現在登録数：2")).toBeInTheDocument();
  });
});
