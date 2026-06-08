import type { Context } from "hono";
import { adminAuth } from "../config/firebase.js";

/**
 * Authorizationヘッダーの Firebase IDトークンを検証してUIDを返す。
 * トークンが無い・不正な場合は null を返す（呼び出し側で401を返す想定）。
 */
export async function getFirebaseUid(c: Context): Promise<string | null> {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    return decoded.uid;
  } catch (error) {
    console.error("認証エラー:", error);
    return null;
  }
}
