"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDailyCommentAiSuggestion } from "@/api/aiSuggestions";
import {
  getDailyLogByDate,
  saveDailyLog,
  updateDailyLog,
} from "@/api/dailyLogs";
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
import type { AiSuggestion, DailyLog, UserItem } from "@/types/models";

const HOME_SUMMARY_STORAGE_KEY = "skinmate:pending-home-summary";

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getPreviousDateString = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - 1);

  return formatDateKey(date);
};

const getRecentWeekRange = (baseDateString: string) => {
  const baseDate = new Date(`${baseDateString}T00:00:00`);
  const startDate = new Date(baseDate);

  startDate.setDate(baseDate.getDate() - 6);

  return {
    startDate: formatDateKey(startDate),
    endDate: formatDateKey(baseDate),
  };
};

const getItemIdsByTimeOfDay = (
  dailyLog: DailyLog,
  timeOfDay: "morning" | "night",
): string[] => {
  const usedItems = dailyLog.usedItems as unknown;

  if (!usedItems || typeof usedItems !== "object") {
    return [];
  }

  if (Array.isArray(usedItems)) {
    return [];
  }

  const group = (usedItems as Record<string, unknown>)[timeOfDay];

  if (!group || typeof group !== "object") {
    return [];
  }

  const itemIds = (group as { itemIds?: unknown }).itemIds;

  if (!Array.isArray(itemIds)) {
    return [];
  }

  return itemIds.filter(
    (itemId): itemId is string => typeof itemId === "string",
  );
};

const toDailyLogFormValues = (dailyLog: DailyLog): DailyLogFormValues => {
  return {
    logDate: dailyLog.logDate,
    skinCondition: dailyLog.skinCondition,
    weather: dailyLog.weather ?? "",
    sleepLevel: dailyLog.sleepLevel ?? "",
    mealBalance: dailyLog.mealBalance ?? "",
    freeNote: dailyLog.freeNote ?? "",
    isMenstruation: dailyLog.isMenstruation,
    morningItemIds: getItemIdsByTimeOfDay(dailyLog, "morning"),
    nightItemIds: getItemIdsByTimeOfDay(dailyLog, "night"),
  };
};

export default function RecordPage() {
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [currentDailyLog, setCurrentDailyLog] = useState<DailyLog | null>(null);
  const [initialValues, setInitialValues] = useState<DailyLogFormValues>(
    createEmptyDailyLogFormValues(selectedDate),
  );

  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion | null>(null);
  const [savedLogDateForHomeSummary, setSavedLogDateForHomeSummary] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDailyComment, setIsGeneratingDailyComment] =
    useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isDateSelectModalOpen, setIsDateSelectModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setErrorMessage("");

        const userItemsResponse = await getMyUserItems();

        setUserItems(userItemsResponse);
      } catch (error) {
        console.error(error);
        setErrorMessage("手持ちアイテムの取得に失敗しました。");
      }
    };

    void fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchDailyLog = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const dailyLog = await getDailyLogByDate(selectedDate);

        if (dailyLog) {
          setCurrentDailyLog(dailyLog);
          setInitialValues(toDailyLogFormValues(dailyLog));
          return;
        }

        const previousDate = getPreviousDateString(selectedDate);
        const previousDailyLog = await getDailyLogByDate(previousDate);

        setCurrentDailyLog(null);
        setInitialValues({
          ...createEmptyDailyLogFormValues(selectedDate),
          isMenstruation: previousDailyLog?.isMenstruation === true,
        });
      } catch (error) {
        console.error(error);
        setErrorMessage("日次記録の取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDailyLog();
  }, [selectedDate]);

  const handleSubmit = async (values: DailyLogFormValues) => {
    if (!values.skinCondition) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const request = {
        logDate: selectedDate,
        skinCondition: values.skinCondition,
        weather: values.weather || undefined,
        sleepLevel: values.sleepLevel || undefined,
        mealBalance: values.mealBalance || undefined,
        freeNote: values.freeNote || undefined,
        isMenstruation: values.isMenstruation,
        morningItemIds: values.morningItemIds,
        nightItemIds: values.nightItemIds,
      };

      const savedDailyLog = currentDailyLog
        ? await updateDailyLog(currentDailyLog.id, request)
        : await saveDailyLog(request);

      setCurrentDailyLog(savedDailyLog);
      setInitialValues(toDailyLogFormValues(savedDailyLog));

      // 保存完了後、まずモーダルを表示する。
      setSavedLogDateForHomeSummary(savedDailyLog.logDate);
      setAiSuggestion(null);
      setIsAiModalOpen(true);

      // モーダル上でdaily_comment生成中を表示しながら生成する。
      try {
        setIsGeneratingDailyComment(true);

        const dailyCommentSuggestion = await getDailyCommentAiSuggestion(
          savedDailyLog.logDate,
        );

        setAiSuggestion(dailyCommentSuggestion);
      } catch (error) {
        console.error("日次AIコメントの生成に失敗しました。", error);
      } finally {
        setIsGeneratingDailyComment(false);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("記録の保存に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAiModal = () => {
    if (!savedLogDateForHomeSummary) {
      setIsAiModalOpen(false);
      router.push("/");
      return;
    }

    const { startDate, endDate } = getRecentWeekRange(
      savedLogDateForHomeSummary,
    );

    sessionStorage.setItem(
      HOME_SUMMARY_STORAGE_KEY,
      JSON.stringify({
        startDate,
        endDate,
      }),
    );

    setIsAiModalOpen(false);
    router.push("/");
  };

  return (
    <>
      <AppShell title="SkinMate">
        <section className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg font-bold text-gray-800">
              {selectedDate === getTodayDateString()
                ? "今日の記録"
                : "日次記録"}
            </h1>

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
              key={`${selectedDate}-${currentDailyLog?.id ?? "new"}`}
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
        isGenerating={isGeneratingDailyComment}
        onClose={handleCloseAiModal}
      />
    </>
  );
}
