"use client";

import { useEffect, useState } from "react";
import { getLatestAiSuggestion } from "@/api/aiSuggestions";
import { getDailyLogs } from "@/api/dailyLogs";
import { getHealth, type HealthResponse } from "@/api/health";
import { getMyProfile } from "@/api/profiles";
import { getMyUserItems } from "@/api/userItems";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import type { AiSuggestion, DailyLog, Profile, UserItem } from "@/types/models";

export default function FrontendBasePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [latestSuggestion, setLatestSuggestion] = useState<AiSuggestion | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          healthResponse,
          profileResponse,
          userItemsResponse,
          dailyLogsResponse,
          latestSuggestionResponse,
        ] = await Promise.all([
          getHealth(),
          getMyProfile(),
          getMyUserItems(),
          getDailyLogs(),
          getLatestAiSuggestion(),
        ]);

        setHealth(healthResponse);
        setProfile(profileResponse);
        setUserItems(userItemsResponse);
        setDailyLogs(dailyLogsResponse);
        setLatestSuggestion(latestSuggestionResponse);
      } catch (error) {
        console.error(error);
        setErrorMessage("初期データの取得に失敗しました。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  return (
    <AppShell title="SkinMate">
      <section className="space-y-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-xs font-bold text-rose-500">
            feature/frontend-base
          </p>

          <h2 className="text-lg font-bold text-gray-800">
            フロントエンド基盤確認
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            共通コンポーネント、共通レイアウト、型定義、mockデータ、API関数の初期設定を確認するページです。
          </p>
        </div>

        {isLoading && <Loading text="初期データを読み込み中..." />}

        {!isLoading && errorMessage && <ErrorMessage message={errorMessage} />}

        {!isLoading && !errorMessage && (
          <>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-700">
                API / mock 接続確認
              </h3>

              <p className="text-sm text-gray-600">
                {health?.message ?? "接続情報なし"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-700">
                プロフィール
              </h3>

              {profile ? (
                <div className="space-y-1 text-sm text-gray-600">
                  <p>名前：{profile.name}</p>
                  <p>肌タイプ：{profile.skinType}</p>
                  <p>生年月日：{profile.birthDay}</p>
                </div>
              ) : (
                <EmptyState title="プロフィールがありません" />
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-700">
                所有アイテム
              </h3>

              {userItems.length > 0 ? (
                <ul className="space-y-2">
                  {userItems.map((userItem) => (
                    <li
                      key={userItem.id}
                      className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-700"
                    >
                      <span className="font-bold">{userItem.item.brand}</span>
                      <span className="ml-1">{userItem.item.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="所有アイテムがありません" />
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-700">
                記録データ
              </h3>

              <p className="text-sm text-gray-600">
                登録済み記録：{dailyLogs.length}件
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-gray-700">
                最新AI提案
              </h3>

              {latestSuggestion ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-rose-600">
                    {latestSuggestion.title}
                  </p>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {latestSuggestion.body}
                  </p>
                </div>
              ) : (
                <EmptyState title="AI提案がありません" />
              )}
            </div>

            <div className="space-y-3">
              <Button fullWidth>Primary Button</Button>
              <Button fullWidth variant="secondary">
                Secondary Button
              </Button>
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}
