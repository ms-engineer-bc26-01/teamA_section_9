import { EmptyState } from "@/components/common/EmptyState";
import type { AiSuggestion } from "@/types/models";

type AiSuggestionCardProps = {
  suggestion: AiSuggestion | null;
};

export const AiSuggestionCard = ({ suggestion }: AiSuggestionCardProps) => {
  if (!suggestion) {
    return (
      <EmptyState
        title="AI提案がありません"
        description="記録を追加すると、肌状態に合わせた提案が表示されます。"
      />
    );
  }

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

          {suggestion.basis && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-center">
              <p className="text-xs font-black tracking-wider text-rose-400 uppercase">
                🫧 おすすめのセット 🫧
              </p>
              
              {suggestion.basis.includes(" × ") ? (
                <div className="mt-3 flex flex-col items-center justify-center text-[11px] font-medium text-gray-700">
                  
                  {/* 商品名A */}
                  <span className="leading-tight px-2">
                    {suggestion.basis.split(" × ")[0]}
                  </span>

                  <div className="flex items-center gap-1.5 my-1">
                    <div className="h-[1px] w-15 bg-rose-100" />
                    <span className="text-[14px] font-bold text-rose-300 font-sans leading-none">
                      ×
                    </span>
                    <div className="h-[1px] w-15 bg-rose-100" />
                  </div>

                  {/* 商品名B */}
                  <span className="leading-tight px-2">
                    {suggestion.basis.split(" × ")[1]}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-[11px] font-medium text-gray-700">
                  {suggestion.basis}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};