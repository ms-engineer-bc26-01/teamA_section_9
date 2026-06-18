"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/api/profiles";
import { deleteUserItem, getMyUserItems } from "@/api/userItems";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import { ItemRegisterModal } from "@/features/items/components/ItemRegisterModal";
import { LogoutButton } from "@/features/my-page/components/LogoutButton";
import { MyPageHeader } from "@/features/my-page/components/MyPageHeader";
import { ProfileCard } from "@/features/my-page/components/ProfileCard";
import { ProfileEditModal } from "@/features/my-page/components/ProfileEditModal";
import { UserItemList } from "@/features/my-page/components/UserItemList";
import { authClient } from "@/lib/authClient";
import type { Profile, UserItem } from "@/types/models";

type MyPageData = {
  profile: Profile;
  userItems: UserItem[];
};

const fetchMyPageData = async (): Promise<MyPageData> => {
  const [profileResponse, userItemsResponse] = await Promise.all([
    getMyProfile(),
    getMyUserItems(),
  ]);

  return {
    profile: profileResponse,
    userItems: userItemsResponse,
  };
};

export default function MyPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [isItemRegisterModalOpen, setIsItemRegisterModalOpen] = useState(false);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 1800);
  };

  useEffect(() => {
    let isMounted = true;

    const loadMyPageData = async () => {
      try {
        const data = await fetchMyPageData();

        if (!isMounted) return;

        setProfile(data.profile);
        setUserItems(data.userItems);
        setErrorMessage("");
      } catch (error) {
        console.error(error);

        if (!isMounted) return;

        setErrorMessage("マイページ情報の取得に失敗しました。");
      } finally {
        if (!isMounted) return;

        setIsLoading(false);
      }
    };

    void loadMyPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegistered = async () => {
    try {
      const latestUserItems = await getMyUserItems();

      setUserItems(latestUserItems);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage("登録済みアイテムの再取得に失敗しました。");
    }
  };

  const handleDeleteUserItem = async (userItem: UserItem) => {
    try {
      await deleteUserItem(userItem.id);

      setUserItems((currentUserItems) =>
        currentUserItems.filter(
          (currentUserItem) => currentUserItem.id !== userItem.id,
        ),
      );

      setErrorMessage("");
      showSuccessMessage("アイテムを削除しました。");
    } catch (error) {
      console.error(error);
      setErrorMessage("所有アイテムの削除に失敗しました。");
    }
  };

  const handleSaveProfile = async (updatedProfile: Profile) => {
    try {
      const savedProfile = await updateMyProfile({
        name: updatedProfile.name,
        birthDay: updatedProfile.birthDay,
        skinType: updatedProfile.skinType,
      });

      setProfile(savedProfile);
      setErrorMessage("");
      showSuccessMessage("プロフィールを保存しました。");
    } catch (error) {
      console.error(error);
      setErrorMessage("プロフィールの保存に失敗しました。");
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.logout();

      router.replace("/login");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "ログアウトに失敗しました。時間をおいて再度お試しください。",
      );
    }
  };

  return (
    <>
      <AppShell title="SkinMate" onItemRegistered={handleRegistered}>
        <section className="space-y-4">
          <MyPageHeader />

          {isLoading && <Loading text="マイページを読み込み中..." />}

          {!isLoading && errorMessage && (
            <ErrorMessage message={errorMessage} />
          )}

          {!isLoading && profile && (
            <>
              <ProfileCard
                profile={profile}
                onClickEdit={() => setIsProfileEditModalOpen(true)}
              />

              <UserItemList
                userItems={userItems}
                onDelete={handleDeleteUserItem}
                onClickRegister={() => setIsItemRegisterModalOpen(true)}
              />

              <LogoutButton onClick={handleLogout} />
            </>
          )}
        </section>
      </AppShell>

      <ItemRegisterModal
        isOpen={isItemRegisterModalOpen}
        onClose={() => setIsItemRegisterModalOpen(false)}
        onRegistered={handleRegistered}
      />

      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4">
          <div className="w-full max-w-xs rounded-3xl bg-white px-6 py-5 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-xl">
              ✓
            </div>

            <p className="mt-3 text-sm font-bold text-gray-800">
              {successMessage}
            </p>

            <p className="mt-1 text-[11px] text-gray-500">
              所有アイテム一覧に反映しました。
            </p>
          </div>
        </div>
      )}

      {profile && (
        <ProfileEditModal
          isOpen={isProfileEditModalOpen}
          profile={profile}
          onClose={() => setIsProfileEditModalOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
}
