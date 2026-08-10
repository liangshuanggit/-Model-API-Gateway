import express from "express";

const router = express.Router();

const users = [];

router.get("/users", (req, res) => {
  res.json({ data: users });
});

router.post("/users", (req, res) => {
  const user = {
    id: Date.now().toString(),
    name: req.body.name || "anonymous",
    created_at: new Date().toISOString()
  };

  users.push(user);
  res.json(user);
});

export default router;
