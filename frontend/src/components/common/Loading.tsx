type LoadingProps = {
  text?: string;
};

export const Loading = ({ text = "読み込み中..." }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-6 text-sm font-bold text-gray-500">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-rose-500" />
      <span>{text}</span>
    </div>
  );
};
