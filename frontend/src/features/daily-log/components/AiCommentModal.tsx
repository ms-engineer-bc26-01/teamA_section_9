"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import type { AiSuggestion } from "@/types/models";

type AiCommentModalProps = {
  isOpen: boolean;
  suggestion: AiSuggestion | null;
  onClose: () => void;
};

export const AiCommentModal = ({
  isOpen,
  suggestion,
  onClose,
}: AiCommentModalProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleClickBackHome = () => {
    onClose();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="bg-rose-50 px-5 py-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500 text-2xl font-bold text-white">
            ✓
          </div>

          <h2 className="text-lg font-bold text-gray-800">
            記録が完了しました！
          </h2>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-xs font-bold text-gray-500">
            今日の記録に基づくAI提案
          </p>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
            {suggestion ? (
              <>
                <p className="text-sm font-bold leading-relaxed text-rose-500">
                  {suggestion.title}
                </p>

                {suggestion.body && (
                  <p className="mt-3 text-xs leading-6 text-gray-700">
                    {suggestion.body}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs leading-relaxed text-gray-600">
                AI提案を取得できませんでした。
              </p>
            )}
          </div>

          <p className="text-[10px] leading-relaxed text-gray-400">
            ※本提案は医療行為ではありません。症状が強い場合や長引く場合は、医療機関にご相談ください。
          </p>

          <Button
            fullWidth
            onClick={handleClickBackHome}
            className="rounded-2xl bg-gray-800 py-3 text-sm hover:bg-gray-900 active:bg-gray-950"
          >
            ホームに戻る
          </Button>
        </div>
      </div>
    </div>
  );
};
