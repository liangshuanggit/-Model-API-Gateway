import express from "express";
import openaiRouter from "./routes/openai.js";
import modelsRouter from "./routes/models.js";

const app = express();

app.use(express.json());
app.use(openaiRouter);
app.use(modelsRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(3000, () => {
  console.log("Model API Gateway listening on :3000");
});
