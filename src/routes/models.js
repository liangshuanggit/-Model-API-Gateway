import express from "express";
import {openAIModels} from "../services/model-registry.js";

const router=express.Router();

router.get("/v1/models",(_,res)=>{
  res.json({
    object:"list",
    data:openAIModels()
  });
});

export default router;
