import express from "express";
import crypto from "crypto";

const router = express.Router();
const keys = [];

router.post("/keys/create", (req, res) => {
  const key = "gw-" + crypto.randomBytes(24).toString("hex");

  const item = {
    id: Date.now().toString(),
    key,
    user_id: req.body.user_id || null,
    created_at: new Date().toISOString()
  };

  keys.push(item);
  res.json(item);
});

router.get("/keys", (req, res) => {
  res.json({ data: keys });
});

export default router;
