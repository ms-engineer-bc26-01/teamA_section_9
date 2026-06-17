import { SkinConditionBadge } from "@/features/home/components/SkinConditionBadge";
import { createWeeklyCalendarDays } from "@/features/home/utils";
import { cn } from "@/lib/utils";
import type { DailyLog } from "@/types/models";

type SkinCalendarProps = {
  dailyLogs: DailyLog[];
};

export const SkinCalendar = ({ dailyLogs }: SkinCalendarProps) => {
  const calendarDays = createWeeklyCalendarDays(dailyLogs);
  const hasDailyLogs = dailyLogs.length > 0;

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-700">スキンカレンダー</h2>

        <div className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-bold text-gray-600 shadow-sm">
          直近1週間
        </div>
      </div>

      {!hasDailyLogs && (
        <div className="mb-3 rounded-xl border border-dashed border-rose-100 bg-rose-50 px-3 py-2">
          <p className="text-xs font-bold text-rose-500">
            まだ肌記録がありません
          </p>

          <p className="mt-1 text-[10px] leading-relaxed text-gray-500">
            肌記録を保存すると、上の期間内の日付に肌状態アイコンが反映されます。
          </p>
        </div>
      )}

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((calendarDay) => (
          <div
            key={calendarDay.date}
            className="flex min-w-0 flex-col items-center rounded-xl border border-gray-100 bg-gray-50 px-1 py-2"
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

            <span className="mb-1.5 text-xs font-bold text-gray-700">
              {calendarDay.day}
            </span>

            <SkinConditionBadge condition={calendarDay.log?.skinCondition} />
          </div>
        ))}
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-gray-400">
        😆 良好 / ☺️ 普通 / 😢 不調 / - 未記録
      </p>
    </section>
  );
};
