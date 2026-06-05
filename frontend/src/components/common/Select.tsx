import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SelectOption = {
  label: string;
  value: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = ({
  label,
  error,
  options,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-700">
          {label}
        </label>
      )}

      <select
        id={id}
        className={cn(
          "w-full appearance-none rounded-xl border bg-gray-50 px-4 py-3.5 text-sm text-gray-800 outline-none transition",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 focus:border-rose-400",
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
