import type { DailyLog } from "@/types/models";
import type { DailyLogFormValues } from "@/features/daily-log/types";

export const getTodayDateString = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const dayOfWeekLabels = ["日", "月", "火", "水", "木", "金", "土"];
  const dayOfWeek = dayOfWeekLabels[date.getDay()];

  return `${month}月${day}日（${dayOfWeek}）`;
};

export const createPastDateOptions = (days: number) => {
  const today = new Date();

  return Array.from({ length: days }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);

    const value = formatDateKey(date);

    return {
      value,
      label:
        index === 0
          ? `今日（${formatDisplayDate(value)}）`
          : formatDisplayDate(value),
    };
  });
};

export const createEmptyDailyLogFormValues = (
  logDate: string,
): DailyLogFormValues => {
  return {
    logDate,
    skinCondition: null,
    weather: "",
    sleepLevel: "",
    mealBalance: "",
    freeNote: "",
    isMenstruation: false,
    morningItemIds: [],
    nightItemIds: [],
  };
};

export const convertDailyLogToFormValues = (
  dailyLog: DailyLog,
): DailyLogFormValues => {
  return {
    logDate: dailyLog.logDate,
    skinCondition: dailyLog.skinCondition,
    weather: dailyLog.weather ?? "",
    sleepLevel: dailyLog.sleepLevel ?? "",
    mealBalance: dailyLog.mealBalance ?? "",
    freeNote: dailyLog.freeNote ?? "",
    isMenstruation: dailyLog.isMenstruation,
    morningItemIds: dailyLog.usedItems
      .filter((usedItem) => usedItem.timeOfDay === "morning")
      .map((usedItem) => usedItem.item.id),
    nightItemIds: dailyLog.usedItems
      .filter((usedItem) => usedItem.timeOfDay === "night")
      .map((usedItem) => usedItem.item.id),
  };
};
