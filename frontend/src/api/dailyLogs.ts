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

export type GetDailyLogsParams = {
  startDate: string;
  endDate: string;
};

export type SaveDailyLogRequest = {
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

type ApiDailyLogSummary = {
  id: string;
  log_date: string;
  skin_condition: SkinCondition;
};

type GetDailyLogsResponse = {
  logs: ApiDailyLogSummary[];
};

type ApiDailyLogItem = {
  id: string;
  brand: string | null;
  name: string;
};

type ApiLogUsedItemGroup = {
  id: string;
  time_of_day: "morning" | "night";
  item_ids: string[];
  items: ApiDailyLogItem[];
};

type ApiDailyLogDetail = {
  id: string;
  user_id: string;
  log_date: string;
  skin_condition: SkinCondition;
  weather?: Weather | null;
  sleep_level?: SleepLevel | null;
  meal_balance?: MealBalance | null;
  free_note?: string | null;
  isMenstruation: boolean;
  used_items: {
    morning?: ApiLogUsedItemGroup | null;
    night?: ApiLogUsedItemGroup | null;
  };
  created_at: string;
  updated_at: string;
};

type GetDailyLogByDateResponse = {
  log: ApiDailyLogDetail | null;
};

type SaveDailyLogApiRequest = {
  log_date?: string;
  skin_condition: SkinCondition;
  weather?: Weather | null;
  sleep_level?: SleepLevel | null;
  meal_balance?: MealBalance | null;
  free_note?: string | null;
  isMenstruation: boolean;
  used_items: {
    morning: {
      item_ids: string[];
    };
    night: {
      item_ids: string[];
    };
  };
};

type DailyLogUsedItemsForForm = {
  morning: {
    itemIds: string[];
  };
  night: {
    itemIds: string[];
  };
};

const toDailyLogFromSummary = (summary: ApiDailyLogSummary): DailyLog => {
  return {
    id: summary.id,
    userId: "",
    logDate: summary.log_date,
    skinCondition: summary.skin_condition,
    weather: undefined,
    sleepLevel: undefined,
    mealBalance: undefined,
    freeNote: undefined,
    isMenstruation: false,
    usedItems: [],
    createdAt: "",
    updatedAt: "",
  };
};

const toDailyLogFromDetail = (detail: ApiDailyLogDetail): DailyLog => {
  const usedItemsForForm: DailyLogUsedItemsForForm = {
    morning: {
      itemIds: detail.used_items.morning?.item_ids ?? [],
    },
    night: {
      itemIds: detail.used_items.night?.item_ids ?? [],
    },
  };

  return {
    id: detail.id,
    userId: detail.user_id,
    logDate: detail.log_date,
    skinCondition: detail.skin_condition,
    weather: detail.weather ?? undefined,
    sleepLevel: detail.sleep_level ?? undefined,
    mealBalance: detail.meal_balance ?? undefined,
    freeNote: detail.free_note ?? undefined,
    isMenstruation: detail.isMenstruation,

    /**
     * 既存の DailyLog 型が usedItems: [] 前提の場合でも、
     * リロード後にフォームへ朝/夜アイテムを戻すため、
     * API詳細レスポンスの item_ids をここで保持する。
     */
    usedItems: usedItemsForForm as unknown as DailyLog["usedItems"],

    createdAt: detail.created_at,
    updatedAt: detail.updated_at,
  };
};

const toCreateDailyLogApiRequest = (
  request: SaveDailyLogRequest,
): SaveDailyLogApiRequest => {
  return {
    log_date: request.logDate,
    skin_condition: request.skinCondition,
    weather: request.weather ?? null,
    sleep_level: request.sleepLevel ?? null,
    meal_balance: request.mealBalance ?? null,
    free_note: request.freeNote ?? null,
    isMenstruation: request.isMenstruation,
    used_items: {
      morning: {
        item_ids: request.morningItemIds,
      },
      night: {
        item_ids: request.nightItemIds,
      },
    },
  };
};

const toUpdateDailyLogApiRequest = (
  request: SaveDailyLogRequest,
): SaveDailyLogApiRequest => {
  return {
    skin_condition: request.skinCondition,
    weather: request.weather ?? null,
    sleep_level: request.sleepLevel ?? null,
    meal_balance: request.mealBalance ?? null,
    free_note: request.freeNote ?? null,
    isMenstruation: request.isMenstruation,
    used_items: {
      morning: {
        item_ids: request.morningItemIds,
      },
      night: {
        item_ids: request.nightItemIds,
      },
    },
  };
};

export const getDailyLogs = async (
  params: GetDailyLogsParams,
): Promise<DailyLog[]> => {
  if (USE_MOCK_API) {
    return mockDailyLogs.filter(
      (dailyLog) =>
        dailyLog.logDate >= params.startDate &&
        dailyLog.logDate <= params.endDate,
    );
  }

  const searchParams = new URLSearchParams({
    start_date: params.startDate,
    end_date: params.endDate,
  });

  const response = await apiClient.get<GetDailyLogsResponse>(
    `/api/daily_logs?${searchParams.toString()}`,
  );

  return response.logs.map(toDailyLogFromSummary);
};

export const getDailyLogByDate = async (
  logDate: string,
): Promise<DailyLog | null> => {
  if (USE_MOCK_API) {
    return (
      mockDailyLogs.find((dailyLog) => dailyLog.logDate === logDate) ?? null
    );
  }

  const response = await apiClient.get<GetDailyLogByDateResponse>(
    `/api/daily_logs/${logDate}`,
  );

  if (!response.log) {
    return null;
  }

  return toDailyLogFromDetail(response.log);
};

export const saveDailyLog = async (
  request: SaveDailyLogRequest,
): Promise<DailyLog> => {
  if (USE_MOCK_API) {
    const existingDailyLog = mockDailyLogs.find(
      (dailyLog) => dailyLog.logDate === request.logDate,
    );

    return existingDailyLog ?? mockDailyLogs[0];
  }

  const response = await apiClient.post<
    ApiDailyLogDetail,
    SaveDailyLogApiRequest
  >("/api/daily_logs", toCreateDailyLogApiRequest(request));

  return toDailyLogFromDetail(response);
};

export const updateDailyLog = async (
  id: string,
  request: SaveDailyLogRequest,
): Promise<DailyLog> => {
  if (USE_MOCK_API) {
    const existingDailyLog = mockDailyLogs.find(
      (dailyLog) => dailyLog.id === id,
    );

    return existingDailyLog ?? mockDailyLogs[0];
  }

  const response = await apiClient.patch<
    ApiDailyLogDetail,
    SaveDailyLogApiRequest
  >(`/api/daily_logs/${id}`, toUpdateDailyLogApiRequest(request));

  return toDailyLogFromDetail(response);
};
