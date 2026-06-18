"use client";

import { Select } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { MEAL_BALANCE_OPTIONS, SLEEP_LEVEL_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MealBalance, SleepLevel, Weather } from "@/types/models";

type LifestyleFieldsProps = {
  weather: Weather | "";
  sleepLevel: SleepLevel | "";
  mealBalance: MealBalance | "";
  freeNote: string;
  isMenstruation: boolean;
  onChange: (values: {
    weather?: Weather | "";
    sleepLevel?: SleepLevel | "";
    mealBalance?: MealBalance | "";
    freeNote?: string;
    isMenstruation?: boolean;
  }) => void;
};

const weatherOptions: Array<{
  value: Weather;
  label: string;
  icon: string;
  selectedClassName: string;
}> = [
  {
    value: "rainy",
    label: "雨",
    icon: "☂",
    selectedClassName: "bg-white text-sky-500 shadow-sm",
  },
  {
    value: "cloudy",
    label: "くもり",
    icon: "☁",
    selectedClassName: "bg-white text-gray-500 shadow-sm",
  },
  {
    value: "sunny",
    label: "晴れ",
    icon: "☀",
    selectedClassName: "bg-white text-orange-500 shadow-sm",
  },
];

const mealBalanceOrder = ["悪い", "普通", "良い"];

const mealBalanceOptions = [...MEAL_BALANCE_OPTIONS].sort((a, b) => {
  const aIndex = mealBalanceOrder.indexOf(a.label);
  const bIndex = mealBalanceOrder.indexOf(b.label);

  return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
});

export const LifestyleFields = ({
  weather,
  sleepLevel,
  mealBalance,
  freeNote,
  isMenstruation,
  onChange,
}: LifestyleFieldsProps) => {
  return (
    <section className="space-y-4">
      <h2 className="text-base font-bold text-gray-800">ライフスタイル</h2>

      <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm text-rose-500 shadow-sm">
            ♡
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-gray-800">コンディション</h3>

            <p className="mt-1 whitespace-nowrap text-sm font-bold text-rose-500">
              {isMenstruation ? "生理中です" : "生理中ではありません"}
            </p>

            <p className="mt-1 text-[11px] text-gray-500">
              {isMenstruation
                ? "無理せず、肌と体調の変化をメモしておきましょう"
                : "生理がきたら、ここから切り替えできます"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onChange({ isMenstruation: !isMenstruation })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-bold shadow-sm transition",
              isMenstruation
                ? "border-rose-400 bg-white text-rose-500 hover:bg-rose-50"
                : "border-rose-400 bg-rose-400 text-white hover:bg-rose-500",
            )}
          >
            {isMenstruation ? "生理が終わった" : "生理がきた"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-800">お天気</h3>

        <div className="grid grid-cols-3 rounded-2xl bg-gray-50 p-1">
          {weatherOptions.map((option) => {
            const isSelected = weather === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ weather: option.value })}
                className={cn(
                  "rounded-xl px-4 py-2.5 text-lg font-bold transition",
                  isSelected
                    ? option.selectedClassName
                    : "text-gray-400 hover:bg-white/60",
                )}
                aria-label={option.label}
                title={option.label}
              >
                {option.icon}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <Select
            id="sleep-level"
            label="睡眠"
            placeholder="選択"
            value={sleepLevel}
            options={[...SLEEP_LEVEL_OPTIONS]}
            onChange={(event) =>
              onChange({ sleepLevel: event.target.value as SleepLevel | "" })
            }
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <Select
            id="meal-balance"
            label="食事のバランス"
            placeholder="選択"
            value={mealBalance}
            options={mealBalanceOptions}
            onChange={(event) =>
              onChange({ mealBalance: event.target.value as MealBalance | "" })
            }
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <Textarea
          id="free-note"
          label="ひとこと日記・気づき"
          placeholder="例: 日焼け止めを変えたら少し乾燥するかも"
          value={freeNote}
          onChange={(event) => onChange({ freeNote: event.target.value })}
        />
      </div>
    </section>
  );
};
