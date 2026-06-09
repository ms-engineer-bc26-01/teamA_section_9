import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockProfile } from "@/mocks/mockProfile";
import type { Profile, SkinType } from "@/types/models";

type ApiUser = {
  id: string;
  name: string | null;
  birth_day: string | null;
  skin_type: SkinType | null;
  created_at: string;
  updated_at: string;
};

export type UpdateMyProfileValues = {
  name: string;
  birthDay: string;
  skinType: SkinType;
};

type UpdateMyProfileRequest = {
  name: string;
  birth_day: string;
  skin_type: SkinType;
};

const toProfile = (user: ApiUser): Profile => {
  return {
    id: user.id,
    name: user.name ?? "ゲストユーザー",
    birthDay: user.birth_day ?? "2000-01-01",
    skinType: user.skin_type ?? "normal",
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

export const getMyProfile = async (): Promise<Profile> => {
  if (USE_MOCK_API) {
    return mockProfile;
  }

  const response = await apiClient.get<ApiUser>("/api/users/me");

  return toProfile(response);
};

export const updateMyProfile = async (
  values: UpdateMyProfileValues,
): Promise<Profile> => {
  if (USE_MOCK_API) {
    return {
      ...mockProfile,
      name: values.name,
      birthDay: values.birthDay,
      skinType: values.skinType,
    };
  }

  const response = await apiClient.patch<ApiUser, UpdateMyProfileRequest>(
    "/api/users/me",
    {
      name: values.name,
      birth_day: values.birthDay,
      skin_type: values.skinType,
    },
  );

  return toProfile(response);
};
