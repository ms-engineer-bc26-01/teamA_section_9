"use client";

import { useEffect, useState } from "react";
import { AlertModal } from "@/components/modal/AlertModal";
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
  onRegistered?: () => void;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchInitialItems = async () => {
      try {
        setIsSearching(true);
        setErrorMessage("");

        const items = await searchItems("");
        setSearchResults(items);
      } catch (error) {
        console.error(error);
        setErrorMessage("アイテム一覧の取得に失敗しました。");
      } finally {
        setIsSearching(false);
      }
    };

    fetchInitialItems();
  }, [isOpen]);

  const handleSearch = async (searchKeyword: string) => {
    try {
      setKeyword(searchKeyword);
      setIsSearching(true);
      setErrorMessage("");
      setSelectedItem(null);

      const items = await searchItems(searchKeyword);
      setSearchResults(items);
    } catch (error) {
      console.error(error);
      setErrorMessage("アイテム検索に失敗しました。");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRegister = async () => {
    if (!selectedItem) {
      setErrorMessage("登録するアイテムを選択してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await createUserItem(selectedItem.id);

      onRegistered?.();
      setIsSuccessAlertOpen(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("アイテム登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModalState = () => {
    setKeyword("");
    setSearchResults([]);
    setSelectedItem(null);
    setErrorMessage("");
    setIsSearching(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleCloseSuccessAlert = () => {
    setIsSuccessAlertOpen(false);
    resetModalState();
    onClose();
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

          <ItemSearchResultList
            items={searchResults}
            selectedItemId={selectedItem?.id}
            onSelect={setSelectedItem}
          />

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Button variant="secondary" onClick={handleClose}>
              キャンセル
            </Button>

            <Button
              onClick={handleRegister}
              disabled={!selectedItem || isSubmitting}
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </Button>
          </div>
        </div>
      </BaseModal>

      <AlertModal
        isOpen={isSuccessAlertOpen}
        title="登録しました"
        message="選択したアイテムを手持ちアイテムに追加しました。"
        onClose={handleCloseSuccessAlert}
      />
    </>
  );
};
