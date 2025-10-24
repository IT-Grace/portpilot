# 🐳 PortPilot Docker Implementation

## Overview

This Docker implementation provides a complete containerized environment for PortPilot with development and production configurations, including PostgreSQL database, Redis caching, and Nginx reverse proxy.

## 🏗️ Architecture

### Development Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PortPilot     │    │   PostgreSQL    │    │     Redis       │
│   (Node.js)     │◄──►│   Database      │    │    Cache        │
│   Port: 3000    │    │   Port: 5432    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲
         │ Volume Mount (Hot Reload)
         ▼
┌─────────────────┐
│   Source Code   │
│   (Host)        │
└─────────────────┘
```

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   PortPilot     │    │   PostgreSQL    │
│  Reverse Proxy  │◄──►│   (Node.js)     │◄──►│   Database      │
│  Port: 80/443   │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       │                       │
         │                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SSL Certs     │    │     Redis       │    │    Backups      │
│   (Volume)      │    │    Cache        │    │   (Volume)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
PortPilot/
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Development environment
├── docker-compose.prod.yml    # Production environment
├── .dockerignore              # Docker build exclusions
├── docker.sh                  # Management script (Linux/Mac)
├── docker.bat                 # Management script (Windows)
├── nginx/
│   └── nginx.conf             # Nginx configuration
└── scripts/
    ├── init-db.sql            # Database initialization
    └── backup.sh              # Database backup script
```

## 🚀 Quick Start

### Prerequisites

- Docker 24.0+ and Docker Compose 2.0+
- 4GB+ available RAM
- 10GB+ available disk space

### Development Environment

1. **Clone and Setup**

   ```bash
   git clone <repository>
   cd PortPilot
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Start Development Environment**

   ```bash
   # Linux/Mac
   chmod +x docker.sh
   ./docker.sh dev:start

   # Windows
   docker.bat dev:start
   ```

3. **Access Application**
   - Application: http://localhost:3000
   - Database: localhost:5432
   - Redis: localhost:6379

### Production Environment

1. **Build Production Images**

   ```bash
   # Linux/Mac
   ./docker.sh prod:build

   # Windows
   docker.bat prod:build
   ```

2. **Start Production Environment**

   ```bash
   # Linux/Mac
   ./docker.sh prod:start

   # Windows
   docker.bat prod:start
   ```

3. **Access Application**
   - Application: https://localhost
   - Admin interface: https://localhost/admin

## 🔧 Configuration

### Environment Variables

Create `.env` file from `.env.example`:

```bash
# Database Configuration
DATABASE_URL=postgresql://portpilot:your_password@database:5432/portpilot
POSTGRES_DB=portpilot
POSTGRES_USER=portpilot
POSTGRES_PASSWORD=your_secure_password

# Application Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key-min-32-characters

# GitHub OAuth
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key
STRIPE_SECRET_KEY=sk-your-stripe-secret-key

# Production Only
REDIS_URL=redis://redis:6379
```

### Docker Compose Override

Create `docker-compose.override.yml` for local customizations:

```yaml
version: "3.8"
services:
  app:
    environment:
      - DEBUG=true
    ports:
      - "9229:9229" # Node.js debugging
```

## 🛠️ Management Commands

### Using Management Scripts

```bash
# Development
./docker.sh dev:start          # Start development environment
./docker.sh dev:build          # Build development images
./docker.sh stop              # Stop all services
./docker.sh logs              # View all logs
./docker.sh logs app          # View app logs only

# Production
./docker.sh prod:start         # Start production environment
./docker.sh prod:build         # Build production images
./docker.sh backup            # Create database backup
./docker.sh clean             # Clean up all resources

# Status and Monitoring
./docker.sh status            # Show service status
./docker.sh help              # Show help
```

### Direct Docker Commands

```bash
# View running containers
docker-compose ps

# Execute commands in containers
docker-compose exec app npm run seed
docker-compose exec database psql -U portpilot -d portpilot

# View logs
docker-compose logs -f app
docker-compose logs --tail=50 database

# Restart specific service
docker-compose restart app

# Scale services (production)
docker-compose -f docker-compose.prod.yml up --scale app=3
```

## 🗄️ Database Management

### Migrations

```bash
# Run migrations (development)
docker-compose run --rm migrator

# Run migrations (production)
docker-compose -f docker-compose.prod.yml exec app npm run db:push
```

### Backup and Restore

```bash
# Create backup
./docker.sh backup

# Manual backup
docker-compose -f docker-compose.prod.yml exec database \
  pg_dump -U portpilot portpilot > backup.sql

# Restore from backup
docker-compose -f docker-compose.prod.yml exec -T database \
  psql -U portpilot -d portpilot < backup.sql
```

### Database Access

```bash
# Connect to database
docker-compose exec database psql -U portpilot -d portpilot

# View database tables
docker-compose exec database psql -U portpilot -d portpilot -c "\dt"

# Database shell with environment variables
docker-compose exec -e PGPASSWORD=portpilot_dev_password database \
  psql -h localhost -U portpilot -d portpilot
```

## 🔒 Security Configuration

### Production Security Checklist

- [ ] Change default database passwords
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Enable logging and monitoring
- [ ] Set up backup schedules
- [ ] Configure rate limiting
- [ ] Set resource limits

### SSL Certificate Setup

1. **Let's Encrypt (Recommended)**

   ```bash
   # Install Certbot
   docker run -it --rm \
     -v /etc/letsencrypt:/etc/letsencrypt \
     -v /var/www/certbot:/var/www/certbot \
     certbot/certbot certonly --webroot \
     -w /var/www/certbot \
     -d your-domain.com
   ```

2. **Copy certificates to nginx/ssl/**
   ```bash
   cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
   cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
   ```

## 📊 Monitoring and Logging

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec database pg_isready -U portpilot

# Redis health
docker-compose exec redis redis-cli ping
```

### Log Management

```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f database

# Nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# Export logs
docker-compose logs --no-color > portpilot.log
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Network usage
docker network ls
docker network inspect portpilot-network
```

## 🚀 Deployment Strategies

### Rolling Updates

```bash
# Build new image
docker-compose -f docker-compose.prod.yml build app

# Rolling restart
docker-compose -f docker-compose.prod.yml up -d --no-deps app
```

### Blue-Green Deployment

1. Deploy to green environment
2. Test green environment
3. Switch traffic from blue to green
4. Keep blue as rollback option

### Scaling

```bash
# Scale application horizontally
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Load balancer will distribute traffic automatically
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Find process using port
   netstat -tulpn | grep :3000
   # Kill process or change port in docker-compose.yml
   ```

2. **Database Connection Failed**

   ```bash
   # Check database container
   docker-compose logs database
   # Verify environment variables
   docker-compose exec app printenv | grep DATABASE
   ```

3. **Out of Disk Space**

   ```bash
   # Clean up unused resources
   ./docker.sh clean
   docker system prune -a
   ```

4. **Performance Issues**
   ```bash
   # Check resource usage
   docker stats
   # Increase memory limits in docker-compose.yml
   ```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true
docker-compose up

# Node.js debugging
docker-compose run --rm -p 9229:9229 app node --inspect=0.0.0.0:9229 dist/index.js
```

## 📈 Performance Optimization

### Production Optimizations

1. **Resource Limits**

   ```yaml
   deploy:
     resources:
       limits:
         cpus: "2"
         memory: 2G
       reservations:
         cpus: "1"
         memory: 1G
   ```

2. **Caching Strategy**

   - Redis for session storage
   - Nginx static file caching
   - CDN integration for assets

3. **Database Optimization**
   - Connection pooling
   - Query optimization
   - Database indexing
   - Read replicas for scaling

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ./docker.sh prod:build
          ./docker.sh prod:start
```

### Automated Backups

```bash
# Cron job for daily backups
0 2 * * * /path/to/portpilot/docker.sh backup
```

This comprehensive Docker implementation provides a robust, scalable, and maintainable containerized environment for PortPilot development and production deployments.
