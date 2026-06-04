import { Hono } from "hono";

const app = new Hono();

// GET /api/items (化粧品マスタ検索)
app.get("/", (c) => {
  return c.json({ message: "化粧品マスタ検索" });
});

export default app;
