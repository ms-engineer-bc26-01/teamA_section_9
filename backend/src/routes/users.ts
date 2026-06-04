import { Hono } from "hono";

const app = new Hono();

// GET /api/users/me (プロフィール取得)
app.get("/me", (c) => {
  return c.json({ message: "自分のプロフィール取得" });
});

// PATCH /api/users/me (プロフィール編集)
app.patch("/me", (c) => {
  return c.json({ message: "プロフィール編集" });
});

export default app;
