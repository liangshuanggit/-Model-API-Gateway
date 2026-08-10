import { createClient } from 'redis';

let client;

export async function getRedis(){
  if(client) return client;

  client=createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  client.on('error',(err)=>{
    console.error('redis error',err.message);
  });

  await client.connect();

  return client;
}

export async function cacheSet(key,value,ttl=300){
  const redis=await getRedis();
  await redis.set(key,JSON.stringify(value),{EX:ttl});
}

export async function cacheGet(key){
  const redis=await getRedis();
  const value=await redis.get(key);
  return value ? JSON.parse(value):null;
}
