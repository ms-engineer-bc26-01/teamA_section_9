"use client";

import type { SkinType } from "@/types/models";
import { SKIN_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SkinTypeSelectorProps = {
  value: SkinType;
  onChange: (value: SkinType) => void;
};

export const SkinTypeSelector = ({
  value,
  onChange,
}: SkinTypeSelectorProps) => {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-gray-700">現在の肌タイプ</p>

      <div className="grid grid-cols-2 gap-2">
        {SKIN_TYPES.map((skinType) => {
          const isSelected = value === skinType.value;

          return (
            <button
              key={skinType.value}
              type="button"
              onClick={() => onChange(skinType.value)}
              className={cn(
                "rounded-lg border px-3 py-2.5 text-xs font-bold transition",
                isSelected
                  ? "border-rose-300 bg-rose-50 text-rose-600"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100",
                skinType.value === "sensitive" && "col-span-2",
              )}
            >
              {skinType.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
