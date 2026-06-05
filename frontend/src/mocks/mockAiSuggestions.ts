import type { AiSuggestion } from "@/types/models";

export const mockAiSuggestions: AiSuggestion[] = [
  {
    id: "ai-suggestion-001",
    userId: "firebase_uid_mock_001",
    suggestedAt: "2026-05-17T21:05:00+09:00",
    suggestionType: "home_summary",
    title: "今日は「引き算」推奨日です",
    body: "直近1週間は水分バランスが比較的安定しています。一方で、生理前かつ睡眠時間が短い日は肌スコアが下がりやすい傾向があります。今日は美容液や重いクリームを重ねすぎず、保湿を中心にしたシンプルなケアがおすすめです。",
    basis:
      "睡眠不足やホルモンバランスの変化は、皮脂分泌やバリア機能に影響する可能性があります。",
    createdAt: "2026-05-17T21:05:00+09:00",
  },
  {
    id: "ai-suggestion-002",
    userId: "firebase_uid_mock_001",
    suggestedAt: "2026-05-17T21:10:00+09:00",
    suggestionType: "daily_comment",
    title: "今日の記録コメント",
    body: "今日は乾燥感と赤みがあるため、攻めのケアよりも刺激を抑えた保湿重視のケアが向いています。レチノールは頻度を調整し、肌の様子を見ながら使いましょう。",
    basis:
      "乾燥や赤みがある日は、角層バリアが不安定な可能性があるため、刺激性のある成分を控える判断が安全です。",
    createdAt: "2026-05-17T21:10:00+09:00",
  },
];
