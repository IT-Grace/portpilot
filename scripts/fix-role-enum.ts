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
  console.log("🔧 Fixing role enum...\n");

  try {
    // First, check current enum values
    console.log("Checking current enum values...");
    const enumCheck = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'role'::regtype
      ORDER BY enumsortorder;
    `);
    console.log(
      "Current enum values:",
      enumCheck.rows.map((r) => r.enumlabel)
    );

    // Check if role column exists and has data
    const roleCheck = await pool.query(`
      SELECT COUNT(*) as count, role 
      FROM users 
      WHERE role IS NOT NULL 
      GROUP BY role;
    `);
    console.log("Current role usage:", roleCheck.rows);

    // Drop the role column temporarily
    console.log("\nDropping role column...");
    await pool.query(`ALTER TABLE users DROP COLUMN IF EXISTS role;`);
    console.log("✅ Role column dropped\n");

    // Drop the old enum type
    console.log("Dropping old role enum...");
    await pool.query(`DROP TYPE IF EXISTS role CASCADE;`);
    console.log("✅ Old enum dropped\n");

    // Create new enum with correct lowercase values
    console.log("Creating new role enum with lowercase values...");
    await pool.query(`
      CREATE TYPE "role" AS ENUM('user', 'moderator', 'admin');
    `);
    console.log("✅ New enum created\n");

    // Add role column back with correct type
    console.log("Adding role column back...");
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN role "role" DEFAULT 'user' NOT NULL;
    `);
    console.log("✅ Role column restored\n");

    // Verify
    console.log("Verifying...");
    const verify = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = 'role'::regtype
      ORDER BY enumsortorder;
    `);
    console.log(
      "New enum values:",
      verify.rows.map((r) => r.enumlabel)
    );

    console.log("\n🎉 Role enum fixed successfully!");
    console.log(
      "⚠️  Note: All users now have role='user'. You'll need to re-run make-admin for admins."
    );
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
