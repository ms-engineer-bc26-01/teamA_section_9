import type { Profile } from "@/types/models";
import { formatBirthDay, getSkinTypeLabel } from "@/features/my-page/utils";

type ProfileCardProps = {
  profile: Profile;
  onClickEdit: () => void;
};

export const ProfileCard = ({ profile, onClickEdit }: ProfileCardProps) => {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-100 bg-rose-50 text-lg text-rose-400">
            ☺
          </div>

          <div>
            <h2 className="text-base font-bold text-gray-800">
              {profile.name}
            </h2>

            <span className="mt-1.5 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-500">
              {getSkinTypeLabel(profile.skinType)}
            </span>

            <p className="mt-1.5 text-[10px] text-gray-400">
              {formatBirthDay(profile.birthDay)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClickEdit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-400 transition hover:bg-gray-100"
          aria-label="プロフィールを編集"
        >
          ✎
        </button>
      </div>
    </section>
  );
};
