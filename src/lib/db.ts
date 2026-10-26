import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

type Cache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const g = global as typeof globalThis & { mongooseCache?: Cache };
const cached: Cache = g.mongooseCache ?? { conn: null, promise: null };
g.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, { bufferCommands: false });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
