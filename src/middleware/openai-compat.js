import { randomUUID } from "node:crypto";

export function requestId(req, res, next) {
  const id = req.get("x-request-id") || `req_${randomUUID()}`;
  req.requestId = id;
  res.setHeader("x-request-id", id);
  next();
}

export function openAIAuth(req, res, next) {
  const configured = process.env.OPENAI_API_KEY;
  if (!configured) return next();
  const [scheme, token] = (req.get("authorization") || "").split(/\s+/);
  if (scheme?.toLowerCase() === "bearer" && token === configured) return next();
  return res.status(401).json({ error: { message: "Invalid API key", type: "invalid_request_error", param: null, code: "invalid_api_key" } });
}

export function cors(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Request-Id, X-Conversation-Id, X-Session-Id");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(204).end();
  next();
}
