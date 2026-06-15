"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ItemRegisterModal } from "@/features/items/components/ItemRegisterModal";

type HeaderProps = {
  title: string;
  onItemRegistered?: () => void | Promise<void>;
};

const menuItemClassName =
  "block w-full appearance-none border-0 bg-transparent px-4 py-2.5 text-left font-sans text-gray-700 transition hover:bg-gray-50";

const disabledMenuItemClassName =
  "block w-full cursor-not-allowed appearance-none border-0 bg-transparent px-4 py-2.5 text-left font-sans text-gray-300";

const menuItemTextClassName = "block !text-xs font-bold !leading-none";

export const Header = ({ title, onItemRegistered }: HeaderProps) => {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isItemRegisterModalOpen, setIsItemRegisterModalOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavigate = (path: string) => {
    closeMenu();
    router.push(path);
  };

  const handleOpenItemRegisterModal = () => {
    closeMenu();
    setIsItemRegisterModalOpen(true);
  };

  return (
    <>
      <header className="relative z-40 shrink-0 border-b border-gray-100 bg-white px-5 pb-4 pt-8">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            {title}
          </h1>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-lg font-bold text-gray-600 shadow-sm transition hover:bg-gray-100"
              aria-label="メニューを開く"
              aria-expanded={isMenuOpen}
            >
              ☰
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-12 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white py-2 shadow-xl">
                <button
                  type="button"
                  onClick={() => handleNavigate("/")}
                  className={menuItemClassName}
                >
                  <span className={menuItemTextClassName}>ホーム画面</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/record")}
                  className={menuItemClassName}
                >
                  <span className={menuItemTextClassName}>記録画面</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigate("/my-page")}
                  className={menuItemClassName}
                >
                  <span className={menuItemTextClassName}>マイページ</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenItemRegisterModal}
                  className={menuItemClassName}
                >
                  <span className={menuItemTextClassName}>アイテム登録</span>
                </button>

                <button
                  type="button"
                  disabled
                  className={disabledMenuItemClassName}
                >
                  <span className={menuItemTextClassName}>利用規約</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default"
          aria-label="メニューを閉じる"
          onClick={closeMenu}
        />
      )}

      <ItemRegisterModal
        isOpen={isItemRegisterModalOpen}
        onClose={() => setIsItemRegisterModalOpen(false)}
        onRegistered={onItemRegistered}
      />
    </>
  );
};
