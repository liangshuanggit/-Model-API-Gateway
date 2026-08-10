import { getRedis } from './redis.js';

export async function checkRateLimit(key, limit=60){
  const redis = getRedis();
  const name = `rate:${key}`;

  const count = await redis.incr(name);

  if(count === 1){
    await redis.expire(name,60);
  }

  return count <= limit;
}
