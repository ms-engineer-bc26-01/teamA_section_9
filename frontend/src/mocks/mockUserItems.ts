import type { UserItem } from "@/types/models";
import { mockItems } from "@/mocks/mockItems";

export const mockUserItems: UserItem[] = [
  {
    id: "user-item-001",
    userId: "firebase_uid_mock_001",
    item: mockItems[0],
    createdAt: "2026-05-23T00:00:00+09:00",
    updatedAt: "2026-05-23T00:00:00+09:00",
  },
  {
    id: "user-item-002",
    userId: "firebase_uid_mock_001",
    item: mockItems[1],
    createdAt: "2026-05-23T00:00:00+09:00",
    updatedAt: "2026-05-23T00:00:00+09:00",
  },
  {
    id: "user-item-003",
    userId: "firebase_uid_mock_001",
    item: mockItems[2],
    createdAt: "2026-05-23T00:00:00+09:00",
    updatedAt: "2026-05-23T00:00:00+09:00",
  },
];
