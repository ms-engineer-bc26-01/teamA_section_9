import { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = ({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-700">
          {label}
        </label>
      )}

      <textarea
        id={id}
        className={cn(
          "min-h-28 w-full resize-none rounded-xl border bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 focus:border-rose-400",
          className,
        )}
        {...props}
      />

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
