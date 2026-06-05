export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
};
