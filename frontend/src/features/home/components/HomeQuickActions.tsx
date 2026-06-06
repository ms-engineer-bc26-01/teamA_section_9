"use client";

import Link from "next/link";
import { Button } from "@/components/common/Button";

type HomeQuickActionsProps = {
  onClickAddItem: () => void;
};

export const HomeQuickActions = ({ onClickAddItem }: HomeQuickActionsProps) => {
  return (
    <section className="grid grid-cols-2 gap-3">
      <Button variant="secondary" fullWidth onClick={onClickAddItem}>
        アイテム登録
      </Button>

      <Link
        href="/record"
        className="rounded-xl bg-rose-500 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-rose-600 active:bg-rose-700"
      >
        今日を記録
      </Link>
    </section>
  );
};
