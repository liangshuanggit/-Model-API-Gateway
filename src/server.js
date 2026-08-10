import express from "express";
import openaiRouter from "./routes/openai.js";

const app = express();

app.use(express.json());
app.use(openaiRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Model API Gateway listening on :3000");
});
