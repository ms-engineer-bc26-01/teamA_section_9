"use client";

import { useEffect, useState } from "react";
import { getDailyCommentAiSuggestion } from "@/api/aiSuggestions";
import { saveDailyLog } from "@/api/dailyLogs";
import { getMyUserItems } from "@/api/userItems";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import { AiCommentModal } from "@/features/daily-log/components/AiCommentModal";
import { DailyLogForm } from "@/features/daily-log/components/DailyLogForm";
import { DateSelectModal } from "@/features/daily-log/components/DateSelectModal";
import { DateSelectorButton } from "@/features/daily-log/components/DateSelectorButton";
import type { DailyLogFormValues } from "@/features/daily-log/types";
import {
  createEmptyDailyLogFormValues,
  getTodayDateString,
} from "@/features/daily-log/utils";
import type { AiSuggestion, UserItem } from "@/types/models";

export default function RecordPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDateSelectModalOpen, setIsDateSelectModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues = createEmptyDailyLogFormValues(selectedDate);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setErrorMessage("");

        const userItemsResponse = await getMyUserItems();

        setUserItems(userItemsResponse);
      } catch (error) {
        console.error(error);
        setErrorMessage("手持ちアイテムの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInitialData();
  }, []);

  const handleSubmit = async (values: DailyLogFormValues) => {
    if (!values.skinCondition) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await saveDailyLog({
        logDate: values.logDate,
        skinCondition: values.skinCondition,
        weather: values.weather || undefined,
        sleepLevel: values.sleepLevel || undefined,
        mealBalance: values.mealBalance || undefined,
        freeNote: values.freeNote || undefined,
        isMenstruation: values.isMenstruation,
        morningItemIds: values.morningItemIds,
        nightItemIds: values.nightItemIds,
      });

      const suggestion = await getDailyCommentAiSuggestion(values.logDate);

      setAiSuggestion(suggestion);
      setIsAiModalOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("記録の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AppShell title="SkinMate">
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-gray-800">今日の記録</h1>

            <DateSelectorButton
              logDate={selectedDate}
              onClick={() => setIsDateSelectModalOpen(true)}
            />
          </div>

          {isLoading && <Loading text="記録画面を読み込み中..." />}

          {!isLoading && errorMessage && (
            <ErrorMessage message={errorMessage} />
          )}

          {!isLoading && !errorMessage && (
            <DailyLogForm
              key={selectedDate}
              initialValues={initialValues}
              userItems={userItems}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          )}
        </section>
      </AppShell>

      <DateSelectModal
        isOpen={isDateSelectModalOpen}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        onClose={() => setIsDateSelectModalOpen(false)}
      />

      <AiCommentModal
        isOpen={isAiModalOpen}
        suggestion={aiSuggestion}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
}
