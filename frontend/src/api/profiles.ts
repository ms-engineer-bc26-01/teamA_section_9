import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockProfile } from "@/mocks/mockProfile";
import type { Profile } from "@/types/models";

export const getMyProfile = async (): Promise<Profile> => {
  if (USE_MOCK_API) {
    return mockProfile;
  }

  return apiClient.get<Profile>("/api/profiles/me");
};
