/**
 * Script to promote a user to admin role
 * Usage: tsx scripts/make-admin.ts <github-handle>
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const githubHandle = process.argv[2];

if (!githubHandle) {
  console.error("❌ Error: Please provide a GitHub handle");
  console.log("Usage: tsx scripts/make-admin.ts <github-handle>");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function makeAdmin() {
  try {
    console.log(`🔍 Looking for user: ${githubHandle}...`);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.handle, githubHandle))
      .limit(1);

    if (!user) {
      console.error(`❌ User not found: ${githubHandle}`);
      console.log("\n💡 Make sure the user has signed in at least once via GitHub OAuth");
      process.exit(1);
    }

    if (user.role === "admin") {
      console.log(`✅ User ${githubHandle} is already an admin!`);
      process.exit(0);
    }

    console.log(`📝 Updating ${githubHandle} to admin role...`);

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, user.id));

    console.log(`✅ Success! ${githubHandle} is now an admin`);
    console.log(`\n🔐 Admin Dashboard: http://localhost/admin`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

makeAdmin();
