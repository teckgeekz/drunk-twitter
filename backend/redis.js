const { createClient } = require('redis');
require('dotenv').config();

let client;

async function connectRedis() {
  if (client) return client;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  client = createClient({ url });
  
  client.on('error', (err) => console.error('Redis Client Error', err));
  
  await client.connect();
  console.log('Connected to Redis');
  
  return client;
}

module.exports = { connectRedis };
