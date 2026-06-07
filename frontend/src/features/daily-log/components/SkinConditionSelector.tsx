"use client";

import type { SkinCondition } from "@/types/models";
import { cn } from "@/lib/utils";

type SkinConditionSelectorProps = {
  value: SkinCondition | null;
  onChange: (value: SkinCondition) => void;
};

const options: Array<{
  value: SkinCondition;
  label: string;
  face: string;
  selectedClassName: string;
  defaultClassName: string;
}> = [
  {
    value: 1,
    label: "悪い",
    face: "😢",
    selectedClassName: "border-sky-300 bg-sky-50 text-sky-500",
    defaultClassName: "border-gray-100 bg-white text-gray-400",
  },
  {
    value: 2,
    label: "普通",
    face: "☺️",
    selectedClassName: "border-orange-400 bg-orange-50 text-orange-500",
    defaultClassName: "border-gray-100 bg-white text-gray-400",
  },
  {
    value: 3,
    label: "良い",
    face: "😆",
    selectedClassName: "border-pink-300 bg-pink-50 text-pink-400",
    defaultClassName: "border-gray-100 bg-white text-gray-400",
  },
];

export const SkinConditionSelector = ({
  value,
  onChange,
}: SkinConditionSelectorProps) => {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white px-4 py-5 shadow-sm">
      <h2 className="mb-5 text-center text-base font-bold text-gray-700">
        お肌の調子はどうですか？
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  "flex h-16 w-16 items-center justify-center rounded-full border-4 text-base font-bold transition",
                  isSelected
                    ? option.selectedClassName
                    : option.defaultClassName,
                )}
              >
                {option.face}
              </div>

              <span
                className={cn(
                  "mt-2 text-xs font-bold",
                  isSelected ? "text-gray-700" : "text-gray-400",
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
