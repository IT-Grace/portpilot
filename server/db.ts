// Database setup for local PostgreSQL
import dotenv from "dotenv";

// Load environment variables from .env file only if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

import * as schema from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
