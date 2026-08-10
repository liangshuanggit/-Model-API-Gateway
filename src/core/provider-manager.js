import { DeepSeekWebClient } from '../providers/deepseek-web.js';
import { OpenAIProvider } from '../providers/openai.js';
import models from '../../config/models.json' assert { type:'json' };

export function getProvider(model){
  const config=models[model];
  if(!config) throw new Error(`Unknown model: ${model}`);

  if(config.provider==='deepseek-web'){
    return new DeepSeekWebClient(config);
  }

  if(config.provider==='openai'){
    return new OpenAIProvider(config);
  }

  throw new Error('Provider not implemented');
}
