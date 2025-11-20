# Database Management

Complete guide for managing PortPilot databases across all environments.

---

## Table of Contents

- [Local Development Database](#local-development-database)
- [Database Migrations](#database-migrations)
- [Backup and Restore](#backup-and-restore)
- [Database Scripts](#database-scripts)
- [Troubleshooting](#troubleshooting)

---

## Local Development Database

### Prerequisites

- PostgreSQL 16+ installed locally
- Database credentials configured in `.env`

### Initial Setup

```powershell
# 1. Create database
psql -U postgres -c "CREATE DATABASE portpilot"

# 2. Run migrations
npm run db:migrate

# 3. Seed demo data
npm run seed
```

### Reset Local Database

Use the automated reset script to drop and recreate your local database with a backup:

```powershell
.\scripts\reset-local-db.ps1
```

**What it does:**

1. Creates timestamped backup: `backups/local_backup_YYYYMMDD_HHMMSS.sql`
2. Drops existing database
3. Creates fresh database
4. Runs all migrations
5. Seeds demo data

**Output:**

- Backup file: `backups/local_backup_YYYYMMDD_HHMMSS.sql`
- Demo portfolio: `http://localhost:3000/u/demo`

---

## Database Migrations

### Creating Migrations

```powershell
# 1. Edit schema
# Edit shared/schema.ts with your changes

# 2. Generate migration
npm run db:generate

# 3. Preview what will change
npm run db:migrate:preview

# 4. Review generated SQL
# Check drizzle/XXXX_*.sql

# 5. Apply migration
npm run db:migrate
```

### Migration Commands

```powershell
# Generate new migration from schema changes
npm run db:generate

# Preview pending migrations
npm run db:migrate:preview

# Apply migrations
npm run db:migrate

# Push schema directly (development only - not recommended)
npm run db:push
```

### Migration Best Practices

✅ **Always preview migrations before applying**

```powershell
npm run db:migrate:preview
```

✅ **Test migrations locally first**

- Run on local database
- Verify schema integrity
- Test application functionality

✅ **Commit migration files**

```powershell
git add drizzle/
git commit -m "Add migration for [feature]"
```

❌ **Never use `db:push` in production**

- Use proper migrations instead
- `db:push` bypasses migration tracking

---

## Backup and Restore

### Manual Backup

**Local PostgreSQL:**

```powershell
# Create backup
pg_dump -U postgres -d portpilot > backups/manual_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Verify backup
Get-Item backups/manual_backup_*.sql
```

**Docker Development:**

```powershell
# Create backup
docker compose exec database pg_dump -U portpilot portpilot > backups/docker_backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

**Production:**

```bash
# Automatic backups run daily
# Manual backup
docker compose -f docker-compose.prod.yml run --rm backup
```

### Restore from Backup

**Local PostgreSQL:**

```powershell
# Stop app first
# Ctrl+C to stop npm run dev

# Restore
psql -U postgres -d portpilot < backups/local_backup_YYYYMMDD_HHMMSS.sql

# Restart app
npm run dev
```

**Docker Development:**

```powershell
# Stop app container
docker compose stop app

# Restore
Get-Content backups/docker_backup_YYYYMMDD_HHMMSS.sql | docker compose exec -T database psql -U portpilot -d portpilot

# Restart app
docker compose start app
```

**Production:**

```bash
# Stop app
docker compose -f docker-compose.prod.yml stop app

# Restore
gunzip -c backups/pre-deploy_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T database psql -U portpilot -d portpilot

# Restart app
docker compose -f docker-compose.prod.yml start app
```

---

## Database Scripts

### Available Scripts

Located in `scripts/` directory:

#### `reset-local-db.ps1`

Automated local database reset with backup.

**Usage:**

```powershell
.\scripts\reset-local-db.ps1
```

**Features:**

- Creates automatic backup
- Drops and recreates database
- Runs migrations
- Seeds demo data
- Shows restore command if needed

#### `make-admin.ts`

Promote a user to admin role.

**Usage:**

```powershell
# User must have signed in via GitHub OAuth first
npm run make-admin <github-handle>

# Example
npm run make-admin johndoe
```

#### `check-migrations.ts`

Diagnostic script to check migration tracking vs actual schema.

**Usage:**

```powershell
npx tsx scripts/check-migrations.ts
```

**Shows:**

- Migration tracking table status
- Recorded migrations with timestamps
- Actual database columns
- Missing columns

#### `validate-schema.ts`

Comprehensive schema validation for production.

**Usage:**

```powershell
npx tsx scripts/validate-schema.ts
```

**Validates:**

- 20+ critical columns across all tables
- Enum types and values
- Migration tracking table
- Line-by-line error reporting

#### `preview-migrations.ts`

Preview pending migrations before deployment.

**Usage:**

```powershell
npm run db:migrate:preview
```

**Shows:**

- All pending migrations
- Migration metadata
- First 30 lines of SQL

#### `fix-schema.ts`

Manually add missing columns when migrations skip them.

**Usage:**

```powershell
npx tsx scripts/fix-schema.ts
```

**Fixes:**

- Creates missing enums
- Adds missing columns with defaults
- Verifies additions

#### `fix-role-enum.ts`

Fix enum case mismatch (uppercase vs lowercase).

**Usage:**

```powershell
npx tsx scripts/fix-role-enum.ts
```

**Warning:** Resets all users to 'user' role - re-run make-admin after.

---

## Troubleshooting

### Issue: "type plan already exists"

**Cause:** Database has schema from `db:push` but no migration tracking.

**Solution 1: Reset database (recommended for local dev)**

```powershell
.\scripts\reset-local-db.ps1
```

**Solution 2: Manual fix**

```powershell
# Check current state
npx tsx scripts/check-migrations.ts

# Fix schema manually
npx tsx scripts/fix-schema.ts
```

### Issue: Migration says "success" but columns missing

**Symptoms:**

- Migration completes without errors
- Application errors about missing columns
- Database schema incomplete

**Solution:**

```powershell
# 1. Check actual database state
npx tsx scripts/check-migrations.ts

# 2. Validate schema
npx tsx scripts/validate-schema.ts

# 3. Fix schema manually
npx tsx scripts/fix-schema.ts

# 4. Restart app
npm run dev
```

### Issue: Enum case mismatch

**Symptoms:**

- `invalid input value for enum`
- TypeScript types don't match database

**Solution:**

```powershell
# Check enum values
psql -U postgres -d portpilot -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'role'::regtype ORDER BY enumsortorder"

# If uppercase (ADMIN) instead of lowercase (admin)
npx tsx scripts/fix-role-enum.ts

# Re-promote admin users
npm run make-admin <github-handle>
```

### Issue: Connection errors

**Symptoms:**

- `ECONNREFUSED`
- Cannot connect to database

**Solution:**

```powershell
# Check PostgreSQL is running
# Windows Services → PostgreSQL

# Check connection string
Get-Content .env | Select-String "DATABASE_URL"

# Test connection
psql -U postgres -d portpilot -c "SELECT 1"
```

### Issue: Permission denied

**Symptoms:**

- `permission denied for table`
- `must be owner of table`

**Solution:**

```powershell
# Grant permissions to user
psql -U postgres -d portpilot -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO portpilot"
psql -U postgres -d portpilot -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO portpilot"
```

---

## Database URLs by Environment

### Local Development (.env)

```
DATABASE_URL=postgresql://postgres:postgres1234@localhost:5432/portpilot
```

### Docker Development (.env.docker)

```
DATABASE_URL=postgresql://portpilot:devpassword@localhost:5433/portpilot
```

### Production Local Testing (.env.production.local)

```
DATABASE_URL=postgresql://portpilot:local_prod_test_password_123@localhost:5434/portpilot
```

### Production (.env.production)

```
DATABASE_URL=postgresql://portpilot:STRONG_PASSWORD@database:5432/portpilot
```

---

## Quick Reference

### Daily Operations

```powershell
# Start development
npm run dev

# Run migrations after schema change
npm run db:generate
npm run db:migrate

# Create backup
pg_dump -U postgres -d portpilot > backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Make user admin
npm run make-admin <github-handle>

# Reset local database
.\scripts\reset-local-db.ps1
```

### Debugging

```powershell
# Check migration state
npx tsx scripts/check-migrations.ts

# Validate schema
npx tsx scripts/validate-schema.ts

# Preview pending migrations
npm run db:migrate:preview

# Connect to database
psql -U postgres -d portpilot
```

### Emergency Recovery

```powershell
# Restore from backup
psql -U postgres -d portpilot < backups/local_backup_YYYYMMDD_HHMMSS.sql

# Fix schema issues
npx tsx scripts/fix-schema.ts

# Fix enum issues
npx tsx scripts/fix-role-enum.ts
```

---

## Additional Resources

- **Deployment Guide**: `DEPLOYMENT.md` - Full deployment documentation
- **Design Guidelines**: `design_guidelines.md` - UI/UX patterns
- **Drizzle ORM Docs**: https://orm.drizzle.team/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

**Last Updated**: November 2025
**Version**: 1.0.0
