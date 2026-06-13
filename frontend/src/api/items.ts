import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockItems } from "@/mocks/mockItems";
import type { Item } from "@/types/models";

export type SearchItemsParams = {
  q?: string;
  limit?: number;
  offset?: number;
};

export type SearchItemsResult = {
  items: Item[];
  total: number;
};

type ApiItem = {
  id: string;
  brand: string | null;
  name: string;
  category?: {
    id: string;
    name: string;
  } | null;
  category_id?: string | null;
  category_name?: string | null;
};

type SearchItemsResponse = {
  items: ApiItem[];
  total: number;
};

const toItem = (item: ApiItem): Item => {
  return {
    id: item.id,
    brand: item.brand ?? "",
    name: item.name,
    category: {
      id: item.category?.id ?? item.category_id ?? "",
      name: item.category?.name ?? item.category_name ?? "",
    },
  } as Item;
};

export const searchItems = async (
  params: SearchItemsParams = {},
): Promise<SearchItemsResult> => {
  const q = params.q?.trim() ?? "";
  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;

  if (USE_MOCK_API) {
    const filteredItems = q
      ? mockItems.filter((item) => {
          const searchText = `${item.brand} ${item.name} ${item.category.name}`;
          return searchText.toLowerCase().includes(q.toLowerCase());
        })
      : mockItems;

    return {
      items: filteredItems.slice(offset, offset + limit),
      total: filteredItems.length,
    };
  }

  const searchParams = new URLSearchParams();

  if (q) {
    searchParams.set("q", q);
  }

  searchParams.set("limit", String(limit));
  searchParams.set("offset", String(offset));

  const response = await apiClient.get<SearchItemsResponse>(
    `/api/items?${searchParams.toString()}`,
  );

  return {
    items: response.items.map(toItem),
    total: response.total,
  };
};
