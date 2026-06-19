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
    </section>
  );
};
