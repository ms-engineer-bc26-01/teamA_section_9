import type { SkinType, UserItem } from "@/types/models";

export const getSkinTypeLabel = (skinType: SkinType) => {
  const labelMap: Record<SkinType, string> = {
    normal: "普通肌",
    dry: "乾燥肌",
    oily: "脂性肌",
    combination: "混合肌",
    sensitive: "敏感肌",
  };

  return labelMap[skinType];
};

export const formatBirthDay = (birthDay: string) => {
  const [year, month, day] = birthDay.split("-");

  return `${year}年${Number(month)}月${Number(day)}日`;
};

export const getUserItemCategories = (userItems: UserItem[]) => {
  const categoryNames = Array.from(
    new Set(userItems.map((userItem) => userItem.item.category.name)),
  );

  const categoryOrder = [
    "すべて",
    "洗顔料",
    "化粧水",
    "美容液",
    "クリーム",
    "日焼け止め",
  ];

  return categoryOrder.filter(
    (category) => category === "すべて" || categoryNames.includes(category),
  );
};
