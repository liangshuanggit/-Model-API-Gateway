import { DeepSeekWebClient } from '../providers/deepseek-web.js';

const providers = {
  'deepseek-chat': new DeepSeekWebClient({
    token: process.env.DEEPSEEK_TOKEN
  })
};

export function getProvider(model='deepseek-chat') {
  return providers[model] || providers['deepseek-chat'];
}
