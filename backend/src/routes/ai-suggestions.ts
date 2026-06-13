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
  // 日本時間の正しい日付をtodayに入れる
  const nowJst = new Date();
  const realToday = `${nowJst.getFullYear()}-${String(nowJst.getMonth() + 1).padStart(2, "0")}-${String(nowJst.getDate()).padStart(2, "0")}`;
  const today = realToday;
  let startDate: string;
  let endDate: string;
  if (suggestionType === "daily_comment") {
    startDate = endDate = body.target_date ?? today;
  } else {
    // 総評コメント（home_summary）は、常に「今日」から7日間とする
    endDate = today;
    startDate =
      body.start_date ??
      new Date(new Date(endDate).getTime() - 6 * 86400000)
        .toISOString()
        .slice(0, 10);
  }

  const logs = await prisma.daily_logs.findMany({
    where: {
      user_id: userId,
      OR: [
        // 1. 指定された分析期間のログ
        { log_date: { gte: new Date(startDate), lte: new Date(endDate) } },
        // 2. 「今日」のログを取得する
        { log_date: new Date(realToday) },
      ],
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
        .map((l) => {
          // 世界標準時(UTC)から日本時間(JST)に変更
          const yyyy = l.log_date.getFullYear();
          const mm = String(l.log_date.getMonth() + 1).padStart(2, "0");
          const dd = String(l.log_date.getDate()).padStart(2, "0");
          const pureDateStr = `${yyyy}-${mm}-${dd}`;

          return `- ${pureDateStr}: 肌調子${l.skin_condition}/3, 天気=${l.weather ?? "-"}, 睡眠=${l.sleep_level ?? "-"}, 食事=${l.meal_balance ?? "-"}, 生理=${l.isMenstruation ? "あり" : "なし"}, メモ=${l.free_note ?? "-"}`;
        })
        .join("\n")
    : "（対象期間の記録なし）";

  // --- 第2幕: プロンプト組み立て ---
  const systemPrompt = `あなたは皮膚科専門医のキャラクターとして、スキンケアアプリのユーザーにアドバイスをします。
ルール:
- 医療診断や治療の指示はしない。効果効能の断定表現（治る・必ず改善する等）は使わない
- ユーザーの手持ちアイテムの中からの提案に限定する（新しい商品を勧めない）
- 提案には必ず理由（記録や成分に基づく根拠）を含める
- 「3/3」や「1/3」のような、システムの数値をそのまま出した機械的な表記は【絶対に禁止】とします。
- データベースから渡される肌状態の数値（skin_condition: 1〜3）は、ユーザーが直感的に理解でき、かつ共感できる優しい言葉や絵文字に必ず翻訳してメッセージ（body）を作成してください。
- 成分名を根拠にする場合は、必ず【手持ちアイテム】に含まれる主成分だけを使う

【最重要：タイトル（title）の絶対ルール】
- タイトル（title）は、過去の古いデータや、新しく更新された過去の日付の数値に影響されてはいけません。必ず【今日（${today}）】という日付の肌状態（skin_condition）の数値「だけ」を基準にして決定してください。
- もし今日（${today}）の肌状態が「3」であれば、数日前のデータがどれだけ悪くても、タイトルは100%確実に「3」のガイドライン（絶好調・調子が戻ってきた）に従わなければなりません。過去の数値でタイトルを作ることは【厳禁】です。
- 複数日のログ（過去7日間など）を分析する場合、過去の古いデータに引きずられすぎず、【今日（${today}）の肌状態】を重視して、タイトル（title）と本文（body）の冒頭を作成してください。

[肌状態別の表現ガイドライン（title と body 共通）]
  - 今日が「3」の場合（例え数日前が1でも）：
    ・title：「お肌のごきげん絶好調です！」「調子が戻ってきましたね！」など、100%前向きで嬉しくなる短い見出しにする。
    ・body：冒頭で、今日の回復や良さを全力で一緒に喜ぶトーンにする。数日前の不調に触れる場合は「ここ数日のデリケートな時期を乗り越えて、グッと調子が上がってきましたね！」のように、前向きな回復期として表現してください。
  - 今日が「2」の場合：
    ・title：「お肌は安定キープです」「落ち着いた状態です」など、安心感を与える見出しにする。
    ・body：「今日のお肌は落ち着いていますね」など、安定した状態を褒める表現にする。
  - 今日が「1」の場合：
    ・title：「デリケートな肌状態です」「無理せずケアしましょう」など、寄り添う見出しにする。
    ・body：「今日はお肌が少しデリケートな状態ですね」など、優しく労り、寄り添うトーンにする。

【おすすめセット（basis）の出力ルール】
- suggestion_type が「daily_comment」の場合、必ず "basis": null と出力してください。
- suggestion_type が「home_summary」の場合のみ、basis に手持ちアイテム2つの組み合わせを出力してください。
- basis は必ず「商品名A × 商品名B」の形式、または null にしてください。
- basis に使う商品名は、必ず【手持ちアイテム】に存在する表記をそのまま使ってください。
- body には具体的な商品名やおすすめセットを書かないでください。
- 出力は必ず次のJSON形式のみ: {"title": "短い見出し", "body": "提案本文(200字以内)", "basis": "商品名A × 商品名B (またはnull)"}
- JSON以外の文字（前置きやコードブロック記号）は一切出力しない`;

  const userPrompt =
    suggestionType === "daily_comment"
      ? `今日(${endDate})の記録に対する短いコメントを作ってください。
      【最重要：出力形式のルール】 - 具体的な商品の提案は不要です。今回はお肌のレビューと労いのコメントに集中してください。
      \n\n【ユーザー】肌タイプ: ${profile?.skin_type ?? "不明"}\n【今日の記録】\n${logsText}\n【手持ちアイテム】\n${itemsText}`
      : `直近(${startDate}〜${endDate})の記録の傾向（肌調子や生理周期）を分析し、ユーザーの肌に寄り添った今日のケア方針を提案してください。
【最重要：役割分担と出力形式のルール】
1. 「body」（提案本文）のルール：
- 過去7日間の肌調子の変化や生活習慣、生理周期（ゆらぎ期など）に基づいたアドバイスを200文字以内で書いてください。
- body には、具体的な商品名や「商品A × 商品B」のようなおすすめセットは絶対に書かないでください。
- body には、肌状態に対するコメント、生活ログから読み取れる傾向、今日意識したいケア方針、注目したい成分名のみを書いてください。
- body に書く注目成分は、必ず【手持ちアイテム】に含まれる主成分の中から選んでください。
- 手持ちアイテムに存在しない成分を、body や basis の理由として使わないでください。
- body で挙げた注目成分やケア方針と、basis に出すおすすめセットの理由が矛盾しないようにしてください。

2. 「basis」（おすすめセット）のルール：
- basis は必ず【手持ちアイテム】全体の中から選んでください。一部のアイテムだけを見て選んではいけません。
- basis には説明文を入れないでください。

【選び方の手順】
1. まず、今日の記録と直近7日間の傾向から、今回のケア目的を1つ決めてください。
   例：保湿重視、ゆらぎケア、肌荒れ予防、皮脂バランス、透明感ケア、低刺激ケア、調子維持
2. 次に、【手持ちアイテム】全体から、そのケア目的に合う商品候補を複数考えてください。
3. その中から、body の注目成分やケア方針と矛盾しない2商品を選んで basis に出力してください。
4. ただし、毎回「最も無難な保湿セット」だけに固定しないでください。
   今日の記録に乾燥・睡眠不足・生理・肌荒れ・皮脂・メモ内容などの変化がある場合は、その変化を優先してケア目的を変え、それに合う別の組み合わせも検討してください。
5. 肌状態や生活ログの傾向が前回とほぼ同じ場合は、同じ組み合わせを継続しても構いません。
6. 同じ組み合わせを選ぶ場合は、「今日の記録でも同じケア目的が最も合う」と判断できる場合だけにしてください。
7. 保湿が必要な場合でも、ヒアルロン酸を自動的に第一候補にしないでください。乾燥が明確に記録されていない場合は、セラミド、グリセリン、ナイアシンアミド、アミノ酸系成分、肌荒れ防止系成分など、手持ちアイテムに含まれる他の成分も同等に評価してください。

- basis に使う商品名は、必ず【手持ちアイテム】に存在する商品名だけにしてください。
- ブランド名と商品名は、【手持ちアイテム】に書かれている表記をそのまま使ってください。
      \n\n【ユーザー】肌タイプ: ${profile?.skin_type ?? "不明"}\n【期間の記録】\n${logsText}\n【手持ちアイテム】\n${itemsText}`;

  // --- 第3幕: OpenAI呼び出し ---
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.82, // AIの回答の固定化を防ぎ、手持ちアイテムの提案に多様性を持たせるため高めに設定
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
