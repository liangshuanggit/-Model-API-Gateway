import express from "express";
import openaiRouter from "./routes/openai.js";
import modelsRouter from "./routes/models.js";
import { connectRedis, disconnectRedis, redisEnabled } from "./core/redis-client.js";
import { requestId, openAIAuth, cors } from "./middleware/openai-compat.js";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(requestId);
app.use(cors);
app.use(express.json());
app.use(openAIAuth);
app.use(openaiRouter);
app.use(modelsRouter);

app.get("/health", (_, res) => {
  res.json({ status: "ok", conversation_store: (process.env.CONVERSATION_STORE || "memory").toLowerCase(), redis: redisEnabled ? "connected" : "disabled" });
});

async function start() {
  if (redisEnabled) await connectRedis();
  const server = app.listen(port, () => console.log(`Model API Gateway listening on :${port}`));
  const shutdown = async (signal) => {
    console.log(`${signal}: shutting down`);
    server.close(async () => { await disconnectRedis(); process.exit(0); });
  };
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((error) => { console.error("Failed to start server:", error); process.exit(1); });
