import {
  formatDisplayDate,
  getTodayDateString,
} from "@/features/daily-log/utils";

type DateSelectorButtonProps = {
  logDate: string;
  onClick: () => void;
};

export const DateSelectorButton = ({
  logDate,
  onClick,
}: DateSelectorButtonProps) => {
  const label =
    logDate === getTodayDateString()
      ? `今日（${formatDisplayDate(logDate)}）`
      : formatDisplayDate(logDate);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-[11px] font-bold text-gray-500 shadow-sm"
    >
      {label}⌄
    </button>
  );
};
