import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { mockAiSuggestions } from "@/mocks/mockAiSuggestions";
import type { AiSuggestion } from "@/types/models";

export type AiSuggestionType = "home_summary" | "daily_comment";

export type CreateAiSuggestionRequest =
  | {
      suggestionType: "daily_comment";
      targetDate: string;
    }
  | {
      suggestionType: "home_summary";
      startDate?: string;
      endDate?: string;
    };

type CreateAiSuggestionApiRequest = {
  suggestion_type: AiSuggestionType;
  target_date?: string;
  start_date?: string;
  end_date?: string;
};

type ApiAiSuggestion = {
  id: string;
  user_id: string;
  suggested_at: string;
  suggestion_type: AiSuggestionType;
  title: string;
  body?: string | null;
  basis?: string | null;
  created_at: string;
};

const toAiSuggestion = (apiSuggestion: ApiAiSuggestion): AiSuggestion => {
  return {
    id: apiSuggestion.id,
    userId: apiSuggestion.user_id,
    suggestedAt: apiSuggestion.suggested_at,
    suggestionType: apiSuggestion.suggestion_type,
    title: apiSuggestion.title,
    body: apiSuggestion.body ?? undefined,
    basis: apiSuggestion.basis ?? undefined,
    createdAt: apiSuggestion.created_at,
  };
};

const toCreateAiSuggestionApiRequest = (
  request: CreateAiSuggestionRequest,
): CreateAiSuggestionApiRequest => {
  if (request.suggestionType === "daily_comment") {
    return {
      suggestion_type: "daily_comment",
      target_date: request.targetDate,
    };
  }

  return {
    suggestion_type: "home_summary",
    start_date: request.startDate,
    end_date: request.endDate,
  };
};

export const createAiSuggestion = async (
  request: CreateAiSuggestionRequest,
): Promise<AiSuggestion> => {
  if (USE_MOCK_API) {
    return (
      mockAiSuggestions.find(
        (suggestion) => suggestion.suggestionType === request.suggestionType,
      ) ?? mockAiSuggestions[0]
    );
  }

  const response = await apiClient.post<
    ApiAiSuggestion,
    CreateAiSuggestionApiRequest
  >("/api/ai_suggestions", toCreateAiSuggestionApiRequest(request));

  return toAiSuggestion(response);
};

export const getHomeSummaryAiSuggestion = async (
  startDate: string,
  endDate: string,
): Promise<AiSuggestion> => {
  return createAiSuggestion({
    suggestionType: "home_summary",
    startDate,
    endDate,
  });
};

export const getDailyCommentAiSuggestion = async (
  targetDate: string,
): Promise<AiSuggestion> => {
  return createAiSuggestion({
    suggestionType: "daily_comment",
    targetDate,
  });
};
