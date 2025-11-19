import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

async function main() {
  console.log("🔧 Fixing database schema...\n");

  try {
    // Create role enum if it doesn't exist
    console.log("Creating role enum type...");
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "role" AS ENUM('USER', 'MODERATOR', 'ADMIN');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✅ Role enum ready\n");

    // Add role column to users table
    console.log("Adding role column to users table...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role "role" DEFAULT 'USER' NOT NULL;
    `);
    console.log("✅ Role column added\n");

    // Add is_active column to users table
    console.log("Adding is_active column to users table...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL;
    `);
    console.log("✅ is_active column added\n");

    // Verify the fix
    console.log("Verifying schema...");
    const columns = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('role', 'is_active')
      ORDER BY column_name;
    `);

    if (columns.rows.length === 2) {
      console.log("✅ Schema verification passed:");
      console.log(columns.rows);
      console.log("\n🎉 Database schema fixed successfully!");
    } else {
      console.error(
        "❌ Schema verification failed - not all columns were added"
      );
      console.log("Found columns:", columns.rows);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error fixing schema:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
