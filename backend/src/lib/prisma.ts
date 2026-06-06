import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

// ローカル開発時のホットリロード（自動更新）対策
// (再読み込みのたびに新しいDB接続が増えるのを防ぐ)
export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
globalThis.prismaGlobal = prisma;
