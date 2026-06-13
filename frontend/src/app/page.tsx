"use client";

import { useEffect, useRef, useState } from "react";
import {
  getHomeSummaryAiSuggestion,
  getLatestHomeSummaryAiSuggestion,
} from "@/api/aiSuggestions";
import { getDailyLogs } from "@/api/dailyLogs";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import { AiSuggestionCard } from "@/features/home/components/AiSuggestionCard";
import { HomeHeaderActions } from "@/features/home/components/HomeHeaderActions";
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
  const [errorMessage, setErrorMessage] = useState("");

  const hasStartedHomeSummaryGeneration = useRef(false);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const { startDate, endDate } = getRecentWeekRange();

        const [dailyLogsResponse, latestSuggestionResponse] = await Promise.all(
          [
            getDailyLogs({
              startDate,
              endDate,
            }),
            getLatestHomeSummaryAiSuggestion(),
          ],
        );

        setDailyLogs(dailyLogsResponse);
        setLatestSuggestion(latestSuggestionResponse);
      } catch (error) {
        console.error(error);
        setErrorMessage("ホーム画面のデータ取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchHomeData();
  }, []);

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

  const handleClickAddItem = () => {
    alert("アイテム登録APIは後続PRで接続予定です。");
  };

  return (
    <AppShell
      title="SkinMate"
      headerRightContent={
        <HomeHeaderActions onClickAddItem={handleClickAddItem} />
      }
    >
      <section className="space-y-5">
        {isLoading && <Loading text="ホーム画面を読み込み中..." />}

        {!isLoading && errorMessage && <ErrorMessage message={errorMessage} />}

        {!isLoading && !errorMessage && (
          <>
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
