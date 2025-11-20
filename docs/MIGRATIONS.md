# Database Migrations Guide

## Overview

PortPilot uses **Drizzle Kit** for production-ready database migrations. This provides version control, audit trails, and safe deployment of schema changes.

## Migration Workflow

### 1. Making Schema Changes

Edit the schema in `shared/schema.ts`:

```typescript
// Example: Adding a new column
export const users = pgTable("users", {
  // ... existing columns
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
});
```

### 2. Generate Migration Files

After modifying the schema, generate a migration:

```bash
npm run db:generate
```

This creates a new SQL file in `drizzle/` (e.g., `0001_description.sql`).

**Review the generated SQL** to ensure it matches your intent. Drizzle generates:

- CREATE/ALTER/DROP statements
- Index creation
- Foreign key constraints
- Data type changes

### 3. Apply Migrations

**Development:**

```bash
npm run db:migrate
```

**Production:**
Migrations run automatically via the migrator service in Docker or CI/CD pipelines.

### 4. Commit Migration Files

```bash
git add drizzle/0001_*.sql shared/schema.ts
git commit -m "feat: add user bio and avatar fields"
```

**Important:** Always commit both the schema changes AND the generated migration files together.

## Migration Commands

| Command               | Description                                       |
| --------------------- | ------------------------------------------------- |
| `npm run db:generate` | Generate migration files from schema changes      |
| `npm run db:migrate`  | Apply pending migrations to database              |
| `npm run db:push`     | **⚠️ DEPRECATED** - Direct schema sync (dev only) |

## Best Practices

### ✅ DO

- **Review generated SQL** before applying migrations
- **Test migrations** in development environment first
- **Commit migrations** alongside schema changes
- **Use descriptive names** when Drizzle asks for migration description
- **Run migrations in order** (Drizzle tracks which have been applied)

### ❌ DON'T

- **Don't edit** existing migration files after they've been applied
- **Don't delete** migration files from the `drizzle/` folder
- **Don't use `db:push`** in production (it skips migration files)
- **Don't commit** the `drizzle/meta/` cache folder

## Deployment

### Docker Production

The `docker-compose.prod.yml` includes a migrator service:

```yaml
migrator:
  image: portpilot:latest
  command: npm run db:migrate
  environment:
    DATABASE_URL: $DATABASE_URL
  depends_on:
    - postgres
```

This runs migrations before the main app starts.

### Manual Deployment

```bash
# 1. Set DATABASE_URL
export DATABASE_URL="postgresql://user:pass@host:5432/db"

# 2. Run migrations
npm run db:migrate

# 3. Start application
npm run start
```

## Troubleshooting

### Migration fails with "column already exists"

**Cause:** Database is out of sync with migration history.

**Solution:**

1. Check `drizzle/__drizzle_migrations` table to see which migrations were applied
2. Manually mark migration as applied (if schema is already correct):
   ```sql
   INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
   VALUES ('your-migration-hash', EXTRACT(EPOCH FROM NOW()) * 1000);
   ```

### How do I rollback a migration?

Drizzle doesn't support automatic rollback. To revert:

1. **Create a new migration** that reverses the changes
2. Generate it with `npm run db:generate`
3. Apply with `npm run db:migrate`

Example:

```typescript
// Original migration added a column
// New migration removes it:
await db.execute(sql`ALTER TABLE users DROP COLUMN bio`);
```

### Development database out of sync?

**Option 1: Reset and migrate**

```bash
# Drop all tables (⚠️ destroys data)
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Apply all migrations from scratch
npm run db:migrate
```

**Option 2: Push schema directly (dev only)**

```bash
npm run db:push
```

## Migration File Structure

```
drizzle/
├── 0000_furry_sleeper.sql      # Initial schema
├── 0001_add_user_bio.sql       # New migration
├── 0002_add_indexes.sql        # Another migration
└── meta/                        # Cache (gitignored)
    ├── _journal.json
    └── 0000_snapshot.json
```

### Example Migration File

```sql
-- drizzle/0001_add_user_bio.sql
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" ("email");
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run database migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Start application
  run: npm run start
```

The migration runner exits with code 1 on failure, stopping the deployment.

## Schema Evolution Examples

### Adding a new table

```typescript
// shared/schema.ts
export const notifications = pgTable("notifications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
```

Then: `npm run db:generate` → Review SQL → `npm run db:migrate`

### Modifying a column (with data migration)

```typescript
// 1. Add new column with nullable constraint
export const users = pgTable("users", {
  // Old: username: varchar("username").notNull(),
  username: varchar("username"),
  displayName: varchar("display_name"), // New column
});

// 2. Generate migration: npm run db:generate
// 3. Manually edit migration to copy data:
// ALTER TABLE users ADD COLUMN display_name varchar;
// UPDATE users SET display_name = username WHERE display_name IS NULL;
// 4. Create another migration to add NOT NULL constraint
```

### Adding indexes

```typescript
export const users = pgTable(
  "users",
  {
    // ... columns
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    roleIdx: index("users_role_idx").on(table.role),
  })
);
```

## Support

For issues with migrations:

1. Check Drizzle docs: https://orm.drizzle.team/kit-docs/overview
2. Review migration SQL files in `drizzle/`
3. Check `drizzle.__drizzle_migrations` table in database
4. Ask team lead or DevOps for production migration guidance
