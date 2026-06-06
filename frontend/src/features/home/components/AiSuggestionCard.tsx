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

          <p className="mb-2 text-xs font-bold leading-relaxed text-rose-600">
            【直近1週間：水分バランス安定・透明感UP期】
          </p>

          {suggestion.body && (
            <p className="text-xs leading-relaxed text-gray-600">
              {suggestion.body}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
