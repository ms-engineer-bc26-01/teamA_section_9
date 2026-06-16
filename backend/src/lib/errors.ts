import type { Context } from "hono";

/**
 * エラーレスポンスを統一形式 { error, message } で返す共通関数。
 * error にはコード(大文字)、message には人間向けの説明を入れる。
 */
export function errorResponse(
  c: Context,
  status: number,
  error: string,
  message: string
) {
  return c.json({ error, message }, status as 400 | 401 | 404 | 409 | 500);
}

/** 401 認証エラー */
export function unauthorized(c: Context, message = "トークンが無効です") {
  return errorResponse(c, 401, "UNAUTHORIZED", message);
}

/** 400 リクエスト不正 */
export function badRequest(c: Context, message: string) {
  return errorResponse(c, 400, "BAD_REQUEST", message);
}

/** 404 リソースが存在しない */
export function notFound(c: Context, message: string) {
  return errorResponse(c, 404, "NOT_FOUND", message);
}

/** 409 重複・競合 */
export function conflict(c: Context, error: string, message: string) {
  return errorResponse(c, 409, error, message);
}

/** 500 サーバー内部エラー */
export function internalError(c: Context, message = "サーバーエラーが発生しました") {
  return errorResponse(c, 500, "INTERNAL_SERVER_ERROR", message);
}
