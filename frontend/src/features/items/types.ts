import type { Item } from "@/types/models";

export type ItemRegisterModalState = {
  keyword: string;
  searchResults: Item[];
  selectedItem: Item | null;
  isSearching: boolean;
  isSubmitting: boolean;
  errorMessage: string;
};
