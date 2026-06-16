import { Hono } from "hono";
import OpenAI from "openai";
import { prisma } from "../lib/prisma.js";
import { getFirebaseUid } from "../lib/auth.js";
import { unauthorized, badRequest } from "../lib/errors.js";

const app = new Hono();

// OPENAI_API_KEY は環境変数から自動で読み込まれる(S2-05)
const openai = new OpenAI();

// GET /api/ai_suggestions (履歴取得)
app.get("/", async (c) => {
  const userId = await getFirebaseUid(c);
  if (!userId) {
    return unauthorized(c);
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
    return unauthorized(c);
  }

  const body = await c.req.json();
  const suggestionType = body.suggestion_type;

  if (!["home_summary", "daily_comment"].includes(suggestionType)) {
    return badRequest(c, "suggestion_type は home_summary か daily_comment を指定してください");
  }

  // --- 第1幕: 材料集め ---
  const profile = await prisma.profiles.findUnique({ where: { id: userId } });

  // 対象期間: daily_comment は1日 / home_summary は直近7日(指定があればそれ)
  // 日本時間の現在日時をベースに「今日の文字列」を作る
  const nowJst = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Tokyo" }),
  );
  const realToday = `${nowJst.getFullYear()}-${String(nowJst.getMonth() + 1).padStart(2, "0")}-${String(nowJst.getDate()).padStart(2, "0")}`;

  const today = realToday;

  let startDate: string;
  let endDate: string;

  if (suggestionType === "daily_comment") {
    startDate = endDate = body.target_date ?? realToday;
  } else {
    const start = new Date(nowJst);
    start.setDate(start.getDate() - 6); // 今日を含めて7日分遡る計算

    endDate = realToday;
    startDate = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  }

  const logs = await prisma.daily_logs.findMany({
    where: {
      user_id: userId,
      log_date: {
        gte: new Date(startDate), // startDateの0時0分0秒から
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)), // endDateの23時59分59秒まで
      },
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

  // 文字列化する前にstartDate以降のデータだけに絞り込む
  const filteredLogs = logs.filter((l) => {
    const dateStr = `${l.log_date.getFullYear()}-${String(l.log_date.getMonth() + 1).padStart(2, "0")}-${String(l.log_date.getDate()).padStart(2, "0")}`;
    return dateStr >= startDate; // 文字列比較で「startDate以降」のみ残す
  });

  const logsText = filteredLogs.length
    ? logs
        .map((l) => {
          // 世界標準時(UTC)から日本時間(JST)に変更
          const yyyy = l.log_date.getFullYear();
          const mm = String(l.log_date.getMonth() + 1).padStart(2, "0");
          const dd = String(l.log_date.getDate()).padStart(2, "0");
          const pureDateStr = `${yyyy}-${mm}-${dd}`;
          const conditionMap = { 1: "デリケート", 2: "安定", 3: "絶好調" };
          const conditionLabel =
            conditionMap[l.skin_condition as keyof typeof conditionMap] ??
            "不明";

          return `- ${pureDateStr}: 肌調子${conditionLabel}(数値:${l.skin_condition}), 天気=${l.weather ?? "-"}, 睡眠=${l.sleep_level ?? "-"}, 食事=${l.meal_balance ?? "-"}, 生理=${l.isMenstruation ? "あり" : "なし"}, メモ=${l.free_note ?? "-"}`;
        })
        .join("\n")
    : "（対象期間の記録なし）";

  console.log("AIに渡すログの全文:", logsText);

  // --- 第2幕: プロンプト組み立て ---
  const systemPrompt = `あなたは皮膚科専門医のキャラクターとして、スキンケアアプリのユーザーにアドバイスをします。今日は ${realToday} です。
ルール:
- 医療診断や治療の指示はしない。効果効能の断定表現（治る・必ず改善する等）は使わない
- ユーザーの手持ちアイテムの中からの提案に限定する（新しい商品を勧めない）
- 提案には必ず理由（記録や成分に基づく根拠）を含める
- 「3/3」や「1/3」のような、システムの数値をそのまま出した機械的な表記は【絶対に禁止】とします。
- データベースから渡される肌状態の数値（skin_condition: 1〜3）は、ユーザーが直感的に理解でき、かつ共感できる優しい言葉や絵文字に必ず翻訳してメッセージ（body）を作成してください。
- 成分名を根拠にする場合は、必ず【手持ちアイテム】に含まれる主成分だけを使う

【最重要：タイトル（title）の絶対ルール】
- タイトル（title）は、過去の古いデータや、新しく更新された過去の日付の数値に影響されてはいけません。必ず【今日（${realToday}）】という日付の肌状態（skin_condition）の数値「だけ」を基準にして決定してください。
- もし今日（${realToday}）の肌状態が「3」であれば、数日前のデータがどれだけ悪くても、タイトルは100%確実に「3」のガイドライン（絶好調・調子が戻ってきた）に従わなければなりません。過去の数値でタイトルを作ることは【厳禁】です。
- 複数日のログ（過去7日間など）を分析する場合、過去の古いデータに引きずられすぎず、【今日（${realToday}）の肌状態】を重視して、タイトル（title）と本文（body）の冒頭を作成してください。

[肌状態別の表現ガイドライン（title と body 共通）]
  - 今日が「3」の場合（例え数日前が1でも）：
    ・title：『今日は肌が輝いていますね！』『最高の肌コンディションです』などの100%前向きで嬉しくなるポジティブな見出しを生成してください。
    ・body：冒頭で、今日の回復や良さを全力で一緒に喜ぶトーンにする。数日前の不調に触れる場合は、前向きな回復期として表現してください。
  - 今日が「2」の場合：
    ・title：「お肌は安定キープです」「落ち着いた状態です」など、安心感を与える見出しを生成してください。
    ・body：「今日のお肌は落ち着いていますね」など、安定した状態を褒める表現にする。
  - 今日が「1」の場合：
    ・title：「デリケートな肌状態です」「無理せずケアしましょう」など、寄り添う見出しを生成してください。
    ・body：「今日はお肌が少しデリケートな状態ですね」など、優しく労り、寄り添うトーンにする。

【おすすめセット（basis）の出力ルール】
- suggestion_type が「daily_comment」の場合、必ず "basis": null と出力してください。このタイプで商品セットを出力することはプロンプト違反とみなします。
- suggestion_type が「home_summary」の場合のみ、basis に手持ちアイテム2つの組み合わせを出力してください。
- basis は "商品名A × 商品名B" という形式の文字列のみです。
- 【最重要：禁止事項】
  - basis の中に、成分名、効果、解説、理由、説明文、句読点、記号を一切含めてはなりません。
  - AIがセット選出に迷った場合でも、無理に解説を混ぜず "basis": null としてください。
  - basis は「どのアイテムか」を示すラベルとしてのみ機能させてください。
- 出力形式の絶対遵守:
  - 前置き、挨拶、マークダウンのコードブロック（\`\`\`json 等）は一切禁止です。
  - 以下のJSON文字列のみを出力してください:
    {"title": "短い見出し", "body": "提案本文(200字以内)", "basis": "商品名A × 商品名B (またはnull)"}`;

  const userPrompt =
    suggestionType === "daily_comment"
      ? `対象日(${endDate})の記録に対する短いコメントを作ってください。
      【最重要：タイトルと出力のルール】
        1. タイトル（title）は、systemPromptの「今日」ではなく、必ずこの【対象日（${endDate}）】の肌状態の数値に合わせて作成してください。
        2. 具体的な商品の提案は一切不要です。今回は対象日のお肌のレビューと労いのコメントに集中してください。
        3. 【重要】systemPromptのガイドラインにある「数日前の不調に触れる」などの過去の振り返りは【禁止】します。「ここ数日〜」といった表現は使わず、対象日（1日分）の記録（睡眠、天気、食事、生理、メモなど）だけをしっかり読み取り、その日の頑張りや状態に対する純粋な感想（レビュー）と労いのコメントを作成してください。
        4. 【絶対禁止事項】
           - 商品の具体的な提案や、特定の成分（セラミド、ビタミンCなど）を推奨するアドバイスは一切禁止です。
           - あくまでその日の頑張りへの労いや、状態に対する寄り添いと共感のみを行ってください。
           - 「今日のアドバイス」ではなく「今日のレビューと労い」を主目的とすること。
      \n\n【ユーザー】肌タイプ: ${profile?.skin_type ?? "不明"}\n【対象日の記録】\n${logsText}`
      : `直近(${startDate}〜${endDate})の記録の傾向（肌調子や生理周期）を分析し、ユーザーの肌に寄り添った今日のケア方針を提案してください。
        
        【重要な前提情報】
        【今日の日付】: ${realToday}
        【期間の記録】:
        ${logsText}
        (※もし上記ログに ${realToday} の記録が含まれていない場合は、『今日の肌状態は未記録である』と認識して判断してください）

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

【最重要：ケア目的の選定とアイテム選択のプロセス】
AIの学習バイアスである「迷ったらとりあえず保湿・ヒアルロン酸」という安全策を【厳禁】とします。必ず以下のステップで判定してください。
1. 【特記事項のキャッチ（最優先）】
   まず、今日のログ（生理、睡眠不足、肌調子1や2、天候、メモなど）に「乾燥」以外のネガティブ要素や変化がないか、目を皿にして確認してください。
   ・生理中やゆらぎ期 → 【抗炎症・鎮静ケア】【低刺激バリア】を強制的に最優先。
   ・睡眠不足や疲労 → 【肌荒れ予防（ナイアシンアミド等）】【ターンオーバー支援】を最優先。
   ・多湿や皮脂の懸念 → 【皮脂バランス】【さっぱり引き算ケア】を最優先。
2. 【成分ベースのアイテム選定】
   1で決めた「保湿以外の最優先テーマ」に直結する成分（セラミド、トラネキサム酸、CICA、アミノ酸など）を持つ手持ちアイテムを検索してください。
   ※ヒアルロン酸やグリセリンをメインとした「王道の保湿セット」は、ログに明確な「乾燥」のサインがある場合、または本当に肌が安定しきっている場合【のみ】選出を許可します。
3. 【多様性の強制（ガチャ要素）】
   「調子維持」や「保湿」が目的になる場合でも、毎回同じ組み合わせ（最も無難なセット）に逃げないでください。「今日はあえてテクスチャーを揃える」「今日はシンプルさを重視する」など、成分の合格点（70点以上）を満たす範囲で、必ず異なるアイテムの組み合わせを模索してください。
4. 【選定の裏付け】
   選んだ2つのアイテム（basis）は、必ず「body」で記述する注目成分やケア方針と完全にリンク（矛盾しない状態）させてください。

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
