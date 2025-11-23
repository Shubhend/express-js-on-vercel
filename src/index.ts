import express from "express";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
app.use(express.json());

// -----------------------------
// MONGO CONNECTION (Single File)
// -----------------------------
const MONGO_URI = process.env.MONGODB_URI;  // Add in Vercel env
const DB_NAME = "mydb";                     // Change if needed

let db;
let client;

async function connectDB() {
  if (db) return db; // reuse connection (important for Vercel)
  
  client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("MongoDB connected");
  return db;
}

// -----------------------------
// CRUD API (Queries in Body)
// -----------------------------

// CREATE (Insert)
app.post("/insert", async (req, res) => {
  try {
    const { collection, data } = req.body;
    const db = await connectDB();
    const result = await db.collection(collection).insertOne(data);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ (Get records)
app.post("/get", async (req, res) => {
  try {
    const { collection, query = {}, limit = 100 } = req.body;
    const db = await connectDB();
    const result = await db.collection(collection).find(query).limit(limit).toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE (Update records)
app.post("/update", async (req, res) => {
  try {
    const { collection, query, update } = req.body;
    const db = await connectDB();
    const result = await db.collection(collection).updateMany(query, { $set: update });
    res.json({ matched: result.matchedCount, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (Remove records)
app.post("/delete", async (req, res) => {
  try {
    const { collection, query } = req.body;
    const db = await connectDB();
    const result = await db.collection(collection).deleteMany(query);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

export default app;
