"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import type { UserItem } from "@/types/models";

type UserItemListProps = {
  userItems: UserItem[];
  onDelete?: (userItem: UserItem) => void | Promise<void>;
  onClickRegister?: () => void;
};

const ALL_CATEGORY = "すべて";

const getCategoryIcon = (categoryName: string) => {
  const iconMap: Record<string, string> = {
    洗顔料: "🫧",
    化粧水: "💧",
    美容液: "🧴",
    クリーム: "🍯",
    日焼け止め: "✨",
  };

  return iconMap[categoryName] ?? "🧴";
};

export const UserItemList = ({
  userItems,
  onDelete,
  onClickRegister,
}: UserItemListProps) => {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);
  const [deletingUserItemId, setDeletingUserItemId] = useState<string | null>(
    null,
  );
  const [deleteTargetItem, setDeleteTargetItem] = useState<UserItem | null>(
    null,
  );

  const categories = useMemo(() => {
    const categoryNames = userItems
      .map((userItem) => userItem.item.category.name)
      .filter((categoryName): categoryName is string => Boolean(categoryName));

    return [ALL_CATEGORY, ...Array.from(new Set(categoryNames))];
  }, [userItems]);

  const filteredUserItems = useMemo(() => {
    if (selectedCategory === ALL_CATEGORY) {
      return userItems;
    }

    return userItems.filter(
      (userItem) => userItem.item.category.name === selectedCategory,
    );
  }, [selectedCategory, userItems]);

  const handleOpenDeleteConfirm = (userItem: UserItem) => {
    setDeleteTargetItem(userItem);
  };

  const handleCloseDeleteConfirm = () => {
    if (deletingUserItemId) return;

    setDeleteTargetItem(null);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete || !deleteTargetItem || deletingUserItemId) return;

    try {
      setDeletingUserItemId(deleteTargetItem.id);
      await onDelete(deleteTargetItem);
      setDeleteTargetItem(null);
    } finally {
      setDeletingUserItemId(null);
    }
  };

  return (
    <>
      <section className="space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-800">所有アイテム</h2>

            {onClickRegister && (
              <button
                type="button"
                onClick={onClickRegister}
                // text-sm, font-bold, leading-none を削除しています
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-400 text-white shadow-sm transition hover:bg-rose-500"
                aria-label="アイテムを登録"
              >
                {/* テキストの + の代わりにSVGを使用 */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>

          <p className="mt-0.5 text-[11px] text-gray-500">
            現在登録数：{userItems.length}
          </p>
        </div>

        <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-2 text-[11px] font-bold shadow-sm transition",
                  isSelected
                    ? "border-gray-800 bg-gray-800 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
                )}
              >
                {category}
              </button>
            );
          })}
        </div>

        {userItems.length === 0 ? (
          <EmptyState
            icon="🧴"
            title="まだ登録済みアイテムがありません"
            description="普段使っているスキンケアアイテムを登録すると、肌記録で使用アイテムとして選択できます。"
            actionLabel="アイテム登録"
            onAction={onClickRegister}
          />
        ) : filteredUserItems.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="該当するアイテムがありません"
            description="別のカテゴリを選択してください。"
          />
        ) : (
          <ul className="space-y-2.5">
            {filteredUserItems.map((userItem) => {
              const isDeleting = deletingUserItemId === userItem.id;

              return (
                <li
                  key={userItem.id}
                  className="rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-100 bg-gray-50 text-xl">
                      {getCategoryIcon(userItem.item.category.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-gray-500">
                        {userItem.item.brand || "ブランド未設定"}
                      </p>

                      <p className="mt-0.5 truncate text-xs font-bold text-gray-800">
                        {userItem.item.name}
                      </p>

                      {userItem.item.ingredients.length > 0 && (
                        <span className="mt-1.5 inline-flex rounded-md border border-purple-100 bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-500">
                          {userItem.item.ingredients[0].name}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteConfirm(userItem)}
                      disabled={isDeleting}
                      className="shrink-0 rounded-full px-2 py-1 text-[11px] font-bold text-gray-400 transition hover:bg-gray-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`${userItem.item.name}を削除`}
                    >
                      {isDeleting ? "削除中" : "削除"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {deleteTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-3xl bg-white px-5 py-5 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-xl">
                🗑️
              </div>

              <h3 className="mt-3 text-base font-bold text-gray-800">
                アイテムを削除しますか？
              </h3>

              <p className="mt-2 text-xs leading-relaxed text-gray-500">
                {deleteTargetItem.item.name}
                を所有アイテムから削除します。
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleCloseDeleteConfirm}
                disabled={Boolean(deletingUserItemId)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-xs font-bold text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                キャンセル
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(deletingUserItemId)}
                className="rounded-2xl bg-rose-500 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingUserItemId ? "削除中..." : "削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
