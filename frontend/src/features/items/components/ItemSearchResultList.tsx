"use client";

import { EmptyState } from "@/components/common/EmptyState";
import type { Item } from "@/types/models";
import { cn } from "@/lib/utils";

type ItemSearchResultListProps = {
  items: Item[];
  selectedItemId?: string;
  hasSearched: boolean;
  onSelect: (item: Item) => void;
};

export const ItemSearchResultList = ({
  items,
  selectedItemId,
  hasSearched,
  onSelect,
}: ItemSearchResultListProps) => {
  if (!hasSearched) {
    return null;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="検索結果がありません"
        description="キーワードを変更して再検索してください。"
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-500">検索結果</p>

      <ul className="max-h-56 space-y-2 overflow-y-auto pr-1">
        {items.map((item) => {
          const isSelected = selectedItemId === item.id;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className={cn(
                  "w-full rounded-xl border px-3 py-3 text-left transition",
                  isSelected
                    ? "border-rose-300 bg-rose-50"
                    : "border-gray-100 bg-gray-50 hover:bg-gray-100",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-500">
                      {item.brand || "ブランド未設定"}
                    </p>

                    <p className="mt-0.5 text-sm font-bold text-gray-800">
                      {item.name}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-500">
                      {item.category?.name || "カテゴリ未設定"}
                    </p>
                  </div>

                  {isSelected && (
                    <span className="shrink-0 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      選択中
                    </span>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
