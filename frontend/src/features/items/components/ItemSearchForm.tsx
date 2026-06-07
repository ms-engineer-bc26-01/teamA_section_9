"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

type ItemSearchFormProps = {
  initialKeyword?: string;
  isSearching: boolean;
  onSearch: (keyword: string) => void;
};

export const ItemSearchForm = ({
  initialKeyword = "",
  isSearching,
  onSearch,
}: ItemSearchFormProps) => {
  const [keyword, setKeyword] = useState(initialKeyword);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch(keyword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        id="item-search-keyword"
        label="アイテム検索"
        placeholder="ブランド名・商品名・カテゴリで検索"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />

      <Button type="submit" fullWidth disabled={isSearching}>
        {isSearching ? "検索中..." : "検索する"}
      </Button>
    </form>
  );
};
