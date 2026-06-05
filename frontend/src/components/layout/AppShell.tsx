import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

type AppShellProps = {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
};

export const AppShell = ({
  children,
  title,
  showBottomNav = true,
}: AppShellProps) => {
  return (
    <div className="flex min-h-screen justify-center bg-gray-200 text-gray-800">
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50 sm:h-[844px] sm:max-h-[95vh] sm:w-[390px] sm:self-center sm:rounded-[3rem] sm:border-[8px] sm:border-white sm:shadow-2xl">
        <Header title={title} />

        <main className="hide-scroll flex-1 overflow-y-auto px-4 py-5 pb-28">
          {children}
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
};
