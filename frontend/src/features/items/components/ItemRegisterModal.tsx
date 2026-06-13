"use client";

import { useState } from "react";
import { BaseModal } from "@/components/modal/BaseModal";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { searchItems } from "@/api/items";
import { ItemSearchForm } from "@/features/items/components/ItemSearchForm";
import { ItemSearchResultList } from "@/features/items/components/ItemSearchResultList";
import type { Item } from "@/types/models";

type ItemRegisterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRegistered?: () => void;
};

export const ItemRegisterModal = ({
  isOpen,
  onClose,
}: ItemRegisterModalProps) => {
  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    setHasSearched(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  return (
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
          <Button variant="secondary" onClick={handleClose}>
            キャンセル
          </Button>

          <Button disabled>登録は後続PR</Button>
        </div>
      </div>
    </BaseModal>
  );
};
