import { writeSSE, endSSE } from '../core/sse.js';

export async function streamOpenAI(res, iterator, model='deepseek-chat') {
  res.setHeader('Content-Type','text/event-stream');
  res.setHeader('Cache-Control','no-cache');
  res.setHeader('Connection','keep-alive');

  for await (const chunk of iterator) {
    writeSSE(res, {
      id: 'chatcmpl-' + Date.now(),
      object: 'chat.completion.chunk',
      created: Math.floor(Date.now()/1000),
      model,
      choices:[{
        index:0,
        delta:{content:chunk},
        finish_reason:null
      }]
    });
  }

  endSSE(res);
}
