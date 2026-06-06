import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockItems } from "@/mocks/mockItems";
import type { Item } from "@/types/models";

export const searchItems = async (keyword: string): Promise<Item[]> => {
  if (USE_MOCK_API) {
    if (!keyword.trim()) {
      return mockItems;
    }

    return mockItems.filter((item) => {
      const searchText = `${item.brand} ${item.name} ${item.category.name}`;
      return searchText.toLowerCase().includes(keyword.toLowerCase());
    });
  }

  const query = new URLSearchParams({ keyword });

  return apiClient.get<Item[]>(`/api/items?${query.toString()}`);
};
