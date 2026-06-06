import { APP_NAME } from "@/lib/constants";

type HeaderProps = {
  title?: string;
};

export const Header = ({ title = APP_NAME }: HeaderProps) => {
  return (
    <header className="shrink-0 border-b border-gray-100 bg-white/90 px-5 pb-3 pt-12 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold tracking-tight text-gray-800">
          {title}
        </h1>
      </div>
    </header>
  );
};
