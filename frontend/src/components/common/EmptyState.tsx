type EmptyStateProps = {
  title: string;
  description?: string;
};

export const EmptyState = ({ title, description }: EmptyStateProps) => {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
      <p className="text-sm font-bold text-gray-700">{title}</p>

      {description && (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
      )}
    </div>
  );
};
