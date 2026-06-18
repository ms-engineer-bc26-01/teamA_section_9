"use client";

import { useState } from "react";
import { PRIVACY_POLICY_TEXT, TERMS_TEXT } from "@/lib/legalTexts";
import { cn } from "@/lib/utils";

type TermsModalTab = "terms" | "privacy";

type TermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: TermsModalTab;
};

const tabButtonClassName =
  "flex-1 rounded-full px-2 py-2 text-[10px] font-bold leading-none whitespace-nowrap transition";

const renderLegalText = (text: string) => {
  return text.split("\n").map((line, index) => {
    if (line.startsWith("# ")) {
      return (
        <h2 key={index} className="mb-3 text-base font-bold text-gray-800">
          {line.replace("# ", "")}
        </h2>
      );
    }

    if (line.startsWith("## ")) {
      return (
        <h3 key={index} className="mb-2 mt-5 text-sm font-bold text-gray-800">
          {line.replace("## ", "")}
        </h3>
      );
    }

    if (!line.trim()) {
      return <div key={index} className="h-2" />;
    }

    return (
      <p
        key={index}
        className="whitespace-pre-wrap text-[11px] leading-relaxed"
      >
        {line}
      </p>
    );
  });
};

export const TermsModal = ({
  isOpen,
  onClose,
  initialTab = "terms",
}: TermsModalProps) => {
  const [activeTab, setActiveTab] = useState<TermsModalTab>(initialTab);

  if (!isOpen) {
    return null;
  }

  const displayText = activeTab === "terms" ? TERMS_TEXT : PRIVACY_POLICY_TEXT;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="flex max-h-[82vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="border-b border-gray-100 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold text-rose-400">SkinMate</p>
              <h2 className="mt-1 text-lg font-bold text-gray-800">
                利用規約・プライバシーポリシー
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-50 text-sm font-bold text-gray-400 transition hover:bg-gray-100"
              aria-label="閉じる"
            >
              ×
            </button>
          </div>

          <div className="mt-4 flex rounded-full bg-gray-50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={cn(
                tabButtonClassName,
                activeTab === "terms"
                  ? "bg-white text-rose-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              利用規約
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={cn(
                tabButtonClassName,
                activeTab === "privacy"
                  ? "bg-white text-rose-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600",
              )}
            >
              プライバシーポリシー
            </button>
          </div>
        </div>

        <div className="hide-scroll flex-1 overflow-y-auto px-5 py-4 text-gray-600">
          {renderLegalText(displayText)}
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-rose-400 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-500"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
