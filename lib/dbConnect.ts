import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null }

const globalWithCache = globalThis as typeof globalThis & { _mongooseCache?: MongooseCache }
const cached = globalWithCache._mongooseCache ?? { conn: null, promise: null }
globalWithCache._mongooseCache = cached

export default async function dbConnect() {
  if (!MONGODB_URI) throw new Error('Falta MONGODB_URI. Añádela en .env.local para usar las funciones de cuenta y publicaciones.')
  if (cached.conn) return cached.conn
  cached.promise ??= mongoose.connect(MONGODB_URI, { bufferCommands: false })
  cached.conn = await cached.promise
  return cached.conn
}