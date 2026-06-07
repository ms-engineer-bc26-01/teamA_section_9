"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { BaseModal } from "@/components/modal/BaseModal";
import type { UsedItemSelectorGroup } from "@/features/daily-log/types";
import { cn } from "@/lib/utils";

const timeOfDayConfig = {
  morning: {
    icon: "☀",
    title: "朝のケアを登録",
    modalTitle: "朝に使ったアイテム",
    borderClassName: "border-orange-100",
    selectedBorderClassName: "border-orange-200",
    iconClassName: "text-orange-400",
  },
  night: {
    icon: "☾",
    title: "夜のケアを登録",
    modalTitle: "夜に使ったアイテム",
    borderClassName: "border-indigo-100",
    selectedBorderClassName: "border-indigo-200",
    iconClassName: "text-indigo-400",
  },
} as const;

const categoryOrder = [
  "すべて",
  "洗顔料",
  "化粧水",
  "美容液",
  "クリーム",
  "日焼け止め",
];

export const UsedItemSelector = ({
  timeOfDay,
  selectedItemIds,
  userItems,
  onChange,
}: UsedItemSelectorGroup) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftSelectedItemIds, setDraftSelectedItemIds] = useState<string[]>(
    [],
  );
  const [selectedCategory, setSelectedCategory] = useState("すべて");

  const config = timeOfDayConfig[timeOfDay];

  const selectedItems = userItems.filter((userItem) =>
    selectedItemIds.includes(userItem.item.id),
  );

  const categories = useMemo(() => {
    const categoryNames = Array.from(
      new Set(userItems.map((userItem) => userItem.item.category.name)),
    );

    return categoryOrder.filter(
      (category) => category === "すべて" || categoryNames.includes(category),
    );
  }, [userItems]);

  const filteredUserItems = useMemo(() => {
    if (selectedCategory === "すべて") {
      return userItems;
    }

    return userItems.filter(
      (userItem) => userItem.item.category.name === selectedCategory,
    );
  }, [selectedCategory, userItems]);

  const handleOpenModal = () => {
    setDraftSelectedItemIds(selectedItemIds);
    setSelectedCategory("すべて");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setDraftSelectedItemIds(selectedItemIds);
    setIsModalOpen(false);
  };

  const handleToggle = (itemId: string) => {
    if (draftSelectedItemIds.includes(itemId)) {
      setDraftSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
      return;
    }

    setDraftSelectedItemIds((prev) => [...prev, itemId]);
  };

  const handleClear = () => {
    setDraftSelectedItemIds([]);
  };

  const handleConfirm = () => {
    onChange(draftSelectedItemIds);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenModal}
        className={cn(
          "w-full rounded-2xl border bg-white p-4 text-center shadow-sm transition hover:bg-gray-50",
          selectedItems.length > 0
            ? config.selectedBorderClassName
            : config.borderClassName,
        )}
      >
        <div className={cn("mb-2 text-xl", config.iconClassName)}>
          {config.icon}
        </div>

        <h3 className="text-xs font-bold text-gray-700">{config.title}</h3>

        <div className="mt-3 rounded-xl bg-gray-50 px-3 py-3">
          {selectedItems.length > 0 ? (
            <ul className="space-y-1 text-left">
              {selectedItems.map((userItem) => (
                <li
                  key={userItem.id}
                  className="text-[11px] font-medium leading-relaxed text-gray-600"
                >
                  <span className="mr-1.5 text-rose-400">✓</span>
                  {userItem.item.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] font-medium text-gray-400">未登録</p>
          )}
        </div>
      </button>

      <BaseModal
        isOpen={isModalOpen}
        title={config.modalTitle}
        onClose={handleCloseModal}
      >
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-gray-500">
            手持ちアイテムの中から、{timeOfDay === "morning" ? "朝" : "夜"}
            に使ったアイテムを選択してください。
          </p>

          <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition",
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
              description="先にアイテム登録を行ってください。"
            />
          ) : filteredUserItems.length === 0 ? (
            <EmptyState
              title="該当するアイテムがありません"
              description="別のカテゴリを選択してください。"
            />
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {filteredUserItems.map((userItem) => {
                const item = userItem.item;
                const isSelected = draftSelectedItemIds.includes(item.id);

                return (
                  <li key={userItem.id}>
                    <button
                      type="button"
                      onClick={() => handleToggle(item.id)}
                      className={cn(
                        "w-full rounded-xl border px-3 py-3 text-left transition",
                        isSelected
                          ? "border-rose-300 bg-rose-50"
                          : "border-gray-100 bg-gray-50 hover:bg-gray-100",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold text-gray-500">
                            {item.brand}
                          </p>
                          <p className="mt-0.5 text-[11px] font-bold text-gray-800">
                            {item.name}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-500">
                            {item.category.name}
                          </p>
                        </div>

                        {isSelected && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            選択中
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClear}
              disabled={draftSelectedItemIds.length === 0}
            >
              クリア
            </Button>

            <Button type="button" onClick={handleConfirm}>
              決定
            </Button>
          </div>
        </div>
      </BaseModal>
    </>
  );
};
