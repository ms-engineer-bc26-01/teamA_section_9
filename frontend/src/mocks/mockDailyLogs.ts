import type { DailyLog } from "@/types/models";
import { mockItems } from "@/mocks/mockItems";

export const mockDailyLogs: DailyLog[] = [
  {
    id: "daily-log-001",
    userId: "firebase_uid_mock_001",
    logDate: "2026-05-17",
    skinCondition: 2,
    weather: "rainy",
    sleepLevel: "short",
    mealBalance: "normal",
    freeNote: "少し乾燥ぎみ。フェイスラインに赤みあり。",
    isMenstruation: true,
    usedItems: [
      {
        id: "log-used-item-001",
        dailyLogId: "daily-log-001",
        timeOfDay: "morning",
        item: mockItems[0],
        stepOrder: 1,
      },
      {
        id: "log-used-item-002",
        dailyLogId: "daily-log-001",
        timeOfDay: "morning",
        item: mockItems[1],
        stepOrder: 2,
      },
      {
        id: "log-used-item-003",
        dailyLogId: "daily-log-001",
        timeOfDay: "night",
        item: mockItems[0],
        stepOrder: 1,
      },
      {
        id: "log-used-item-004",
        dailyLogId: "daily-log-001",
        timeOfDay: "night",
        item: mockItems[2],
        stepOrder: 2,
      },
    ],
    createdAt: "2026-05-17T21:00:00+09:00",
    updatedAt: "2026-05-17T21:00:00+09:00",
  },
  {
    id: "daily-log-002",
    userId: "firebase_uid_mock_001",
    logDate: "2026-05-18",
    skinCondition: 3,
    weather: "sunny",
    sleepLevel: "normal",
    mealBalance: "good",
    freeNote: "昨日より乾燥感が少なく、調子が良い。",
    isMenstruation: false,
    usedItems: [
      {
        id: "log-used-item-005",
        dailyLogId: "daily-log-002",
        timeOfDay: "morning",
        item: mockItems[0],
        stepOrder: 1,
      },
      {
        id: "log-used-item-006",
        dailyLogId: "daily-log-002",
        timeOfDay: "morning",
        item: mockItems[1],
        stepOrder: 2,
      },
    ],
    createdAt: "2026-05-18T21:00:00+09:00",
    updatedAt: "2026-05-18T21:00:00+09:00",
  },
];
