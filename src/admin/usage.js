import express from "express";

const router = express.Router();

const usage = [];

router.get("/usage", (req, res) => {
  res.json({ data: usage });
});

router.post("/usage", (req, res) => {
  const record = {
    key: req.body.key,
    model: req.body.model,
    tokens: req.body.tokens || 0,
    created_at: new Date().toISOString()
  };

  usage.push(record);
  res.json(record);
});

export default router;
