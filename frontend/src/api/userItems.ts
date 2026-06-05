import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockItems } from "@/mocks/mockItems";
import { mockUserItems } from "@/mocks/mockUserItems";
import type { UserItem } from "@/types/models";

export const getMyUserItems = async (): Promise<UserItem[]> => {
  if (USE_MOCK_API) {
    return mockUserItems;
  }

  return apiClient.get<UserItem[]>("/api/user_items");
};

export const createUserItem = async (itemId: string): Promise<UserItem> => {
  if (USE_MOCK_API) {
    const item = mockItems.find((mockItem) => mockItem.id === itemId);

    if (!item) {
      throw new Error("対象のアイテムが見つかりません。");
    }

    return {
      id: `user-item-${itemId}`,
      userId: "firebase_uid_mock_001",
      item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return apiClient.post<UserItem>("/api/user_items", { itemId });
};

export const deleteUserItem = async (userItemId: string): Promise<void> => {
  if (USE_MOCK_API) {
    console.log(`mock delete user item: ${userItemId}`);
    return;
  }

  return apiClient.delete<void>(`/api/user_items/${userItemId}`);
};
