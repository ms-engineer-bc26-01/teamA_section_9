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

const toDate = (dateString: string) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const createWeeklyCalendarDays = (
  dailyLogs: DailyLog[],
): CalendarDay[] => {
  const logMap = new Map(dailyLogs.map((log) => [log.logDate, log]));

  const latestDate =
    dailyLogs.length > 0
      ? toDate(
          [...dailyLogs]
            .sort((a, b) => a.logDate.localeCompare(b.logDate))
            .at(-1)!.logDate,
        )
      : new Date();

  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(latestDate);
    date.setDate(latestDate.getDate() - (6 - index));

    const dateKey = formatDateKey(date);

    return {
      date: dateKey,
      day: date.getDate(),
      dayOfWeek: dayOfWeekLabels[date.getDay()],
      log: logMap.get(dateKey),
    };
  });
};
