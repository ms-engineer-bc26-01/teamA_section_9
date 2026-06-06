import { Hono } from "hono";

const app = new Hono();

// GET /api/ai_suggestions (履歴取得)
app.get("/", (c) => {
  return c.json({ message: "AI提案履歴取得" });
});

// POST /api/ai_suggestions (提案生成)
app.post("/", (c) => {
  return c.json({ message: "AI提案生成" }, 201);
});

export default app;
