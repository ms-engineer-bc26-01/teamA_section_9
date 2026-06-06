"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLatestAiSuggestion } from "@/api/aiSuggestions";
import { getDailyLogs } from "@/api/dailyLogs";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import { AiSuggestionCard } from "@/features/home/components/AiSuggestionCard";
import { HomeHeaderActions } from "@/features/home/components/HomeHeaderActions";
import { SkinCalendar } from "@/features/home/components/SkinCalendar";
import type { AiSuggestion, DailyLog } from "@/types/models";

export default function HomePage() {
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [latestSuggestion, setLatestSuggestion] = useState<AiSuggestion | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [dailyLogsResponse, latestSuggestionResponse] = await Promise.all(
          [getDailyLogs(), getLatestAiSuggestion()],
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

    fetchHomeData();
  }, []);

  const handleClickAddItem = () => {
    alert("アイテム登録は後続PRで実装予定です。");
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
            <AiSuggestionCard suggestion={latestSuggestion} />
            <SkinCalendar dailyLogs={dailyLogs} />
          </>
        )}
      </section>
    </AppShell>
  );
}
