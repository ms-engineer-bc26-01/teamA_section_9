import { Hono } from "hono";
import OpenAI from "openai";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";

const app = new Hono();

// OPENAI_API_KEY は環境変数から自動で読み込まれる(S2-05)
const openai = new OpenAI();

// GET /api/ai_suggestions (履歴取得)
app.get("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  const suggestionType = c.req.query("suggestion_type");
  const sort = c.req.query("sort") === "asc" ? "asc" : "desc";
  const limit = Number(c.req.query("limit") ?? 20);
  const offset = Number(c.req.query("offset") ?? 0);

  const where = {
    user_id: userId,
    ...(suggestionType ? { suggestion_type: suggestionType } : {}),
  };

  const [suggestions, total] = await Promise.all([
    prisma.ai_suggestions.findMany({
      where,
      orderBy: { suggested_at: sort },
      take: limit,
      skip: offset,
    }),
    prisma.ai_suggestions.count({ where }),
  ]);

  return c.json({ suggestions, total });
});

// POST /api/ai_suggestions (提案生成)
app.post("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return c.json({ error: "Unauthorized: トークンが無効です" }, 401);
  }

  const body = await c.req.json();
  const suggestionType = body.suggestion_type;

  if (!["home_summary", "daily_comment"].includes(suggestionType)) {
    return c.json(
      {
        error: "BAD_REQUEST",
        message:
          "suggestion_type は home_summary か daily_comment を指定してください",
      },
      400,
    );
  }

  // --- 第1幕: 材料集め ---
  const profile = await prisma.profiles.findUnique({ where: { id: userId } });

  // 対象期間: daily_comment は1日 / home_summary は直近7日(指定があればそれ)
  const today = new Date().toISOString().slice(0, 10);
  let startDate: string;
  let endDate: string;
  if (suggestionType === "daily_comment") {
    startDate = endDate = body.target_date ?? today;
  } else {
    endDate = body.end_date ?? today;
    startDate =
      body.start_date ??
      new Date(new Date(endDate).getTime() - 6 * 86400000)
        .toISOString()
        .slice(0, 10);
  }

  const logs = await prisma.daily_logs.findMany({
    where: {
      user_id: userId,
      log_date: { gte: new Date(startDate), lte: new Date(endDate) },
    },
    orderBy: { log_date: "asc" },
  });

  // 手持ちアイテム+成分名
  const userItems = await prisma.user_items.findMany({
    where: { user_id: userId },
    include: { item: true },
  });
  const allIngredientIds = [
    ...new Set(userItems.flatMap((ui) => ui.item.ingredients_ids)),
  ];
  const ingredients = await prisma.ingredients.findMany({
    where: { id: { in: allIngredientIds } },
  });
  const ingredientNameById = new Map(ingredients.map((i) => [i.id, i.name]));

  const itemsText = userItems
    .map((ui) => {
      const names = ui.item.ingredients_ids
        .map((id) => ingredientNameById.get(id))
        .filter(Boolean)
        .join("、");
      return `- ${ui.item.brand} ${ui.item.name}（主な成分: ${names || "不明"}）`;
    })
    .join("\n");

  const logsText = logs.length
    ? logs
        .map(
          (l) =>
            `- ${l.log_date.toISOString().slice(0, 10)}: 肌調子${l.skin_condition}/3, 天気=${l.weather ?? "-"}, 睡眠=${l.sleep_level ?? "-"}, 食事=${l.meal_balance ?? "-"}, 生理=${l.isMenstruation ? "あり" : "なし"}, メモ=${l.free_note ?? "-"}`,
        )
        .join("\n")
    : "（対象期間の記録なし）";

  // --- 第2幕: プロンプト組み立て ---
  const systemPrompt = `あなたは皮膚科専門医のキャラクターとして、スキンケアアプリのユーザーにアドバイスをします。
ルール:
- 医療診断や治療の指示はしない。効果効能の断定表現（治る・必ず改善する等）は使わない
- ユーザーの手持ちアイテムの中からの提案に限定する（新しい商品を勧めない）
- 提案には必ず理由（記録や成分に基づく根拠）を含める
- 「basis」には、現在の肌状態（過去7日間の傾向や生理周期）に合わせて、一緒に使うと相乗効果が期待できる手持ちアイテムを2つ選び、必ず「商品名A ✖️ 商品名B」という形式のみで出力してください。
- 該当する掛け合わせがない場合や、アイテムが足りない場合は null にしてください。
- 出力は必ず次のJSON形式のみ: {"title": "短い見出し", "body": "提案本文(200字以内)", "basis": "商品名A ✖️ 商品名B (またはnull)"}
- JSON以外の文字（前置きやコードブロック記号）は一切出力しない`;

  const userPrompt =
    suggestionType === "daily_comment"
      ? `今日(${endDate})の記録に対する短いコメントを作ってください。\n\n【ユーザー】肌タイプ: ${profile?.skin_type ?? "不明"}\n【今日の記録】\n${logsText}\n【手持ちアイテム】\n${itemsText}`
      : `直近(${startDate}〜${endDate})の記録の傾向（肌調子や生理周期）を分析し、ユーザーの肌に寄り添った今日のケア方針を提案してください。
⚠️【最重要：役割分担と出力形式のルール】

1. 「body」（提案本文）のルール：
- 過去7日間の肌調子の変化や生活習慣、生理周期（ゆらぎ期など）に基づいたアドバイスを200文字以内で書いてください。
- 【重要】「このアイテムとこのアイテムを掛け合わせて使おう」といった具体的な掛け合わせの説明や、一緒に使うことの解説は「body」の中には絶対に書かないでください。（bodyは純粋な肌の分析とケアの心構えに集中させるため）

2. 「basis」のルール：
- 現在の肌状態に対して、一緒に使うと相乗効果が期待できる手持ちアイテムを2つ厳選し、以下の形式【のみ】で出力してください。余計な説明文は一切含めないでください。
  "basis": "商品名A ✖️ 商品名B"
- 該当する組み合わせがない場合は、"basis": null としてください。
      \n\n【ユーザー】肌タイプ: ${profile?.skin_type ?? "不明"}\n【期間の記録】\n${logsText}\n【手持ちアイテム】\n${itemsText}`;

  // --- 第3幕: OpenAI呼び出し ---
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0].message.content ?? "{}";
  const parsed = JSON.parse(raw);

  // --- 第4幕: 保存して返却 ---
  const suggestion = await prisma.ai_suggestions.create({
    data: {
      user_id: userId,
      suggested_at: new Date(),
      suggestion_type: suggestionType,
      title: parsed.title ?? "今日のスキンケア提案",
      body: parsed.body ?? null,
      basis: parsed.basis ?? null,
    },
  });

  return c.json(suggestion, 201);
});

export default app;
