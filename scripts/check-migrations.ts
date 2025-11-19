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
  try {
    // Check if __drizzle_migrations table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'drizzle'
        AND table_name = '__drizzle_migrations'
      );
    `);

    console.log("Migration tracking table exists:", tableCheck.rows[0].exists);

    if (tableCheck.rows[0].exists) {
      // Show what migrations are recorded
      const migrations = await pool.query(`
        SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at;
      `);
      console.log("\nRecorded migrations:");
      console.log(migrations.rows);
    }

    // Check actual database schema
    console.log("\nChecking users table columns:");
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    console.log(columns.rows);

    // Check if role column exists
    const roleExists = columns.rows.some((col) => col.column_name === "role");
    console.log("\n'role' column exists in users table:", roleExists);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

main();
