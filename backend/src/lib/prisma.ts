import { PrismaClient } from "@prisma/client";

// アプリ全体で1つのPrismaClientを共有する
// (ファイルごとに new すると、DB接続が無駄に増えるため)
export const prisma = new PrismaClient();
