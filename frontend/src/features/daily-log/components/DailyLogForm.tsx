"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SkinConditionSelector } from "@/features/daily-log/components/SkinConditionSelector";
import { LifestyleFields } from "@/features/daily-log/components/LifestyleFields";
import { UsedItemSelector } from "@/features/daily-log/components/UsedItemSelector";
import type { DailyLogFormValues } from "@/features/daily-log/types";
import type { UserItem } from "@/types/models";

type DailyLogFormProps = {
  initialValues: DailyLogFormValues;
  userItems: UserItem[];
  isSubmitting: boolean;
  onSubmit: (values: DailyLogFormValues) => Promise<void>;
};

export const DailyLogForm = ({
  initialValues,
  userItems,
  isSubmitting,
  onSubmit,
}: DailyLogFormProps) => {
  const [values, setValues] = useState<DailyLogFormValues>(initialValues);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!values.skinCondition) {
      setErrorMessage("肌状態を選択してください。");
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error(error);
      setErrorMessage("記録の保存に失敗しました。");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && <ErrorMessage message={errorMessage} />}

      <SkinConditionSelector
        value={values.skinCondition}
        onChange={(skinCondition) =>
          setValues((prev) => ({ ...prev, skinCondition }))
        }
      />

      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-800">使ったアイテム</h2>

        <div className="grid grid-cols-2 gap-3">
          <UsedItemSelector
            timeOfDay="morning"
            title="朝のケア"
            userItems={userItems}
            selectedItemIds={values.morningItemIds}
            onChange={(morningItemIds) =>
              setValues((prev) => ({ ...prev, morningItemIds }))
            }
          />

          <UsedItemSelector
            timeOfDay="night"
            title="夜のケア"
            userItems={userItems}
            selectedItemIds={values.nightItemIds}
            onChange={(nightItemIds) =>
              setValues((prev) => ({ ...prev, nightItemIds }))
            }
          />
        </div>
      </section>

      <LifestyleFields
        weather={values.weather}
        sleepLevel={values.sleepLevel}
        mealBalance={values.mealBalance}
        freeNote={values.freeNote}
        isMenstruation={values.isMenstruation}
        onChange={(changedValues) =>
          setValues((prev) => ({ ...prev, ...changedValues }))
        }
      />

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting}
        className="rounded-2xl bg-gray-800 py-4 text-sm hover:bg-gray-900 active:bg-gray-950"
      >
        {isSubmitting ? "保存中..." : "この内容で記録する"}
      </Button>
    </form>
  );
};
