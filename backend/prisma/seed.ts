import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

// backend ディレクトリで実行する前提(prisma db seed / tsx prisma/seed.ts どちらも cwd=backend)
const TSV_PATH = join(process.cwd(), "prisma", "seed-data", "master.tsv");

// Googleシートを「タブ区切り(.tsv)」でDLした想定。列の並び:
//   A:ブランド B:商品名 C:カテゴリ D:役割 E:主要成分 F:成分コード | G:コード H:成分名 I:グループ名
const COL = {
  brand: 0,
  name: 1,
  category: 2,
  itemCodes: 5, // F: "1, 2, 3"
  ingCode: 6, // G
  ingName: 7, // H
  ingGroup: 8, // I
} as const;

function parseTsv(text: string): string[][] {
  return text
    .replace(/^\uFEFF/, "") // BOM除去
    .replace(/\r/g, "") // Windows改行のCRを除去
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => line.split("\t"));
}

function cell(row: string[], idx: number): string {
  return (row[idx] ?? "").trim();
}

async function main() {
  if (!existsSync(TSV_PATH)) {
    throw new Error(
      `TSVが見つかりません: ${TSV_PATH}\n` +
        `・backend ディレクトリで実行しているか\n` +
        `・master.tsv を backend/prisma/seed-data/ に置いたか\n` +
        `を確認してください`
    );
  }

  const rows = parseTsv(readFileSync(TSV_PATH, "utf-8"));
  const dataRows = rows.slice(1); // ヘッダ行を落とす

  // 区切り間違い(CSVをDLした等)の早期検知
  if (dataRows.length && dataRows[0].length < 6) {
    throw new Error(
      "列が足りません。Googleシートを「タブ区切り(.tsv)」でダウンロードしたか確認してください(CSVだと区切りが違います)"
    );
  }

  // --- 既存データ削除(FK依存の逆順) ---
  await prisma.ai_suggestions.deleteMany();
  await prisma.log_used_items.deleteMany();
  await prisma.daily_logs.deleteMany();
  await prisma.menstruation_periods.deleteMany();
  await prisma.user_items.deleteMany();
  await prisma.items.deleteMany();
  await prisma.profiles.deleteMany();
  await prisma.ingredients.deleteMany();
  await prisma.categories.deleteMany();

  // --- 1. 成分(G/H/I):コード→生成uuid の対応表を作る ---
  const codeToId = new Map<string, string>();
  for (const r of dataRows) {
    const code = cell(r, COL.ingCode);
    if (!code) continue; // 成分ブロックはitemsより行数が少ないのでここで自然に終わる
    const name = cell(r, COL.ingName);
    const group = cell(r, COL.ingGroup);
    const ing = await prisma.ingredients.create({
      data: { name, group_name: group || null },
    });
    codeToId.set(code, ing.id);
  }

  // --- 2. カテゴリ(C):実データに出てくるものを初出順に作成 ---
  const categoryToId = new Map<string, string>();
  for (const r of dataRows) {
    const cat = cell(r, COL.category);
    if (!cat || categoryToId.has(cat)) continue;
    const c = await prisma.categories.create({ data: { name: cat } });
    categoryToId.set(cat, c.id);
  }

  // --- 3. items(A/B/C/F):成分コードをuuid配列に変換して投入 ---
  let itemCount = 0;
  for (const r of dataRows) {
    const brand = cell(r, COL.brand);
    const name = cell(r, COL.name);
    if (!brand || !name) continue; // 空行・成分専用行はスキップ

    const cat = cell(r, COL.category);
    const categories_id = categoryToId.get(cat);
    if (!categories_id) {
      throw new Error(`未知のカテゴリ "${cat}"(商品: ${name})`);
    }

    const ingredients_ids = cell(r, COL.itemCodes)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((code) => {
        const id = codeToId.get(code);
        if (!id) {
          throw new Error(`未知の成分コード "${code}"(商品: ${name})`);
        }
        return id;
      });

    await prisma.items.create({
      data: { brand, name, categories_id, ingredients_ids },
    });
    itemCount++;
  }

  console.log(
    `✅ Seed 完了: categories ${categoryToId.size}件 / ingredients ${codeToId.size}件 / items ${itemCount}件`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed 失敗:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
