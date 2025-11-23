import express from "express";
import { MongoClient } from "mongodb";

console.log("🔥 Server starting... Loading Express + MongoDB API");

const app = express();
app.use(express.json());

// -----------------------------
// 🔥 MONGO CONNECTION (with logs)
// -----------------------------
const MONGO_URI = process.env.MONGODB_URI;
const DB_NAME = "mydb";

let db;
let client;

async function connectDB() {
  console.log("➡️ connectDB() called");

  if (db) {
    console.log("✔ Using existing MongoDB connection");
    return db;
  }

  console.log("🔗 Creating new MongoDB connection...");
  client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    db = client.db(DB_NAME);
    console.log("🎉 MongoDB connected successfully");
    return db;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    throw err;
  }
}

// -----------------------------
// CRUD API ROUTES (with logs)
// -----------------------------

// CREATE
app.post("/insert", async (req, res) => {
  console.log("📌 /insert hit");
  console.log("📥 Body:", req.body);

  try {
    const { collection, data } = req.body;
    console.log(`🗂 Collection: ${collection}`);
    console.log("📝 Data to insert:", data);

    const db = await connectDB();
    const result = await db.collection(collection).insertOne(data);

    console.log("✅ Insert successful:", result.insertedId);
    res.json({ insertedId: result.insertedId });

  } catch (err) {
    console.error("❌ Insert error:", err);
    res.status(500).json({ error: err.message });
  }
});

// READ
app.post("/get", async (req, res) => {
  console.log("📌 /get hit");
  console.log("📥 Body:", req.body);

  try {
    const { collection, query = {}, limit = 100 } = req.body;
    console.log(`🗂 Collection: ${collection}`);
    console.log("🔍 Query:", query);

    const db = await connectDB();
    const result = await db.collection(collection).find(query).limit(limit).toArray();

    console.log("📤 Returning results:", result.length);
    res.json(result);

  } catch (err) {
    console.error("❌ Get error:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.post("/update", async (req, res) => {
  console.log("📌 /update hit");
  console.log("📥 Body:", req.body);

  try {
    const { collection, query, update } = req.body;
    console.log(`🗂 Collection: ${collection}`);
    console.log("🔍 Query:", query);
    console.log("♻ Update:", update);

    const db = await connectDB();
    const result = await db.collection(collection).updateMany(query, { $set: update });

    console.log("🔧 Update result:", {
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });

    res.json({
      matched: result.matchedCount,
      modified: result.modifiedCount,
    });

  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.post("/delete", async (req, res) => {
  console.log("📌 /delete hit");
  console.log("📥 Body:", req.body);

  try {
    const { collection, query } = req.body;
    console.log(`🗂 Collection: ${collection}`);
    console.log("🗑 Query:", query);

    const db = await connectDB();
    const result = await db.collection(collection).deleteMany(query);

    console.log("🗑 Deleted count:", result.deletedCount);
    res.json({ deleted: result.deletedCount });

  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/healthz", (req, res) => {
  console.log("❤️ Health check hit");
  res.json({ status: "ok", time: new Date().toISOString() });
});

export default app;

console.log("🚀 Server ready. Routes loaded.");
