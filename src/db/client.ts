import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle> | null = null;

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }

  if (!db) {
    const client = postgres(url);
    db = drizzle(client, { schema });
  }

  return db;
}