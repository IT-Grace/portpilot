# PortPilot Documentation

Welcome to the PortPilot documentation. This directory contains comprehensive guides for development, deployment, and maintenance.

---

## 📚 Available Documentation

### [Database Management](./database-management.md)

Complete guide for managing databases across all environments.

**Topics covered:**

- Local development database setup
- Database migrations workflow
- Backup and restore procedures
- Database scripts reference
- Troubleshooting common issues

**Quick links:**

- [Reset Local Database](./database-management.md#reset-local-database)
- [Creating Migrations](./database-management.md#creating-migrations)
- [Backup and Restore](./database-management.md#backup-and-restore)
- [Database Scripts](./database-management.md#database-scripts)

---

### [Deployment Guide](./DEPLOYMENT.md)

Production-grade deployment documentation for all environments.

**Topics covered:**

- Prerequisites and environment setup
- Development deployment (local PostgreSQL & Docker)
- Local production testing
- Production deployment (automated & manual)
- Common operations and monitoring
- Troubleshooting and rollback procedures

**Quick links:**

- [Development Deployment](./DEPLOYMENT.md#development-deployment)
- [Production Deployment](./DEPLOYMENT.md#production-deployment)
- [Database Migrations](./DEPLOYMENT.md#database-migrations)
- [Rollback Procedures](./DEPLOYMENT.md#rollback-procedures)

---

### [Design Guidelines](./design-guidelines.md)

UI/UX patterns, color system, and component conventions.

**Topics covered:**

- Design system and color palette
- Typography and spacing
- Component patterns
- Theme system
- Accessibility guidelines

---

## 🚀 Quick Start

### First Time Setup

```powershell
# 1. Install dependencies
npm install

# 2. Setup environment files
cp .env.example .env
cp .env.example .env.docker

# 3. Create local database
psql -U postgres -c "CREATE DATABASE portpilot"

# 4. Run migrations
npm run db:migrate

# 5. Seed demo data
npm run seed

# 6. Start development server
npm run dev
```

### Daily Development

```powershell
# Start development server
npm run dev

# Reset local database (with backup)
.\scripts\reset-local-db.ps1

# Make user admin
npm run make-admin <github-handle>

# Generate migration after schema changes
npm run db:generate
npm run db:migrate
```

---

## 🔧 Common Tasks

### Database Operations

```powershell
# Create backup
pg_dump -U postgres -d portpilot > backups/backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql

# Restore from backup
psql -U postgres -d portpilot < backups/backup_YYYYMMDD_HHMMSS.sql

# Check migration status
npx tsx scripts/check-migrations.ts

# Validate schema
npx tsx scripts/validate-schema.ts
```

### Docker Operations

```powershell
# Start Docker development
docker compose build
docker compose up -d

# View logs
docker compose logs -f

# Stop containers
docker compose down
```

### Production Operations

```bash
# Automated deployment
./deploy.sh

# Manual deployment
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# View production logs
docker compose -f docker-compose.prod.yml logs -f app
```

---

## 📖 Documentation Index

| Document                                        | Description                         | When to Use                                        |
| ----------------------------------------------- | ----------------------------------- | -------------------------------------------------- |
| [Database Management](./database-management.md) | Database setup, migrations, backups | Daily development, schema changes, troubleshooting |
| [Deployment Guide](./DEPLOYMENT.md)             | Complete deployment procedures      | Setting up environments, deploying to production   |
| [Design Guidelines](./design-guidelines.md)     | UI/UX patterns and conventions      | Building new features, styling components          |

---

## 🆘 Need Help?

### Common Issues

1. **"type plan already exists"** → See [Database Troubleshooting](./database-management.md#troubleshooting)
2. **Migration fails** → See [Migration Issues](./DEPLOYMENT.md#troubleshooting)
3. **Port conflicts** → See [Port Issues](./DEPLOYMENT.md#issue-port-conflicts)
4. **Connection errors** → See [Connection Issues](./database-management.md#issue-connection-errors)

### Debug Commands

```powershell
# Check database connection
psql -U postgres -d portpilot -c "SELECT 1"

# Check migration state
npx tsx scripts/check-migrations.ts

# Validate schema integrity
npx tsx scripts/validate-schema.ts

# Preview pending migrations
npm run db:migrate:preview
```

---

## 🔗 External Resources

- **GitHub Repository**: [IT-Grace/portpilot](https://github.com/IT-Grace/portpilot)
- **Drizzle ORM**: https://orm.drizzle.team/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Docker**: https://docs.docker.com/
- **Vite**: https://vitejs.dev/

---

## 📝 Contributing to Documentation

When adding new documentation:

1. Create markdown files in the `docs/` directory
2. Use clear headings and table of contents
3. Include code examples with syntax highlighting
4. Add cross-references to related sections
5. Update this README with links to new documentation

---

**Last Updated**: November 2025
