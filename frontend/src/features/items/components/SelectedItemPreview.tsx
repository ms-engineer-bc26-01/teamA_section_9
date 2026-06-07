import type { Item } from "@/types/models";

type SelectedItemPreviewProps = {
  item: Item | null;
};

export const SelectedItemPreview = ({ item }: SelectedItemPreviewProps) => {
  if (!item) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4">
        <p className="text-xs font-medium text-gray-400">
          登録するアイテムを選択してください。
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-4">
      <p className="text-[11px] font-bold text-rose-500">選択中のアイテム</p>

      <p className="mt-2 text-xs font-bold text-gray-500">{item.brand}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-800">{item.name}</p>

      <p className="mt-2 text-[11px] text-gray-500">
        カテゴリ：{item.category.name}
      </p>

      {item.ingredients.length > 0 && (
        <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
          成分：
          {item.ingredients.map((ingredient) => ingredient.name).join("、")}
        </p>
      )}
    </div>
  );
};
