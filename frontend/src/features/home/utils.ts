import type { DailyLog } from "@/types/models";

export type CalendarDay = {
  date: string;
  day: number;
  dayOfWeek: string;
  log?: DailyLog;
};

const dayOfWeekLabels = ["日", "月", "火", "水", "木", "金", "土"];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const createWeeklyCalendarDays = (
  dailyLogs: DailyLog[],
): CalendarDay[] => {
  const logMap = new Map(dailyLogs.map((log) => [log.logDate, log]));
  const today = new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);

    // 常に今日を起点に、6日前〜今日の直近1週間を表示する
    date.setDate(today.getDate() - (6 - index));

    const dateKey = formatDateKey(date);

    return {
      date: dateKey,
      day: date.getDate(),
      dayOfWeek: dayOfWeekLabels[date.getDay()],
      log: logMap.get(dateKey),
    };
  });
};
