"use client";

import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "@/api/profiles";
import { getMyUserItems } from "@/api/userItems";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { Loading } from "@/components/common/Loading";
import { AppShell } from "@/components/layout/AppShell";
import { ItemRegisterModal } from "@/features/items/components/ItemRegisterModal";
import { LogoutButton } from "@/features/my-page/components/LogoutButton";
import { MyPageHeader } from "@/features/my-page/components/MyPageHeader";
import { MyPageHeaderActions } from "@/features/my-page/components/MyPageHeaderActions";
import { ProfileCard } from "@/features/my-page/components/ProfileCard";
import { ProfileEditModal } from "@/features/my-page/components/ProfileEditModal";
import { UserItemList } from "@/features/my-page/components/UserItemList";
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userItems, setUserItems] = useState<UserItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isItemRegisterModalOpen, setIsItemRegisterModalOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);

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
      const data = await fetchMyPageData();

      setProfile(data.profile);
      setUserItems(data.userItems);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      setErrorMessage("マイページ情報の再取得に失敗しました。");
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
    } catch (error) {
      console.error(error);
      setErrorMessage("プロフィールの保存に失敗しました。");
    }
  };

  const handleLogout = () => {
    alert("ログアウト処理は後続PRで実装予定です。");
  };

  return (
    <>
      <AppShell
        title="SkinMate"
        headerRightContent={
          <MyPageHeaderActions
            onClickAddItem={() => setIsItemRegisterModalOpen(true)}
          />
        }
      >
        <section className="space-y-4">
          <MyPageHeader />

          {isLoading && <Loading text="マイページを読み込み中..." />}

          {!isLoading && errorMessage && (
            <ErrorMessage message={errorMessage} />
          )}

          {!isLoading && !errorMessage && profile && (
            <>
              <ProfileCard
                profile={profile}
                onClickEdit={() => setIsProfileEditModalOpen(true)}
              />

              <UserItemList userItems={userItems} />

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
