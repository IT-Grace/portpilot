import * as schema from "@shared/schema";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// Load environment variables from .env file only if DATABASE_URL is not already set
// This allows environment variable overrides and dotenv-cli to work properly
if (!process.env.DATABASE_URL) {
  config();
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error(
    "💡 Make sure you have a .env file with DATABASE_URL configured"
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

const db = drizzle(pool, { schema });

/**
 * Verify that critical schema columns exist after migration
 * This catches issues where migrations report success but don't actually apply
 */
async function verifyMigration() {
  console.log("🔍 Verifying schema integrity...");

  try {
    // Test query to ensure critical columns exist
    // This will throw if any column is missing
    await pool.query(`
      SELECT id, role, is_active, plan, created_at
      FROM users 
      WHERE FALSE
    `);

    await pool.query(`
      SELECT id, theme_id, is_public 
      FROM portfolios 
      WHERE FALSE
    `);

    await pool.query(`
      SELECT id, name, languages 
      FROM projects 
      WHERE FALSE
    `);

    console.log("✅ Schema verification passed");
    return true;
  } catch (error: any) {
    console.error("❌ Schema verification failed:", error.message);
    console.error("⚠️  Migration completed but schema is incomplete!");
    console.error("⚠️  Manual intervention may be required.");
    return false;
  }
}

async function main() {
  console.log("🔌 Connecting to database...");
  console.log("⏳ Running migrations...");

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Migrations completed successfully!");

    // Verify the migration actually worked
    const verified = await verifyMigration();
    if (!verified) {
      process.exit(1);
    }

    console.log("🎉 Database is ready!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error during migration:", err);
  process.exit(1);
});
