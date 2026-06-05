import type { Item } from "@/types/models";

export const mockItems: Item[] = [
  {
    id: "item-001",
    brand: "Curel",
    name: "潤浸保湿 泡洗顔料",
    category: {
      id: "category-001",
      name: "洗顔",
    },
    ingredients: [
      {
        id: "ingredient-001",
        name: "グリセリン",
      },
      {
        id: "ingredient-002",
        name: "セラミド機能成分",
      },
    ],
    createdAt: "2026-05-23T00:00:00+09:00",
    updatedAt: "2026-05-23T00:00:00+09:00",
  },
  {
    id: "item-002",
    brand: "SK-II",
    name: "フェイシャル トリートメント エッセンス",
    category: {
      id: "category-002",
      name: "化粧水",
    },
    ingredients: [
      {
        id: "ingredient-003",
        name: "ガラクトミセス培養液",
      },
    ],
    createdAt: "2026-05-23T00:00:00+09:00",
    updatedAt: "2026-05-23T00:00:00+09:00",
  },
  {
    id: "item-003",
    brand: "COSRX",
    name: "ザ・レチノール 0.3 クリーム",
    category: {
      id: "category-003",
      name: "クリーム",
    },
    ingredients: [
      {
        id: "ingredient-004",
        name: "レチノール",
      },
      {
        id: "ingredient-005",
        name: "パンテノール",
      },
    ],
    createdAt: "2026-05-23T00:00:00+09:00",
    updatedAt: "2026-05-23T00:00:00+09:00",
  },
];
