/**
 * Validate production database schema integrity
 * Detects schema drift between expected and actual database structure
 * Usage: tsx scripts/validate-schema.ts
 */

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString,
});

interface ColumnCheck {
  table: string;
  column: string;
  required: boolean;
}

// Define critical schema elements that must exist
const REQUIRED_COLUMNS: ColumnCheck[] = [
  // Users table
  { table: "users", column: "id", required: true },
  { table: "users", column: "github_id", required: true },
  { table: "users", column: "handle", required: true },
  { table: "users", column: "email", required: true },
  { table: "users", column: "role", required: true },
  { table: "users", column: "is_active", required: true },
  { table: "users", column: "plan", required: true },

  // Portfolios table
  { table: "portfolios", column: "id", required: true },
  { table: "portfolios", column: "user_id", required: true },
  { table: "portfolios", column: "theme_id", required: true },
  { table: "portfolios", column: "visibility", required: true },

  // Projects table
  { table: "projects", column: "id", required: true },
  { table: "projects", column: "portfolio_id", required: true },
  { table: "projects", column: "is_featured", required: true },
  { table: "projects", column: "languages", required: true },

  // Integrations table
  { table: "integrations", column: "id", required: true },
  { table: "integrations", column: "user_id", required: true },
  { table: "integrations", column: "provider", required: true },

  // Admin actions table
  { table: "admin_actions", column: "id", required: true },
  { table: "admin_actions", column: "admin_id", required: true },
  { table: "admin_actions", column: "action", required: true },
];

const REQUIRED_ENUMS = [
  { name: "plan", values: ["FREE", "PRO"] },
  { name: "role", values: ["user", "moderator", "admin"] },
  { name: "sync_status", values: ["queued", "running", "success", "error"] },
];

async function validateSchema() {
  console.log("🔍 Validating Production Schema\n");
  console.log("━".repeat(60));

  let hasErrors = false;

  try {
    // Check columns exist
    console.log("\n📋 Checking table columns...\n");

    for (const { table, column, required } of REQUIRED_COLUMNS) {
      try {
        const result = await pool.query(
          `
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_schema = 'public'
          AND table_name = $1 
          AND column_name = $2
        `,
          [table, column]
        );

        if (result.rows.length === 0) {
          if (required) {
            console.error(`❌ MISSING: ${table}.${column}`);
            hasErrors = true;
          } else {
            console.warn(`⚠️  OPTIONAL: ${table}.${column} (not found)`);
          }
        } else {
          const col = result.rows[0];
          console.log(
            `✅ ${table}.${column} (${col.data_type}, nullable: ${col.is_nullable})`
          );
        }
      } catch (error: any) {
        console.error(`❌ Error checking ${table}.${column}:`, error.message);
        hasErrors = true;
      }
    }

    // Check enum types
    console.log("\n📋 Checking enum types...\n");

    for (const { name, values } of REQUIRED_ENUMS) {
      try {
        const result = await pool.query(
          `
          SELECT enumlabel 
          FROM pg_enum 
          WHERE enumtypid = $1::regtype
          ORDER BY enumsortorder
        `,
          [name]
        );

        if (result.rows.length === 0) {
          console.error(`❌ MISSING ENUM: ${name}`);
          hasErrors = true;
        } else {
          const enumValues = result.rows.map((r) => r.enumlabel);
          const missingValues = values.filter((v) => !enumValues.includes(v));

          if (missingValues.length > 0) {
            console.error(
              `❌ ENUM ${name} missing values: ${missingValues.join(", ")}`
            );
            hasErrors = true;
          } else {
            console.log(`✅ ${name} enum: [${enumValues.join(", ")}]`);
          }
        }
      } catch (error: any) {
        console.error(`❌ Error checking enum ${name}:`, error.message);
        hasErrors = true;
      }
    }

    // Check migration tracking table
    console.log("\n📋 Checking migration tracking...\n");

    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'drizzle'
          AND table_name = '__drizzle_migrations'
        )
      `);

      if (result.rows[0].exists) {
        const migrations = await pool.query(`
          SELECT COUNT(*) as count 
          FROM drizzle.__drizzle_migrations
        `);
        console.log(
          `✅ Migration tracking active (${migrations.rows[0].count} migrations applied)`
        );
      } else {
        console.error("❌ Migration tracking table not found!");
        hasErrors = true;
      }
    } catch (error: any) {
      console.error("❌ Error checking migration tracking:", error.message);
      hasErrors = true;
    }

    console.log("\n" + "━".repeat(60));

    if (hasErrors) {
      console.error("\n❌ Schema validation FAILED!");
      console.error(
        "⚠️  Production database schema has issues that need attention."
      );
      process.exit(1);
    } else {
      console.log("\n✅ Schema validation PASSED!");
      console.log("🎉 Production database schema is healthy.");
    }
  } catch (error) {
    console.error("\n❌ Schema validation error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

validateSchema();
