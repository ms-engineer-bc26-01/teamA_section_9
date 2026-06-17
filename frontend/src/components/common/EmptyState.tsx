import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) => {
  const hasAction = Boolean(actionLabel && (actionHref || onAction));

  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-xl">
          {icon}
        </div>
      )}

      <p className="text-sm font-bold text-gray-700">{title}</p>

      {description && (
        <p className="mt-2 text-xs leading-relaxed text-gray-500">
          {description}
        </p>
      )}

      {hasAction && actionHref && (
        <Link
          href={actionHref}
          className="mt-4 inline-flex rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600"
        >
          {actionLabel}
        </Link>
      )}

      {hasAction && !actionHref && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
