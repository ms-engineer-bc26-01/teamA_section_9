import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockUserItems } from "@/mocks/mockUserItems";
import type { Item, UserItem } from "@/types/models";

type ApiUserItemItem = {
  id: string;
  brand: string | null;
  name: string;
  category_id: string;
  category_name: string | null;
  created_at: string;
  updated_at: string;
};

type ApiUserItem = {
  id: string;
  item: ApiUserItemItem;
};

type GetUserItemsResponse = {
  user_items: ApiUserItem[];
};

type CreateUserItemResponse = {
  id: string;
  item_id: string;
};

const toItem = (apiItem: ApiUserItemItem): Item => {
  return {
    id: apiItem.id,
    brand: apiItem.brand ?? "",
    name: apiItem.name,
    category: {
      id: apiItem.category_id,
      name: apiItem.category_name ?? "未分類",
    },
    ingredients: [],
    createdAt: apiItem.created_at,
    updatedAt: apiItem.updated_at,
  };
};

const toUserItem = (apiUserItem: ApiUserItem): UserItem => {
  return {
    id: apiUserItem.id,
    userId: "",
    item: toItem(apiUserItem.item),
    createdAt: "",
    updatedAt: "",
  };
};

export const getMyUserItems = async (): Promise<UserItem[]> => {
  if (USE_MOCK_API) {
    return mockUserItems;
  }

  const response = await apiClient.get<GetUserItemsResponse>("/api/user_items");

  return response.user_items.map(toUserItem);
};

export const createUserItem = async (
  itemId: string,
): Promise<CreateUserItemResponse> => {
  if (USE_MOCK_API) {
    return {
      id: `mock-user-item-${itemId}`,
      item_id: itemId,
    };
  }

  return apiClient.post<CreateUserItemResponse>("/api/user_items", {
    item_id: itemId,
  });
};

export const deleteUserItem = async (userItemId: string): Promise<void> => {
  if (USE_MOCK_API) {
    return;
  }

  await apiClient.delete(`/api/user_items/${userItemId}`);
};
