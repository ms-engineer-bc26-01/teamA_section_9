"use client";

import { BaseModal } from "@/components/modal/BaseModal";
import { createPastDateOptions } from "@/features/daily-log/utils";
import { cn } from "@/lib/utils";

type DateSelectModalProps = {
  isOpen: boolean;
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
};

export const DateSelectModal = ({
  isOpen,
  selectedDate,
  onSelect,
  onClose,
}: DateSelectModalProps) => {
  const dateOptions = createPastDateOptions(30);

  const handleSelect = (date: string) => {
    onSelect(date);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} title="記録する日付を選択" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs leading-relaxed text-gray-500">
          過去1ヶ月分の日付から選択できます。
        </p>

        <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {dateOptions.map((option) => {
            const isSelected = selectedDate === option.value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full rounded-xl border px-4 py-3 text-left text-sm font-bold transition",
                    isSelected
                      ? "border-rose-300 bg-rose-50 text-rose-600"
                      : "border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </BaseModal>
  );
};
