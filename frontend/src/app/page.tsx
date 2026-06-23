"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getHomeSummaryAiSuggestion,
  getLatestHomeSummaryAiSuggestion,
} from "@/api/aiSuggestions";
import { getDailyLogs } from "@/api/dailyLogs";
import { ErrorFallback } from "@/components/common/ErrorFallback";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import { AiSuggestionCard } from "@/features/home/components/AiSuggestionCard";
import { useApiError } from "@/hooks/useApiError";
import { SkinCalendar } from "@/features/home/components/SkinCalendar";
import type { AiSuggestion, DailyLog } from "@/types/models";

const HOME_SUMMARY_STORAGE_KEY = "skinmate:pending-home-summary";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getRecentWeekRange = () => {
  const endDate = new Date();
  const startDate = new Date();

  startDate.setDate(endDate.getDate() - 6);

  return {
    startDate: formatDateKey(startDate),
    endDate: formatDateKey(endDate),
  };
};

const parsePendingHomeSummaryRange = (
  raw: string,
): { startDate: string; endDate: string } | null => {
  try {
    const parsed = JSON.parse(raw) as {
      startDate?: unknown;
      endDate?: unknown;
    };

    if (
      typeof parsed.startDate !== "string" ||
      typeof parsed.endDate !== "string"
    ) {
      return null;
    }

    return {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    };
  } catch {
    return null;
  }
};

export default function HomePage() {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [latestSuggestion, setLatestSuggestion] = useState<AiSuggestion | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingHomeSummary, setIsGeneratingHomeSummary] = useState(false);
  const { error, clearError, handleError } = useApiError();

  const hasStartedHomeSummaryGeneration = useRef(false);

  const todayDateString = formatDateKey(new Date());
  const hasTodayDailyLog = dailyLogs.some(
    (dailyLog) => dailyLog.logDate === todayDateString,
  );

  const fetchHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const { startDate, endDate } = getRecentWeekRange();

      const [dailyLogsResponse, latestSuggestionResponse] = await Promise.all([
        getDailyLogs({
          startDate,
          endDate,
        }),
        getLatestHomeSummaryAiSuggestion(),
      ]);

      setDailyLogs(dailyLogsResponse);
      setLatestSuggestion(latestSuggestionResponse);
    } catch (nextError) {
      handleError(nextError, {
        fallbackMessage: "ホーム画面のデータ取得に失敗しました。",
        context: "HomePage.fetchHomeData",
      });
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    const runFetchHomeData = async () => {
      await fetchHomeData();
    };

    void runFetchHomeData();
  }, [fetchHomeData]);

  useEffect(() => {
    const generatePendingHomeSummary = async () => {
      if (hasStartedHomeSummaryGeneration.current) {
        return;
      }

      const raw = sessionStorage.getItem(HOME_SUMMARY_STORAGE_KEY);

      if (!raw) {
        return;
      }

      const range = parsePendingHomeSummaryRange(raw);

      if (!range) {
        sessionStorage.removeItem(HOME_SUMMARY_STORAGE_KEY);
        return;
      }

      hasStartedHomeSummaryGeneration.current = true;

      try {
        setIsGeneratingHomeSummary(true);

        await getHomeSummaryAiSuggestion(range.startDate, range.endDate);

        const latestHomeSummary = await getLatestHomeSummaryAiSuggestion();

        setLatestSuggestion(latestHomeSummary);
      } catch (error) {
        console.error("ホーム要約AI提案の生成に失敗しました。", error);
      } finally {
        sessionStorage.removeItem(HOME_SUMMARY_STORAGE_KEY);
        setIsGeneratingHomeSummary(false);
      }
    };

    void generatePendingHomeSummary();
  }, []);

  return (
    <AppShell title="SkinMate">
      <section className="space-y-4">
        {isLoading && <Loading text="ホーム画面を読み込み中..." />}

        {!isLoading && error && (
          <ErrorFallback
            error={error}
            onRetry={fetchHomeData}
            isRetrying={isLoading}
          />
        )}

        {!isLoading && !error && (
          <>
            <div className="rounded-3xl border border-rose-100 bg-rose-50 px-4 py-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm shadow-sm">
                    💡
                  </span>

                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-rose-400">
                      今日の記録
                    </p>

                    <p className="mt-0.5 text-xs font-bold leading-5 text-gray-700">
                      {hasTodayDailyLog ? (
                        "今日の記録は入力済みです✨"
                      ) : (
                        <>
                          <span className="block">
                            今日の記録がまだありません
                          </span>
                          <span className="block">入力しましょう📝</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {!hasTodayDailyLog && (
                  <Link
                    href="/record"
                    className="shrink-0 rounded-full bg-rose-400 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-rose-500"
                  >
                    記録する
                  </Link>
                )}
              </div>
            </div>

            {isGeneratingHomeSummary ? (
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />

                  <p className="text-sm font-bold text-rose-500">
                    AI提案を更新中です...
                  </p>
                </div>

                <p className="text-xs leading-6 text-gray-600">
                  最新の記録をもとに、ホーム画面のアドバイスを生成しています。
                </p>
              </div>
            ) : (
              <AiSuggestionCard suggestion={latestSuggestion} />
            )}

            <SkinCalendar dailyLogs={dailyLogs} />
          </>
        )}
      </section>
    </AppShell>
  );
}
