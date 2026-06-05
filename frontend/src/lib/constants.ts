export const APP_NAME = "Beauty Archive";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

export const ROUTES = {
  home: "/",
  record: "/record",
  myPage: "/my-page",
  login: "/login",
  register: "/register",
} as const;

export const SKIN_TYPES = [
  { label: "普通肌", value: "normal" },
  { label: "乾燥肌", value: "dry" },
  { label: "脂性肌", value: "oily" },
  { label: "混合肌", value: "combination" },
  { label: "敏感肌", value: "sensitive" },
] as const;

export const WEATHER_OPTIONS = [
  { label: "晴れ", value: "sunny" },
  { label: "くもり", value: "cloudy" },
  { label: "雨", value: "rainy" },
] as const;

export const SLEEP_LEVEL_OPTIONS = [
  { label: "短い", value: "short" },
  { label: "普通", value: "normal" },
  { label: "長い", value: "long" },
] as const;

export const MEAL_BALANCE_OPTIONS = [
  { label: "良い", value: "good" },
  { label: "普通", value: "normal" },
  { label: "悪い", value: "bad" },
] as const;
