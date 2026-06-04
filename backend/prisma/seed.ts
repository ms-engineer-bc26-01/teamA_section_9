import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 何度でも実行できるように、既存データをFKの逆順で削除
  await prisma.ai_suggestions.deleteMany();
  await prisma.log_used_items.deleteMany();
  await prisma.daily_logs.deleteMany();
  await prisma.menstruation_periods.deleteMany();
  await prisma.user_items.deleteMany();
  await prisma.items.deleteMany();
  await prisma.profiles.deleteMany();
  await prisma.ingredients.deleteMany();
  await prisma.categories.deleteMany();

  // 1. カテゴリ
  const toner = await prisma.categories.create({ data: { name: "化粧水" } });
  const serum = await prisma.categories.create({ data: { name: "美容液" } });
  const cream = await prisma.categories.create({ data: { name: "クリーム" } });
  await prisma.categories.create({ data: { name: "洗顔料" } });
  await prisma.categories.create({ data: { name: "日焼け止め" } });

  // 2. 成分
  const hyaluronic = await prisma.ingredients.create({ data: { name: "ヒアルロン酸" } });
  const niacinamide = await prisma.ingredients.create({ data: { name: "ナイアシンアミド" } });
  const retinol = await prisma.ingredients.create({ data: { name: "レチノール" } });
  const vitaminC = await prisma.ingredients.create({ data: { name: "ビタミンC" } });
  const ceramide = await prisma.ingredients.create({ data: { name: "セラミド" } });

  // 3. 化粧品アイテム（ingredients_ids は成分idの配列）
  const item1 = await prisma.items.create({
    data: {
      brand: "SkinMate",
      name: "モイスト化粧水",
      categories_id: toner.id,
      ingredients_ids: [hyaluronic.id, ceramide.id],
    },
  });
  const item2 = await prisma.items.create({
    data: {
      brand: "SkinMate",
      name: "ブライトニング美容液",
      categories_id: serum.id,
      ingredients_ids: [niacinamide.id, vitaminC.id],
    },
  });
  const item3 = await prisma.items.create({
    data: {
      brand: "SkinMate",
      name: "ナイトリペアクリーム",
      categories_id: cream.id,
      ingredients_ids: [retinol.id, ceramide.id],
    },
  });

  // 4. プロフィール（id は自分で指定：Firebase UID 相当の文字列）
  const user = await prisma.profiles.create({
    data: {
      id: "test-user-001",
      name: "テスト 花子",
      birth_day: new Date("1995-04-01"),
      skin_type: "dry",
    },
  });

  // 5. ユーザーの所有アイテム
  await prisma.user_items.createMany({
    data: [
      { user_id: user.id, item_id: item1.id },
      { user_id: user.id, item_id: item2.id },
    ],
  });

  // 6. 生理期間
  await prisma.menstruation_periods.create({
    data: {
      user_id: user.id,
      start_date: new Date("2026-05-20"),
      end_date: new Date("2026-05-25"),
    },
  });

  // 7. 日々の記録（skin_condition は 1〜3）
  const log1 = await prisma.daily_logs.create({
    data: {
      user_id: user.id,
      log_date: new Date("2026-06-01"),
      skin_condition: 2,
      weather: "sunny",
      sleep_level: "normal",
      meal_balance: "good",
      free_note: "調子はまずまず",
      isMenstruation: false,
    },
  });
  const log2 = await prisma.daily_logs.create({
    data: {
      user_id: user.id,
      log_date: new Date("2026-06-02"),
      skin_condition: 1,
      weather: "rainy",
      sleep_level: "short",
      meal_balance: "bad",
      free_note: "少し乾燥が気になる",
      isMenstruation: true,
    },
  });

  // 8. その記録で使ったアイテム（time_of_day: morning / night、items_ids は配列）
  await prisma.log_used_items.createMany({
    data: [
      { daily_log_id: log1.id, time_of_day: "morning", items_ids: [item1.id, item2.id], step_order: 1 },
      { daily_log_id: log1.id, time_of_day: "night", items_ids: [item1.id, item3.id], step_order: 1 },
      { daily_log_id: log2.id, time_of_day: "morning", items_ids: [item1.id], step_order: 1 },
    ],
  });

  // 9. AI提案（suggestion_type は仮の値。設計確定後に直す）
  await prisma.ai_suggestions.create({
    data: {
      user_id: user.id,
      suggested_at: new Date(),
      suggestion_type: "daily_tip",
      title: "今日のスキンケア提案",
      body: "乾燥が気になる日は、化粧水のあとにクリームで蓋をしましょう。",
      basis: "直近の記録で skin_condition が低めのため",
    },
  });

  console.log("✅ Seed 完了：テストデータを投入しました");
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
 