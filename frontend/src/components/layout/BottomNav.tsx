"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "ホーム", href: ROUTES.home },
  { label: "記録", href: ROUTES.record },
  { label: "マイページ", href: ROUTES.myPage },
];

export const BottomNav = () => {
  const pathname = usePathname();

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white px-4 pb-5 pt-3">
      <div className="grid grid-cols-3 gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl py-2 text-center text-xs font-bold transition",
                isActive
                  ? "bg-rose-50 text-rose-500"
                  : "text-gray-400 hover:bg-gray-50",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
