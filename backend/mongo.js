const { MongoClient } = require('mongodb');
require('dotenv').config();

let client;
let db;

async function connectMongo() {
  if (db) return db;
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/bhangbhosdha';
  client = new MongoClient(uri, {
    maxPoolSize: 50,
  });
  await client.connect();
  db = client.db();
  
  // Create indexes
  await db.collection('posts').createIndex({ createdAt: -1 });
  await db.collection('posts').createIndex({ content: 'text', authorName: 'text', authorHandle: 'text' });
  await db.collection('users').createIndex({ userId: 1 }, { unique: true });
  await db.collection('users').createIndex({ handle: 1 }, { unique: true, sparse: true });
  await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
  await db.collection('notifications').createIndex({ userId: 1, read: 1 });
  
  console.log('Connected to MongoDB');
  return db;
}

module.exports = { connectMongo };
