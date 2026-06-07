"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { getUserItemCategories } from "@/features/my-page/utils";
import { cn } from "@/lib/utils";
import type { UserItem } from "@/types/models";

type UserItemListProps = {
  userItems: UserItem[];
};

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

export const UserItemList = ({ userItems }: UserItemListProps) => {
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  const categories = useMemo(() => {
    return getUserItemCategories(userItems);
  }, [userItems]);

  const filteredUserItems = useMemo(() => {
    if (selectedCategory === "すべて") {
      return userItems;
    }

    return userItems.filter(
      (userItem) => userItem.item.category.name === selectedCategory,
    );
  }, [selectedCategory, userItems]);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-gray-800">所有アイテム</h2>
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
          title="手持ちアイテムがありません"
          description="アイテム登録から、普段使っているコスメを追加してください。"
        />
      ) : filteredUserItems.length === 0 ? (
        <EmptyState
          title="該当するアイテムがありません"
          description="別のカテゴリを選択してください。"
        />
      ) : (
        <ul className="space-y-2.5">
          {filteredUserItems.map((userItem) => (
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
                    {userItem.item.category.name}
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
                  className="shrink-0 px-1 text-base font-bold text-gray-400"
                  aria-label="アイテムメニュー"
                >
                  ⋮
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
