"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownProps = {
  id?: string;
  label?: string;
  error?: string;
  options: DropdownOption[];
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
};

export const Dropdown = ({
  id,
  label,
  error,
  options,
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const triggerId = id ?? `dropdown-${generatedId}`;
  const labelId = label ? `${triggerId}-label` : undefined;
  const listboxId = `${triggerId}-listbox`;

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      {label && (
        <label
          id={labelId}
          htmlFor={triggerId}
          className="block text-xs font-bold text-gray-700"
        >
          {label}
        </label>
      )}

      <button
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-controls={listboxId}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border bg-gray-50 px-4 py-3.5 text-left text-sm text-gray-800 outline-none transition",
          error
            ? "border-red-300 focus:border-red-400"
            : "border-gray-200 focus:border-rose-400",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <span className={cn(!selectedOption && "text-gray-400")}>
          {selectedOption?.label ?? placeholder}
        </span>

        <span className="ml-3 shrink-0 text-xs text-gray-400" aria-hidden="true">
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute left-0 right-0 top-full z-20 mt-1 max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-3 text-left text-sm transition first:rounded-t-xl last:rounded-b-xl",
                  isSelected
                    ? "bg-rose-50 font-bold text-rose-500"
                    : "text-gray-700 hover:bg-gray-50",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
};
