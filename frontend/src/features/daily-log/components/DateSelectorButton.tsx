type DateSelectorButtonProps = {
  logDate: string;
};

const formatDisplayDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `今日（${month}月${day}日）`;
};

export const DateSelectorButton = ({ logDate }: DateSelectorButtonProps) => {
  return (
    <button
      type="button"
      className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-bold text-gray-500 shadow-sm"
    >
      {formatDisplayDate(logDate)}⌄
    </button>
  );
};
