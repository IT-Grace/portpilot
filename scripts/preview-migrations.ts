/**
 * Preview pending database migrations
 * Usage: npm run db:migrate:preview
 */

import fs from "fs";
import path from "path";

interface MigrationEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints: boolean;
}

interface MigrationJournal {
  version: string;
  dialect: string;
  entries: MigrationEntry[];
}

async function previewMigrations() {
  const migrationsDir = path.join(process.cwd(), "drizzle");
  const journalPath = path.join(migrationsDir, "meta", "_journal.json");

  console.log("📋 Migration Preview\n");
  console.log("━".repeat(60));

  if (!fs.existsSync(journalPath)) {
    console.log("❌ No migrations found in ./drizzle/meta/_journal.json");
    console.log("\n💡 Run 'npm run db:generate' to create migrations");
    return;
  }

  const journal: MigrationJournal = JSON.parse(
    fs.readFileSync(journalPath, "utf-8")
  );

  if (journal.entries.length === 0) {
    console.log("✅ No migrations to apply");
    return;
  }

  console.log(`Found ${journal.entries.length} migration(s):\n`);

  for (const entry of journal.entries) {
    const sqlFile = path.join(migrationsDir, `${entry.tag}.sql`);

    console.log(`\n🔹 Migration: ${entry.tag}`);
    console.log(`   Version: ${entry.version}`);
    console.log(`   Date: ${new Date(entry.when).toLocaleString()}`);
    console.log("─".repeat(60));

    if (fs.existsSync(sqlFile)) {
      const sql = fs.readFileSync(sqlFile, "utf-8");
      const lines = sql.split("\n");

      // Show a preview of the SQL (first 30 lines or full if shorter)
      const preview = lines.slice(0, 30).join("\n");
      console.log(preview);

      if (lines.length > 30) {
        console.log(`\n... (${lines.length - 30} more lines)`);
      }
    } else {
      console.log("⚠️  SQL file not found");
    }

    console.log("─".repeat(60));
  }

  console.log("\n" + "━".repeat(60));
  console.log(
    `\n✅ Preview complete - ${journal.entries.length} migration(s) ready`
  );
  console.log("\n💡 To apply these migrations, run: npm run db:migrate\n");
}

previewMigrations().catch((error) => {
  console.error("❌ Error previewing migrations:", error);
  process.exit(1);
});
