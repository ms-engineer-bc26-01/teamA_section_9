import type { ReactNode } from "react";

type HeaderProps = {
  title: string;
  rightContent?: ReactNode;
};

export const Header = ({ title, rightContent }: HeaderProps) => {
  return (
    <header className="shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pt-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          {title}
        </h1>

        {rightContent && <div className="shrink-0">{rightContent}</div>}
      </div>
    </header>
  );
};
