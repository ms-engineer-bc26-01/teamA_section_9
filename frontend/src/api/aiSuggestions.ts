import { apiClient } from "@/lib/apiClient";
import { USE_MOCK_API } from "@/lib/constants";
import { createAppError, logError } from "@/lib/errorHandler";
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

type GetAiSuggestionsResponse = {
  suggestions: ApiAiSuggestion[];
  total: number;
};

const isApiAiSuggestion = (value: unknown): value is ApiAiSuggestion => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Partial<ApiAiSuggestion>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.user_id === "string" &&
    typeof candidate.suggested_at === "string" &&
    typeof candidate.suggestion_type === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.created_at === "string"
  );
};

const toInvalidAiResponseError = (details: string) => {
  const error = createAppError({
    category: "ai",
    message: "AIの応答形式が不正です。時間をおいて再度お試しください。",
    details,
    originalError: new Error(details),
  });

  logError(error, "aiSuggestions");

  return error;
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

  if (!isApiAiSuggestion(response)) {
    throw toInvalidAiResponseError(
      "createAiSuggestion response is missing required AI suggestion fields.",
    );
  }

  return toAiSuggestion(response);
};

export const getLatestAiSuggestion = async (
  suggestionType: AiSuggestionType = "home_summary",
): Promise<AiSuggestion | null> => {
  if (USE_MOCK_API) {
    return (
      mockAiSuggestions.find(
        (suggestion) => suggestion.suggestionType === suggestionType,
      ) ?? null
    );
  }

  const searchParams = new URLSearchParams({
    suggestion_type: suggestionType,
    sort: "desc",
    limit: "1",
  });

  const response = await apiClient.get<GetAiSuggestionsResponse>(
    `/api/ai_suggestions?${searchParams.toString()}`,
  );

  if (!Array.isArray(response.suggestions)) {
    throw toInvalidAiResponseError(
      "getLatestAiSuggestion response.suggestions is not an array.",
    );
  }

  if (response.suggestions[0] && !isApiAiSuggestion(response.suggestions[0])) {
    throw toInvalidAiResponseError(
      "getLatestAiSuggestion response contains an invalid AI suggestion entry.",
    );
  }

  return response.suggestions[0]
    ? toAiSuggestion(response.suggestions[0])
    : null;
};

export const getLatestHomeSummaryAiSuggestion =
  async (): Promise<AiSuggestion | null> => {
    return getLatestAiSuggestion("home_summary");
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
