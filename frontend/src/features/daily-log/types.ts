import type {
  MealBalance,
  SkinCondition,
  SleepLevel,
  TimeOfDay,
  UserItem,
  Weather,
} from "@/types/models";

export type DailyLogFormValues = {
  logDate: string;
  skinCondition: SkinCondition | null;
  weather: Weather | "";
  sleepLevel: SleepLevel | "";
  mealBalance: MealBalance | "";
  freeNote: string;
  isMenstruation: boolean;
  morningItemIds: string[];
  nightItemIds: string[];
};

export type UsedItemSelectorGroup = {
  timeOfDay: TimeOfDay;
  title: string;
  selectedItemIds: string[];
  userItems: UserItem[];
  onChange: (itemIds: string[]) => void;
};
