"use client";

import { useState } from "react";
import { BaseModal } from "@/components/modal/BaseModal";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { searchItems } from "@/api/items";
import { createUserItem } from "@/api/userItems";
import { ItemSearchForm } from "@/features/items/components/ItemSearchForm";
import { ItemSearchResultList } from "@/features/items/components/ItemSearchResultList";
import type { Item } from "@/types/models";

type ItemRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: () => void | Promise<void>;
};

export const ItemRegisterModal = ({
  isOpen,
  onClose,
  onRegistered,
}: ItemRegisterModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const handleSearch = async (searchKeyword: string) => {
    try {
      setKeyword(searchKeyword);
      setIsSearching(true);
      setHasSearched(true);
      setErrorMessage("");
      setSelectedItem(null);

      const response = await searchItems({
        q: searchKeyword,
        limit: 20,
        offset: 0,
      });

      setSearchResults(response.items);
    } catch (error) {
      console.error(error);
      setErrorMessage("アイテム検索に失敗しました。");
    } finally {
      setIsSearching(false);
    }
  };

  const resetModalState = () => {
    setKeyword("");
    setSearchResults([]);
    setSelectedItem(null);
    setErrorMessage("");
    setIsSearching(false);
    setIsRegistering(false);
    setHasSearched(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleRegister = async () => {
    if (!selectedItem) {
      setErrorMessage("登録するアイテムを選択してください。");
      return;
    }

    try {
      setIsRegistering(true);
      setErrorMessage("");

      await createUserItem(selectedItem.id);

      try {
        await onRegistered?.();
      } catch (error) {
        console.error(error);
      }

      resetModalState();
      onClose();
      setIsCompleteModalOpen(true);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error ? error.message : "アイテム登録に失敗しました。";

      setErrorMessage(message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCloseCompleteModal = () => {
    setIsCompleteModalOpen(false);
  };

  return (
    <>
      <BaseModal isOpen={isOpen} title="アイテム登録" onClose={handleClose}>
        <div className="space-y-4">
          <p className="text-xs leading-relaxed text-gray-500">
            登録したい化粧品を検索し、手持ちアイテムとして追加します。
          </p>

          {errorMessage && <ErrorMessage message={errorMessage} />}

          <ItemSearchForm
            initialKeyword={keyword}
            isSearching={isSearching}
            onSearch={handleSearch}
          />

          {isSearching ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-4">
              <p className="text-xs font-medium text-gray-400">
                アイテムを検索中です...
              </p>
            </div>
          ) : (
            <ItemSearchResultList
              items={searchResults}
              selectedItemId={selectedItem?.id}
              hasSearched={hasSearched}
              onSelect={setSelectedItem}
            />
          )}

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isRegistering}
            >
              キャンセル
            </Button>

            <Button
              onClick={handleRegister}
              disabled={!selectedItem || isRegistering}
            >
              {isRegistering ? "登録中..." : "登録する"}
            </Button>
          </div>
        </div>
      </BaseModal>

      {isCompleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-5 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-xl font-bold text-rose-500">
              ✓
            </div>

            <h3 className="mt-3 text-base font-bold text-gray-800">
              アイテムを登録しました
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              所有アイテム一覧に追加されました。
            </p>

            <button
              type="button"
              onClick={handleCloseCompleteModal}
              className="mt-5 w-full rounded-2xl bg-rose-500 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-rose-600"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};
