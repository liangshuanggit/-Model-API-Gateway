import models from '../../config/models.json' with { type: 'json' };
import { DeepSeekWebClient } from '../providers/deepseek-web.js';

const providers = {
  'deepseek-web': new DeepSeekWebClient({
    token: process.env.DEEPSEEK_TOKEN
  })
};

export function getProvider(model){
  const config = models[model];

  if(!config){
    throw new Error(`Unsupported model: ${model}`);
  }

  const provider = providers[config.provider];

  if(!provider){
    throw new Error(`Provider unavailable: ${config.provider}`);
  }

  return provider;
}
