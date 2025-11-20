# PortPilot Deployment Guide

Complete deployment documentation for PortPilot across all environments: Development, Local Production Testing, and Production.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Development Deployment](#development-deployment)
- [Local Production Testing](#local-production-testing)
- [Production Deployment](#production-deployment)
- [Database Migrations](#database-migrations)
- [Common Operations](#common-operations)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Required Software

- **Docker** (v24.0+) and **Docker Compose** (v2.0+)
- **Node.js** (v20+) - for local development
- **Git** - for version control
- **PostgreSQL Client** (optional) - for database access

### Required Files

Ensure these environment files exist:

```
.env                      # Local development (your local PostgreSQL)
.env.docker               # Docker development environment
.env.production.local     # Local production testing
.env.production           # Production environment
```

### Port Requirements

| Environment            | App Port | Database Port | Nginx Port |
| ---------------------- | -------- | ------------- | ---------- |
| Local Dev (PostgreSQL) | 3000     | 5432          | N/A        |
| Docker Dev             | 3000     | 5433          | N/A        |
| Prod-Local             | 3000     | 5434          | 80         |
| Production             | 3000     | 5432          | 80, 443    |

---

## Environment Setup

### 1. Development Environment (`.env`)

For running with your **local PostgreSQL server**:

```bash
# Database (Local PostgreSQL on port 5432)
DATABASE_URL=postgresql://postgres:postgres1234@localhost:5432/portpilot

# Auth.js
AUTH_SECRET=super-secret-auth-key-for-portpilot-development-12345678
AUTH_TRUST_HOST=true

# GitHub OAuth
GITHUB_CLIENT_ID=your_dev_client_id
GITHUB_CLIENT_SECRET=your_dev_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Other variables...
```

### 2. Docker Development Environment (`.env.docker`)

For running with **Docker containers**:

```bash
# Database (Docker container on port 5433)
DATABASE_URL=postgresql://portpilot:devpassword@localhost:5433/portpilot
POSTGRES_DB=portpilot
POSTGRES_USER=portpilot
POSTGRES_PASSWORD=devpassword

# App
NODE_ENV=development
PORT=3000

# GitHub OAuth (Development)
GITHUB_CLIENT_ID=your_dev_client_id
GITHUB_CLIENT_SECRET=your_dev_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-min-32-chars

# Redis
REDIS_URL=redis://localhost:6379

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Local Production Testing (`.env.production.local`)

```bash
# Database
POSTGRES_DB=portpilot
POSTGRES_USER=portpilot
POSTGRES_PASSWORD=local_prod_test_password_123
# For accessing from host machine (migrations, scripts)
DATABASE_URL=postgresql://portpilot:local_prod_test_password_123@localhost:5434/portpilot

# Redis
REDIS_PASSWORD=redis_local_password_456

# App
NODE_ENV=production
PORT=3000

# GitHub OAuth (Same as development)
GITHUB_CLIENT_ID=your_dev_client_id
GITHUB_CLIENT_SECRET=your_dev_client_secret
GITHUB_CALLBACK_URL=http://localhost/auth/callback

# NextAuth
NEXTAUTH_URL=http://localhost
NEXTAUTH_SECRET=production-secret-min-32-chars

# Redis
REDIS_URL=redis://redis:6379

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 4. Production (`.env.production`)

```bash
# Database
DATABASE_URL=postgresql://portpilot:STRONG_PASSWORD@database:5432/portpilot
POSTGRES_DB=portpilot
POSTGRES_USER=portpilot
POSTGRES_PASSWORD=STRONG_PASSWORD

# App
NODE_ENV=production
PORT=3000

# GitHub OAuth (Production App)
GITHUB_CLIENT_ID=your_prod_client_id
GITHUB_CLIENT_SECRET=your_prod_client_secret
GITHUB_CALLBACK_URL=https://portpilot.co.uk/auth/callback

# NextAuth
NEXTAUTH_URL=https://portpilot.co.uk
NEXTAUTH_SECRET=production-secret-min-32-chars-CHANGE-THIS

# Redis
REDIS_URL=redis://redis:6379

# Stripe (Live Keys)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
VITE_STRIPE_PUBLIC_KEY=pk_live_...

# OpenAI (optional)
OPENAI_API_KEY=sk-...
```

---

## Development Deployment

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Ensure .env.docker exists
cp .env.example .env.docker
# Edit .env.docker with Docker development values

# 3. Build development images
docker-compose build

# 4. Start development environment
docker-compose up -d

# 5. Run migrations (using .env.docker)
npm run db:migrate:docker

# 6. Seed database (optional)
npm run seed:docker
```

> **Important**: Always build before starting to ensure the correct `development` target is used, especially if you've previously built production images.

### Development Workflow

#### Option 1: Local PostgreSQL (No Docker)

**Prerequisites:**

- PostgreSQL installed and running locally
- Database `portpilot` created

**Steps:**

```bash
# 1. Install dependencies
npm install

# 2. Create database (first time only)
psql -U postgres -c "CREATE DATABASE portpilot"

# 3. Run migrations
npm run db:migrate

# 4. Seed demo data (optional)
npm run seed

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

**Hot reload:** Code changes automatically reload the server.

#### Option 2: Docker Development

**Prerequisites:**

- Docker and Docker Compose installed
- `.env.docker` configured

**Steps:**

```bash
# 1. Install dependencies
npm install

# 2. Build development images
docker-compose build

# 3. Start database & redis
docker-compose up -d

# 4. Run migrations (using .env.docker)
npm run db:migrate:docker

# 5. Seed demo data (optional)
npm run seed:docker
```

The app will be available at `http://localhost:3000`

**App runs inside Docker container** with hot reload support.

> **Why always build?** Docker Compose may reuse previously built production/prod-local images if they exist. Building ensures you're using the `development` target with volume mounts for hot reload.

**Database operations:**

```bash
# Generate new migration after schema changes
npm run db:generate

# Preview migrations
npm run db:migrate:preview

# Apply migrations (local PostgreSQL)
npm run db:migrate

# Apply migrations (Docker)
npm run db:migrate:docker

# Seed demo data (local PostgreSQL)
npm run seed

# Seed demo data (Docker)
npm run seed:docker

# Reset database with backup (local PostgreSQL only)
.\scripts\reset-local-db.ps1
```

**Stopping the environment:**

```bash
# Stop development server (if running locally)
# Press Ctrl+C in the terminal running npm run dev

# Stop Docker containers
docker-compose down           # Stop containers
docker-compose down -v        # Stop and remove volumes (clean slate)
```

### Development Features

- ✅ Hot reload for code changes (via Vite & tsx watch)
- ✅ Source maps for debugging
- ✅ TypeScript type checking
- ✅ ESLint integration
- ✅ Direct database access:
  - Local PostgreSQL: `localhost:5432`
  - Docker PostgreSQL: `localhost:5433`
- ✅ No nginx (direct app access on port 3000)
- ✅ Development dependencies available
- ✅ Demo portfolio at `/u/demo` after seeding

**Useful Development Commands:**

```bash
# Check TypeScript types
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# View database schema
psql -U postgres -d portpilot -c "\dt"

# Check migration status
npx tsx scripts/check-migrations.ts
```

---

## Local Production Testing

Test production builds locally before deploying to real production.

### Setup

```bash
# 1. Ensure .env.production.local exists
cp .env.example .env.production.local
# Edit with local production values

# 2. Build images
docker compose -f docker-compose.prod.local.yml build

# 3. Start services (migrations run automatically via migrator service)
docker compose -f docker-compose.prod.local.yml up -d

# 4. Seed demo data and admin users (optional but recommended)
npm run seed:prod-local

# 5. Check logs
docker compose -f docker-compose.prod.local.yml logs -f
```

**Admin Test Accounts Created:**
After seeding, you'll have these accounts for testing:

- **admin-pro**: username=`admin-pro`, password=`Admin@123` (PRO plan)
- **admin-free**: username=`admin-free`, password=`Admin@123` (FREE plan)

Login at: `POST http://localhost/api/auth/local`

### Verification Steps

```bash
# 1. Check all services are running
docker compose -f docker-compose.prod.local.yml ps

# 2. Validate database schema
docker compose -f docker-compose.prod.local.yml run --rm migrator \
  npx tsx scripts/validate-schema.ts

# 3. Test application
curl http://localhost/api/health

# 4. Check nginx
curl -I http://localhost
```

### Making Admin Users

```bash
# Promote a user to admin (user must have signed in first)
docker compose -f docker-compose.prod.local.yml run --rm migrator \
  npx tsx scripts/make-admin.ts <github-handle>
```

### Cleanup

```bash
# Stop services
docker compose -f docker-compose.prod.local.yml down

# Remove everything including volumes
docker compose -f docker-compose.prod.local.yml down -v
```

---

## Production Deployment

### Automated Deployment (Recommended)

Use the deployment script for safe, automated deployments:

```bash
# On your production server
chmod +x deploy.sh
./deploy.sh
```

**The script will:**

1. ✅ Pull latest code from git
2. ✅ Preview migrations
3. ✅ Ask for confirmation
4. ✅ Build Docker images
5. ✅ Create pre-deployment backup
6. ✅ Run database migrations
7. ✅ Validate schema integrity
8. ✅ Deploy application
9. ✅ Run health checks
10. ✅ Show deployment summary

### Manual Deployment

If you prefer manual control:

#### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/IT-Grace/portpilot.git
cd portpilot

# 2. Create production environment file
nano .env.production
# Add all required production values

# 3. Create backups directory
mkdir -p backups

# 4. Build images
docker compose -f docker-compose.prod.yml build

# 5. Start services (migrations run automatically)
docker compose -f docker-compose.prod.yml up -d

# 6. Verify deployment
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f app
```

#### Subsequent Deployments

```bash
# 1. Pull latest code
git pull origin main

# 2. Preview what will change
npm run db:migrate:preview

# 3. Create manual backup (optional - automatic backup happens anyway)
docker compose -f docker-compose.prod.yml run --rm backup

# 4. Rebuild and deploy
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 5. Check logs
docker compose -f docker-compose.prod.yml logs -f app

# 6. Validate schema
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/validate-schema.ts
```

### SSL/HTTPS Setup

Production uses Let's Encrypt for SSL certificates:

```bash
# 1. Initial certificate setup (first time only)
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d portpilot.co.uk \
  -d www.portpilot.co.uk

# 2. Reload nginx to use certificates
docker compose -f docker-compose.prod.yml restart nginx
```

**Certificate auto-renewal** is handled by the certbot container.

---

## Database Migrations

### Migration Workflow

```bash
# 1. Make changes to shared/schema.ts

# 2. Generate migration SQL
npm run db:generate

# 3. Preview the migration
npm run db:migrate:preview

# 4. Review the generated SQL in drizzle/XXXX_*.sql

# 5. Commit migration files
git add drizzle/
git commit -m "Add migration for [feature]"

# 6. Deploy (migrations run automatically)
```

### Manual Migration Commands

```bash
# Development
npm run db:migrate

# Local Production
docker compose -f docker-compose.prod.local.yml run --rm migrator \
  npm run db:migrate

# Production
docker compose -f docker-compose.prod.yml run --rm migrator \
  npm run db:migrate
```

### Migration Verification

After any migration, verify schema integrity:

```bash
# Development
npm run db:migrate:preview

# Production
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/validate-schema.ts
```

### Migration Safety Features

✅ **Pre-deployment backups** - Automatic backup before every migration
✅ **Schema verification** - Post-migration validation ensures columns exist
✅ **Migration tracking** - Drizzle tracks applied migrations to prevent re-runs
✅ **Rollback support** - Backups enable manual rollback if needed

---

## Common Operations

### View Logs

```bash
# Development
docker compose logs -f

# Production
docker compose -f docker-compose.prod.yml logs -f app
docker compose -f docker-compose.prod.yml logs -f nginx
docker compose -f docker-compose.prod.yml logs -f database
```

### Restart Services

```bash
# Restart app only
docker compose -f docker-compose.prod.yml restart app

# Restart all services
docker compose -f docker-compose.prod.yml restart

# Recreate a specific service
docker compose -f docker-compose.prod.yml up -d --force-recreate app
```

### Database Access

```bash
# Development
psql postgresql://portpilot:devpassword@localhost:5433/portpilot

# Production (via Docker)
docker compose -f docker-compose.prod.yml exec database \
  psql -U portpilot -d portpilot
```

### Backup & Restore

**Manual backup:**

```bash
docker compose -f docker-compose.prod.yml run --rm database \
  pg_dump -U portpilot portpilot | gzip > backups/manual_$(date +%Y%m%d_%H%M%S).sql.gz
```

**Restore from backup:**

```bash
# Stop app first
docker compose -f docker-compose.prod.yml stop app

# Restore
gunzip -c backups/backup_file.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T database \
  psql -U portpilot -d portpilot

# Restart app
docker compose -f docker-compose.prod.yml start app
```

### Make User Admin

```bash
# User must have signed in via GitHub OAuth first
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/make-admin.ts <github-handle>

# Example
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/make-admin.ts IT-Grace
```

### Monitor Resources

```bash
# View resource usage
docker stats

# View specific service resources
docker stats portpilot-app-prod portpilot-db-prod
```

---

## Troubleshooting

### Issue: Migration says "success" but columns missing

**Symptoms:**

- Migration completes without errors
- Application errors about missing columns
- Database schema incomplete

**Solution:**

```bash
# 1. Check what's actually in the database
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/check-migrations.ts

# 2. Validate schema
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/validate-schema.ts

# 3. If schema drift detected, run fix script
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/fix-schema.ts

# 4. Restart app
docker compose -f docker-compose.prod.yml restart app
```

### Issue: Enum type mismatch errors

**Symptoms:**

- `invalid input value for enum`
- TypeScript types don't match database

**Solution:**

```bash
# Check enum values in database
docker compose -f docker-compose.prod.yml exec database psql -U portpilot -d portpilot -c "
  SELECT enumlabel FROM pg_enum WHERE enumtypid = 'role'::regtype;
"

# If uppercase (USER, ADMIN) instead of lowercase (user, admin)
docker compose -f docker-compose.prod.yml run --rm migrator \
  npx tsx scripts/fix-role-enum.ts
```

### Issue: Port conflicts

**Symptoms:**

- `port is already allocated`
- Cannot start containers

**Solution:**

```bash
# Find what's using the port
netstat -ano | findstr :5432

# Stop conflicting service or change port in .env file
# Then restart containers
docker compose down
docker compose up -d
```

### Issue: Health check failures

**Symptoms:**

- Container restarts repeatedly
- Health check fails

**Solution:**

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Check if database is ready
docker compose -f docker-compose.prod.yml exec database \
  pg_isready -U portpilot

# Manually test health endpoint
curl http://localhost:3000/api/health

# If database connection issues, check DATABASE_URL
docker compose -f docker-compose.prod.yml exec app env | grep DATABASE
```

### Issue: SSL certificate errors

**Symptoms:**

- HTTPS not working
- Certificate warnings

**Solution:**

```bash
# Check certificate status
docker compose -f docker-compose.prod.yml exec nginx \
  ls -la /etc/letsencrypt/live/portpilot.co.uk/

# Renew certificate manually
docker compose -f docker-compose.prod.yml run --rm certbot renew

# Reload nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## Rollback Procedures

### Application Rollback

```bash
# 1. Find previous working commit
git log --oneline -10

# 2. Checkout previous version
git checkout <commit-hash>

# 3. Rebuild and redeploy
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d app
```

### Database Rollback

```bash
# 1. Stop application
docker compose -f docker-compose.prod.yml stop app

# 2. Find backup to restore
ls -lh backups/

# 3. Restore backup
gunzip -c backups/pre-deploy_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose -f docker-compose.prod.yml exec -T database \
  psql -U portpilot -d portpilot

# 4. Restart application
docker compose -f docker-compose.prod.yml start app

# 5. Verify
docker compose -f docker-compose.prod.yml logs -f app
```

### Complete Rollback

If you need to rollback both application and database:

```bash
# 1. Stop all services
docker compose -f docker-compose.prod.yml down

# 2. Restore database from backup (see above)

# 3. Checkout previous git version
git checkout <working-commit>

# 4. Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 5. Validate
./deploy.sh  # Run deployment script for validation steps
```

---

## Best Practices

### Before Every Deployment

- ✅ Review migration preview: `npm run db:migrate:preview`
- ✅ Test in local production environment first
- ✅ Ensure automatic backup will run
- ✅ Check disk space: `df -h`
- ✅ Review recent logs for anomalies

### After Every Deployment

- ✅ Validate schema: `scripts/validate-schema.ts`
- ✅ Check health endpoint: `curl http://localhost/api/health`
- ✅ Monitor logs for errors: `docker compose logs -f app`
- ✅ Test critical user flows
- ✅ Verify backup was created: `ls -lh backups/`

### Regular Maintenance

- 🔄 **Weekly**: Review and clean old backups
- 🔄 **Monthly**: Review container logs and resource usage
- 🔄 **Quarterly**: Update dependencies and rebuild images
- 🔄 **As needed**: Rotate secrets and credentials

---

## Quick Reference

### Development Commands

```bash
# Local PostgreSQL Development
docker-compose build              # Build dev images (if using Docker services)
docker-compose up -d              # Start database/redis only
npm run dev                       # Start dev server locally
npm run db:generate               # Generate migration
npm run db:migrate                # Apply migrations (local DB)
npm run seed                      # Seed demo data (local DB)
docker-compose down               # Stop Docker services

# Docker Development
docker-compose build              # Build dev images
docker-compose up -d              # Start all containers
npm run db:migrate:docker         # Apply migrations (Docker DB)
npm run seed:docker               # Seed demo data (Docker DB)
docker-compose logs -f app        # View app logs
docker-compose down               # Stop all containers
docker-compose down -v            # Stop and remove volumes
```

### Production Commands

```bash
./deploy.sh                       # Automated deployment
docker compose -f docker-compose.prod.yml up -d    # Start prod
docker compose -f docker-compose.prod.yml logs -f  # View logs
docker compose -f docker-compose.prod.yml restart app  # Restart app
docker compose -f docker-compose.prod.yml ps      # Service status
```

### Utility Commands

```bash
npm run db:migrate:preview        # Preview migrations
npm run make-admin <handle>       # Make user admin
docker stats                      # Resource usage
docker compose exec database psql # Database access
```

---

## Support

For issues or questions:

- Check logs first: `docker compose logs -f`
- Review [troubleshooting section](#troubleshooting)
- Validate schema: `scripts/validate-schema.ts`
- Check GitHub Issues: [github.com/IT-Grace/portpilot/issues](https://github.com/IT-Grace/portpilot/issues)

---

**Last Updated**: November 2025  
**Version**: 1.0.0
