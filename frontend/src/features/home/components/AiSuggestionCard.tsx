import Link from "next/link";
import type { AiSuggestion } from "@/types/models";

type AiSuggestionCardProps = {
  suggestion: AiSuggestion | null;
};

const AI_DISCLAIMER_TEXT =
  "※本提案は医療行為ではありません。肌トラブルが続く場合は皮膚科専門医へご相談ください。";

export const AiSuggestionCard = ({ suggestion }: AiSuggestionCardProps) => {
  if (!suggestion) {
    return (
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-base">
            🫧
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                AI分析
              </span>

              <p className="text-sm font-bold text-gray-800">
                まだAI提案がありません
              </p>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              肌記録を保存すると、今日の振り返りコメントやスキンケアのヒントが表示されます。
            </p>

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[10px] leading-relaxed text-rose-500">
                {AI_DISCLAIMER_TEXT}
              </p>

              <Link
                href="/record"
                className="shrink-0 rounded-full bg-rose-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-rose-600"
              >
                記録する
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 1. basisの文字列を分解してチェック
  const basisText = suggestion.basis ? suggestion.basis.trim() : "";
  const parts = basisText ? basisText.split(" × ") : [];
  
  // 2. 2つ目のアイテムがちゃんと存在し、かつ "null" でない場合のみ「2個あり」と判定
  const hasItemA = parts.length >= 1 && parts[0] && parts[0] !== "null" && parts[0].trim() !== "";
  const hasItemB = parts.length >= 2 && parts[1] && parts[1] !== "null" && parts[1].trim() !== "";
  const hasTwoItems = basisText.includes(" × ") && hasItemA && hasItemB;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex">
        <div className="w-1 bg-rose-400" />

        <div className="flex-1 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
              AI分析
            </span>

            <h2 className="text-sm font-bold text-gray-800">
              {suggestion.title}
            </h2>
          </div>

          {suggestion.body && (
            <p className="text-xs leading-relaxed text-gray-600">
              {suggestion.body}
            </p>
          )}

          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-center">
            <p className="text-xs font-black tracking-wider text-rose-400 uppercase">
              🫧 おすすめのセット 🫧
            </p>

            {hasTwoItems ? (
              // アイテムが2つ揃っている場合
              <div className="mt-3 flex flex-col items-center justify-center text-[11px] font-medium text-gray-700">
                <span className="px-2 leading-tight">
                  {parts[0]}
                </span>

                <div className="my-1 flex items-center gap-1.5">
                  <div className="h-[1px] w-15 bg-rose-100" />

                  <span className="font-sans text-[14px] font-bold leading-none text-rose-300">
                    ×
                  </span>

                  <div className="h-[1px] w-15 bg-rose-100" />
                </div>

                <span className="px-2 leading-tight">
                  {parts[1]}
                </span>
              </div>
            ) : (
              // 0個、または1個しか登録がない場合（指定のテキストを表示）
              <p className="mt-2 text-[11px] leading-relaxed font-medium text-gray-600">
                アイテム登録から普段お使いのスキンケアを複数個登録しておくと、今日の肌状態に合わせたおすすめセットが提案されます💡
              </p>
            )}
          </div>

          <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[10px] leading-relaxed text-rose-500">
            {AI_DISCLAIMER_TEXT}
          </p>
        </div>
      </div>
    </section>
  );
};