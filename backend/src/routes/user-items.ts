import { Hono } from "hono";

const app = new Hono();

// GET /api/user_items (手持ち一覧)
app.get("/", (c) => {
  return c.json({ message: "手持ちアイテム一覧取得" });
});

// POST /api/user_items (手持ち追加)
app.post("/", (c) => {
  return c.json({ message: "手持ちアイテムに追加" }, 201);
});

export default app;
