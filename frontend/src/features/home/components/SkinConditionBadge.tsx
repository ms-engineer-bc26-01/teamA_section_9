import type { SkinCondition } from "@/types/models";
import { cn } from "@/lib/utils";

type SkinConditionBadgeProps = {
  condition?: SkinCondition;
};

const conditionMap = {
  1: {
    face: "😢",
    className: "text-sky-500",
    label: "不調",
  },
  2: {
    face: "☺️",
    className: "text-orange-500",
    label: "普通",
  },
  3: {
    face: "😆",
    className: "text-rose-500",
    label: "良好",
  },
} as const;

export const SkinConditionBadge = ({ condition }: SkinConditionBadgeProps) => {
  if (!condition) {
    return <span className="text-lg text-gray-300">-</span>;
  }

  const item = conditionMap[condition];

  return (
    <span
      className={cn("text-2xl font-bold leading-none", item.className)}
      aria-label={item.label}
      title={item.label}
    >
      {item.face}
    </span>
  );
};
