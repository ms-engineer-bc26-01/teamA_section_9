"use client";

import { Button } from "@/components/common/Button";

type LogoutButtonProps = {
  onClick: () => void;
};

export const LogoutButton = ({ onClick }: LogoutButtonProps) => {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <Button variant="secondary" fullWidth onClick={onClick}>
        ログアウト
      </Button>

      <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-400">
        Firebase認証の本実装後、ログアウト処理を接続予定です。
      </p>
    </section>
  );
};
