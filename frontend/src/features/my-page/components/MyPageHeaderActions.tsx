"use client";

import Link from "next/link";

type MyPageHeaderActionsProps = {
  onClickAddItem: () => void;
};

export const MyPageHeaderActions = ({
  onClickAddItem,
}: MyPageHeaderActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onClickAddItem}
        className="rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-500 shadow-sm transition hover:bg-rose-100"
      >
        ＋ アイテム登録
      </button>

      <Link
        href="/record"
        className="rounded-2xl bg-rose-500 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600"
      >
        今日を記録
      </Link>
    </div>
  );
};
