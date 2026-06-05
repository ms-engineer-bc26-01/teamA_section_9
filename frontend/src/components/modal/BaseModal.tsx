"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BaseModalProps = {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

export const BaseModal = ({
  isOpen,
  title,
  children,
  onClose,
  className,
}: BaseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4 sm:items-center sm:pb-0">
      <div
        className={cn(
          "w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          {title && (
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full px-2 py-1 text-sm font-bold text-gray-400 hover:bg-gray-100"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};
