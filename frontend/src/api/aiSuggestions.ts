import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockAiSuggestions } from "@/mocks/mockAiSuggestions";
import type { AiSuggestion, AiSuggestionType } from "@/types/models";

export type CreateAiSuggestionPayload = {
  suggestionType: AiSuggestionType;
  targetDate?: string;
  startDate?: string;
  endDate?: string;
};

export const getLatestAiSuggestion = async (): Promise<AiSuggestion | null> => {
  if (USE_MOCK_API) {
    return (
      mockAiSuggestions.find(
        (suggestion) => suggestion.suggestionType === "home_summary",
      ) ?? null
    );
  }

  return apiClient.get<AiSuggestion>("/api/ai_suggestions?sort=desc&limit=1");
};

export const getAiSuggestions = async (): Promise<AiSuggestion[]> => {
  if (USE_MOCK_API) {
    return mockAiSuggestions;
  }

  return apiClient.get<AiSuggestion[]>("/api/ai_suggestions");
};

export const createAiSuggestion = async (
  payload: CreateAiSuggestionPayload,
): Promise<AiSuggestion> => {
  if (USE_MOCK_API) {
    const suggestion = mockAiSuggestions.find(
      (mockSuggestion) =>
        mockSuggestion.suggestionType === payload.suggestionType,
    );

    if (!suggestion) {
      throw new Error("AI提案のmockデータが見つかりません。");
    }

    return suggestion;
  }

  return apiClient.post<AiSuggestion>("/api/ai_suggestions", payload);
};
