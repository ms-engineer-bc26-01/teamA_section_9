import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockDailyLogs } from "@/mocks/mockDailyLogs";
import type {
  DailyLog,
  MealBalance,
  SkinCondition,
  SleepLevel,
  Weather,
} from "@/types/models";

export type SaveDailyLogPayload = {
  logDate: string;
  skinCondition: SkinCondition;
  weather?: Weather;
  sleepLevel?: SleepLevel;
  mealBalance?: MealBalance;
  freeNote?: string;
  isMenstruation: boolean;
  morningItemIds: string[];
  nightItemIds: string[];
};

export const getDailyLogs = async (): Promise<DailyLog[]> => {
  if (USE_MOCK_API) {
    return mockDailyLogs;
  }

  return apiClient.get<DailyLog[]>("/api/daily_logs");
};

export const getDailyLogByDate = async (
  logDate: string,
): Promise<DailyLog | null> => {
  if (USE_MOCK_API) {
    return mockDailyLogs.find((log) => log.logDate === logDate) ?? null;
  }

  return apiClient.get<DailyLog>(`/api/daily_logs/${logDate}`);
};

export const saveDailyLog = async (
  payload: SaveDailyLogPayload,
): Promise<DailyLog> => {
  if (USE_MOCK_API) {
    const existingLog = mockDailyLogs.find(
      (log) => log.logDate === payload.logDate,
    );

    if (existingLog) {
      return {
        ...existingLog,
        skinCondition: payload.skinCondition,
        weather: payload.weather,
        sleepLevel: payload.sleepLevel,
        mealBalance: payload.mealBalance,
        freeNote: payload.freeNote,
        isMenstruation: payload.isMenstruation,
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      id: `daily-log-${payload.logDate}`,
      userId: "firebase_uid_mock_001",
      logDate: payload.logDate,
      skinCondition: payload.skinCondition,
      weather: payload.weather,
      sleepLevel: payload.sleepLevel,
      mealBalance: payload.mealBalance,
      freeNote: payload.freeNote,
      isMenstruation: payload.isMenstruation,
      usedItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return apiClient.post<DailyLog>("/api/daily_logs", payload);
};

export const deleteDailyLog = async (dailyLogId: string): Promise<void> => {
  if (USE_MOCK_API) {
    console.log(`mock delete daily log: ${dailyLogId}`);
    return;
  }

  return apiClient.delete<void>(`/api/daily_logs/${dailyLogId}`);
};
