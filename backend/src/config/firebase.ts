import admin from "firebase-admin";
import * as path from "path";

// 秘密鍵の絶対パス作成
// 実行環境（Dockerコンテナ内）のルート直下にあるファイルを指す
const serviceAccountPath = path.resolve(
  process.cwd(),
  "firebase-service-account.json",
);

// 二重に初期化されるのを防ぎつつ、Firebase Adminを起動する
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
  console.log("🔥 Firebase Admin SDK の初期化に成功しました！");
}

// トークン検証に使うためauth機能エクスポート
export const adminAuth = admin.auth();
