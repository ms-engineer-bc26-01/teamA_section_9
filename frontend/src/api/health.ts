import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";

export type HealthResponse = {
  status: string;
  message: string;
};

export const getHealth = async (): Promise<HealthResponse> => {
  if (USE_MOCK_API) {
    return {
      status: "success",
      message: "Mock API is enabled.",
    };
  }

  return apiClient.get<HealthResponse>("/api/test");
};
