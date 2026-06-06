import type { DailyLog } from "@/types/models";
import { createWeeklyCalendarDays } from "@/features/home/utils";
import { SkinConditionBadge } from "@/features/home/components/SkinConditionBadge";
import { cn } from "@/lib/utils";

type SkinCalendarProps = {
  dailyLogs: DailyLog[];
};

export const SkinCalendar = ({ dailyLogs }: SkinCalendarProps) => {
  const calendarDays = createWeeklyCalendarDays(dailyLogs);

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700">スキンカレンダー</h2>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-bold text-gray-600 shadow-sm">
          直近1週間
        </div>
      </div>

      <div className="hide-scroll flex gap-2 overflow-x-auto pb-1">
        {calendarDays.map((calendarDay) => (
          <div
            key={calendarDay.date}
            className="flex w-12 shrink-0 flex-col items-center rounded-xl border border-gray-100 bg-gray-50 px-2 py-2"
          >
            <span
              className={cn(
                "mb-1 text-[10px] font-bold",
                calendarDay.dayOfWeek === "日" && "text-rose-400",
                calendarDay.dayOfWeek === "土" && "text-blue-400",
                !["日", "土"].includes(calendarDay.dayOfWeek) &&
                  "text-gray-400",
              )}
            >
              {calendarDay.dayOfWeek}
            </span>

            <span className="mb-2 text-sm font-bold text-gray-700">
              {calendarDay.day}
            </span>

            <SkinConditionBadge condition={calendarDay.log?.skinCondition} />
          </div>
        ))}
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-gray-400">
        ☺ 良好 / ☺ 普通 / ☹ 不調 / - 未記録
      </p>
    </section>
  );
};
