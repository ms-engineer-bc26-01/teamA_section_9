import type { AnchorHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LogoutButton } from "@/features/my-page/components/LogoutButton";
import { MyPageHeader } from "@/features/my-page/components/MyPageHeader";
import { MyPageHeaderActions } from "@/features/my-page/components/MyPageHeaderActions";
import { ProfileCard } from "@/features/my-page/components/ProfileCard";
import { ProfileEditModal } from "@/features/my-page/components/ProfileEditModal";
import { UserItemList } from "@/features/my-page/components/UserItemList";
import type { Profile, UserItem } from "@/types/models";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: ReactNode } &
    AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const profile: Profile = {
  id: "profile-1",
  name: "山田 花子",
  birthDay: "1994-05-18",
  skinType: "dry",
  createdAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
};

const createUserItem = (
  id: string,
  name: string,
  categoryName: string,
  ingredientName = "セラミド",
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
    ingredients: ingredientName ? [{ id: `${id}-ing`, name: ingredientName }] : [],
  },
});

describe("My-page components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ProfileCard は整形済みプロフィール情報を表示して編集操作を呼ぶ", () => {
    const onClickEditMock = vi.fn();

    render(<ProfileCard profile={profile} onClickEdit={onClickEditMock} />);

    expect(screen.getByText("山田 花子")).toBeInTheDocument();
    expect(screen.getByText("乾燥肌")).toBeInTheDocument();
    expect(screen.getByText("1994年5月18日")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "プロフィールを編集" }));

    expect(onClickEditMock).toHaveBeenCalled();
  });

  it("UserItemList は空状態の登録導線を表示する", () => {
    const onClickRegisterMock = vi.fn();

    render(
      <UserItemList
        userItems={[]}
        onDelete={vi.fn()}
        onClickRegister={onClickRegisterMock}
      />,
    );

    expect(screen.getByText("まだ登録済みアイテムがありません")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "アイテム登録" }));

    expect(onClickRegisterMock).toHaveBeenCalled();
  });

  it("UserItemList はカテゴリ絞り込み後に削除確認を完了できる", async () => {
    const onDeleteMock = vi.fn().mockResolvedValue(undefined);
    const lotion = createUserItem("item-1", "モイストローション", "化粧水");
    const serum = createUserItem("item-2", "リペアセラム", "美容液", "");

    render(
      <UserItemList
        userItems={[lotion, serum]}
        onDelete={onDeleteMock}
        onClickRegister={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "美容液" }));

    expect(screen.queryByText("モイストローション")).not.toBeInTheDocument();
    expect(screen.getByText("リペアセラム")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "リペアセラムを削除" }));
    fireEvent.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(onDeleteMock).toHaveBeenCalledWith(serum);
    });
  });

  it("ProfileEditModal は編集内容を保存して閉じる", () => {
    const onSaveMock = vi.fn();
    const onCloseMock = vi.fn();

    render(
      <ProfileEditModal
        isOpen
        profile={profile}
        onClose={onCloseMock}
        onSave={onSaveMock}
      />,
    );

    fireEvent.change(screen.getByLabelText("お名前"), {
      target: { value: "佐藤 葵" },
    });
    fireEvent.change(screen.getByLabelText("生年月日"), {
      target: { value: "1998-12-24" },
    });
    fireEvent.click(screen.getByRole("button", { name: "敏感肌" }));
    fireEvent.click(screen.getByRole("button", { name: "設定を保存する" }));

    expect(onSaveMock).toHaveBeenCalledWith({
      ...profile,
      name: "佐藤 葵",
      birthDay: "1998-12-24",
      skinType: "sensitive",
    });
    expect(onCloseMock).toHaveBeenCalled();
  });

  it("MyPageHeader は見出しを表示する", () => {
    render(<MyPageHeader />);

    expect(screen.getByText("My Page")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "マイページ" })).toBeInTheDocument();
  });

  it("MyPageHeaderActions は追加導線と記録リンクを表示する", () => {
    const onClickAddItemMock = vi.fn();

    render(<MyPageHeaderActions onClickAddItem={onClickAddItemMock} />);

    fireEvent.click(screen.getByRole("button", { name: "＋ アイテム登録" }));

    expect(onClickAddItemMock).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "今日を記録" })).toHaveAttribute(
      "href",
      "/record",
    );
  });

  it("LogoutButton はログアウト操作を呼び出す", () => {
    const onClickMock = vi.fn();

    render(<LogoutButton onClick={onClickMock} />);

    fireEvent.click(screen.getByRole("button", { name: "ログアウト" }));

    expect(onClickMock).toHaveBeenCalled();
  });
});
