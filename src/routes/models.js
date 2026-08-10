import express from "express";
import { openAIModels, openAIModel } from "../services/model-registry.js";

const router = express.Router();

router.get("/v1/models", (_, res) => {
  res.json({ object: "list", data: openAIModels() });
});

router.get("/v1/models/:model", (req, res) => {
  const model = openAIModel(req.params.model);
  if (!model) {
    return res.status(404).json({
      error: {
        message: `The model '${req.params.model}' does not exist`,
        type: "invalid_request_error",
        param: "model",
        code: "model_not_found"
      }
    });
  }
  return res.json(model);
});

export default router;
