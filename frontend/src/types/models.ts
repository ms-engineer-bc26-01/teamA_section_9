export type SkinType = "normal" | "dry" | "oily" | "combination" | "sensitive";

export type Weather = "sunny" | "cloudy" | "rainy";

export type SleepLevel = "short" | "normal" | "long";

export type MealBalance = "good" | "normal" | "bad";

export type TimeOfDay = "morning" | "night";

export type SkinCondition = 1 | 2 | 3;

export type Profile = {
  id: string;
  name: string;
  birthDay: string;
  skinType: SkinType;
  createdAt: string;
  updatedAt: string;
};

export type Ingredient = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  name: string;
};

export type Item = {
  id: string;
  brand: string;
  name: string;
  category: Category;
  ingredients: Ingredient[];
  createdAt: string;
  updatedAt: string;
};

export type UserItem = {
  id: string;
  userId: string;
  item: Item;
  createdAt: string;
  updatedAt: string;
};

export type LogUsedItem = {
  id: string;
  dailyLogId: string;
  timeOfDay: TimeOfDay;
  item: Item;
  stepOrder: number;
};

export type DailyLog = {
  id: string;
  userId: string;
  logDate: string;
  skinCondition: SkinCondition;
  weather?: Weather;
  sleepLevel?: SleepLevel;
  mealBalance?: MealBalance;
  freeNote?: string;
  isMenstruation: boolean;
  usedItems: LogUsedItem[];
  createdAt: string;
  updatedAt: string;
};

export type AiSuggestionType = "home_summary" | "daily_comment";

export type AiSuggestion = {
  id: string;
  userId: string;
  suggestedAt: string;
  suggestionType: AiSuggestionType;
  title: string;
  body?: string;
  basis?: string;
  createdAt: string;
};
