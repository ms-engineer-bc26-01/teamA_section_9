"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { BaseModal } from "@/components/modal/BaseModal";
import type { Profile, SkinType } from "@/types/models";
import { cn } from "@/lib/utils";
import { getSkinTypeLabel } from "@/features/my-page/utils";

type ProfileEditModalProps = {
  isOpen: boolean;
  profile: Profile;
  onClose: () => void;
  onSave: (profile: Profile) => void;
};

const skinTypeOptions: SkinType[] = [
  "normal",
  "dry",
  "oily",
  "combination",
  "sensitive",
];

export const ProfileEditModal = ({
  isOpen,
  profile,
  onClose,
  onSave,
}: ProfileEditModalProps) => {
  const [name, setName] = useState(profile.name);
  const [birthDay, setBirthDay] = useState(profile.birthDay);
  const [skinType, setSkinType] = useState<SkinType>(profile.skinType);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave({
      ...profile,
      name,
      birthDay,
      skinType,
    });

    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} title="プロフィールの編集" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="profile-name"
          label="お名前"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <Input
          id="profile-birth-day"
          type="date"
          label="生年月日"
          value={birthDay}
          onChange={(event) => setBirthDay(event.target.value)}
        />

        <div>
          <p className="mb-2 text-xs font-bold text-gray-700">
            肌タイプ（1つ選択）
          </p>

          <div className="grid grid-cols-2 gap-2">
            {skinTypeOptions.map((option) => {
              const isSelected = skinType === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSkinType(option)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-xs font-bold transition",
                    isSelected
                      ? "border-rose-300 bg-rose-50 text-rose-500"
                      : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100",
                    option === "sensitive" && "col-span-2",
                  )}
                >
                  {getSkinTypeLabel(option)}
                  {isSelected && <span className="ml-1">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          className="rounded-2xl bg-gray-800 py-3 text-sm hover:bg-gray-900 active:bg-gray-950"
        >
          設定を保存する
        </Button>
      </form>
    </BaseModal>
  );
};
