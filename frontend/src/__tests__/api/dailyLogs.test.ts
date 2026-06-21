const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

import {
  getDailyLogByDate,
  getDailyLogs,
  saveDailyLog,
  updateDailyLog,
} from "@/api/dailyLogs";

describe("dailyLogs API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("日次ログ一覧取得でクエリを付けて要約レスポンスを整形できる", async () => {
    getMock.mockResolvedValue({
      logs: [
        {
          id: "log-1",
          log_date: "2026-06-20",
          skin_condition: 2,
        },
      ],
    });

    const result = await getDailyLogs({
      startDate: "2026-06-01",
      endDate: "2026-06-30",
    });

    expect(getMock).toHaveBeenCalledWith(
      "/api/daily_logs?start_date=2026-06-01&end_date=2026-06-30",
    );
    expect(result).toEqual([
      {
        id: "log-1",
        userId: "",
        logDate: "2026-06-20",
        skinCondition: 2,
        weather: undefined,
        sleepLevel: undefined,
        mealBalance: undefined,
        freeNote: undefined,
        isMenstruation: false,
        usedItems: [],
        createdAt: "",
        updatedAt: "",
      },
    ]);
  });

  it("日付別ログ取得で詳細レスポンスをフォーム用の形に整形できる", async () => {
    getMock.mockResolvedValue({
      log: {
        id: "log-2",
        user_id: "user-1",
        log_date: "2026-06-21",
        skin_condition: 3,
        weather: "sunny",
        sleep_level: null,
        meal_balance: "good",
        free_note: null,
        isMenstruation: true,
        used_items: {
          morning: {
            id: "used-1",
            time_of_day: "morning",
            item_ids: ["item-1", "item-2"],
            items: [],
          },
          night: null,
        },
        created_at: "2026-06-21T00:00:00.000Z",
        updated_at: "2026-06-21T01:00:00.000Z",
      },
    });

    const result = await getDailyLogByDate("2026-06-21");

    expect(getMock).toHaveBeenCalledWith("/api/daily_logs/2026-06-21");
    expect(result).toEqual({
      id: "log-2",
      userId: "user-1",
      logDate: "2026-06-21",
      skinCondition: 3,
      weather: "sunny",
      sleepLevel: undefined,
      mealBalance: "good",
      freeNote: undefined,
      isMenstruation: true,
      usedItems: {
        morning: {
          itemIds: ["item-1", "item-2"],
        },
        night: {
          itemIds: [],
        },
      },
      createdAt: "2026-06-21T00:00:00.000Z",
      updatedAt: "2026-06-21T01:00:00.000Z",
    });
  });

  it("日付別ログ取得で対象がなければ null を返す", async () => {
    getMock.mockResolvedValue({
      log: null,
    });

    await expect(getDailyLogByDate("2026-06-22")).resolves.toBeNull();
    expect(getMock).toHaveBeenCalledWith("/api/daily_logs/2026-06-22");
  });

  it("日次ログ保存で作成用リクエストに変換して返却値を整形できる", async () => {
    postMock.mockResolvedValue({
      id: "log-3",
      user_id: "user-2",
      log_date: "2026-06-23",
      skin_condition: 1,
      weather: null,
      sleep_level: "long",
      meal_balance: null,
      free_note: "メモ",
      isMenstruation: false,
      used_items: {
        morning: {
          id: "used-2",
          time_of_day: "morning",
          item_ids: ["item-10"],
          items: [],
        },
        night: {
          id: "used-3",
          time_of_day: "night",
          item_ids: ["item-11", "item-12"],
          items: [],
        },
      },
      created_at: "2026-06-23T00:00:00.000Z",
      updated_at: "2026-06-23T00:10:00.000Z",
    });

    const request = {
      logDate: "2026-06-23",
      skinCondition: 1 as const,
      weather: undefined,
      sleepLevel: "long" as const,
      mealBalance: undefined,
      freeNote: "メモ",
      isMenstruation: false,
      morningItemIds: ["item-10"],
      nightItemIds: ["item-11", "item-12"],
    };

    const result = await saveDailyLog(request);

    expect(postMock).toHaveBeenCalledWith("/api/daily_logs", {
      log_date: "2026-06-23",
      skin_condition: 1,
      weather: null,
      sleep_level: "long",
      meal_balance: null,
      free_note: "メモ",
      isMenstruation: false,
      used_items: {
        morning: {
          item_ids: ["item-10"],
        },
        night: {
          item_ids: ["item-11", "item-12"],
        },
      },
    });
    expect(result).toEqual({
      id: "log-3",
      userId: "user-2",
      logDate: "2026-06-23",
      skinCondition: 1,
      weather: undefined,
      sleepLevel: "long",
      mealBalance: undefined,
      freeNote: "メモ",
      isMenstruation: false,
      usedItems: {
        morning: {
          itemIds: ["item-10"],
        },
        night: {
          itemIds: ["item-11", "item-12"],
        },
      },
      createdAt: "2026-06-23T00:00:00.000Z",
      updatedAt: "2026-06-23T00:10:00.000Z",
    });
  });

  it("日次ログ更新で更新用リクエストに変換して log_date を送らない", async () => {
    patchMock.mockResolvedValue({
      id: "log-4",
      user_id: "user-3",
      log_date: "2026-06-24",
      skin_condition: 2,
      weather: "rainy",
      sleep_level: "normal",
      meal_balance: "bad",
      free_note: "更新後",
      isMenstruation: true,
      used_items: {
        morning: null,
        night: {
          id: "used-4",
          time_of_day: "night",
          item_ids: ["item-20"],
          items: [],
        },
      },
      created_at: "2026-06-24T00:00:00.000Z",
      updated_at: "2026-06-24T00:30:00.000Z",
    });

    const request = {
      logDate: "2026-06-24",
      skinCondition: 2 as const,
      weather: "rainy" as const,
      sleepLevel: "normal" as const,
      mealBalance: "bad" as const,
      freeNote: "更新後",
      isMenstruation: true,
      morningItemIds: [],
      nightItemIds: ["item-20"],
    };

    const result = await updateDailyLog("log-4", request);

    expect(patchMock).toHaveBeenCalledWith("/api/daily_logs/log-4", {
      skin_condition: 2,
      weather: "rainy",
      sleep_level: "normal",
      meal_balance: "bad",
      free_note: "更新後",
      isMenstruation: true,
      used_items: {
        morning: {
          item_ids: [],
        },
        night: {
          item_ids: ["item-20"],
        },
      },
    });
    expect(result).toMatchObject({
      id: "log-4",
      userId: "user-3",
      logDate: "2026-06-24",
      skinCondition: 2,
      weather: "rainy",
      sleepLevel: "normal",
      mealBalance: "bad",
      freeNote: "更新後",
      isMenstruation: true,
      createdAt: "2026-06-24T00:00:00.000Z",
      updatedAt: "2026-06-24T00:30:00.000Z",
    });
    expect(result?.usedItems).toEqual({
      morning: {
        itemIds: [],
      },
      night: {
        itemIds: ["item-20"],
      },
    });
  });
});
