import { Hono } from "hono";

const app = new Hono();

// GET /api/daily_logs
app.get("/", (c) => {
  return c.json({ message: "肌記録一覧取得の実装" });
});

// POST /api/daily_logs
app.post("/", (c) => {
  return c.json({ message: "肌記録作成の実装" }, 201);
});

export default app;
