# 🚀 PortPilot Docker Quick Setup

## Prerequisites

- Docker 24.0+ and Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

## Quick Start (Development)

### 1. Clone and Configure

```bash
git clone <your-repo-url>
cd PortPilot
cp .env.example .env
```

### 2. Update Environment Variables

Edit `.env` file with your configuration:

```bash
# Required: Database (keep as-is for Docker)
DATABASE_URL=postgresql://portpilot:portpilot_dev_password@database:5432/portpilot

# Required: App secrets
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
NEXTAUTH_URL=http://localhost:3000

# Required: GitHub OAuth (create at https://github.com/settings/developers)
GITHUB_ID=your-github-oauth-app-id
GITHUB_SECRET=your-github-oauth-app-secret

# Optional: AI features
OPENAI_API_KEY=sk-your-openai-api-key

# Optional: Stripe payments
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

### 3. Start Development Environment

**Windows:**

```cmd
docker.bat dev:start
```

**Linux/Mac:**

```bash
chmod +x docker.sh
./docker.sh dev:start
```

### 4. Access Application

- **Web App**: http://localhost:3000
- **Database**: localhost:5432 (user: portpilot, password: portpilot_dev_password)
- **Redis**: localhost:6379

## Development Commands

```bash
# View logs
./docker.sh logs

# View specific service logs
./docker.sh logs app
./docker.sh logs database

# Stop services
./docker.sh stop

# Clean up everything
./docker.sh clean

# Check status
./docker.sh status
```

## Manual Docker Commands

```bash
# Start services
docker-compose up -d

# Run database migrations
docker-compose run --rm migrator

# Seed database with demo data
docker-compose exec app npm run seed

# Access database
docker-compose exec database psql -U portpilot -d portpilot

# View running containers
docker-compose ps

# Stop services
docker-compose down
```

## Production Setup

### 1. Build Production Images

```bash
./docker.sh prod:build
```

### 2. Configure Production Environment

Update `.env` with production values:

```bash
# Production database (use secure password)
POSTGRES_PASSWORD=your_secure_production_password

# Production URLs
NEXTAUTH_URL=https://your-domain.com

# SSL certificates path (if using custom certs)
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### 3. Start Production Environment

```bash
./docker.sh prod:start
```

### 4. Access Production Application

- **Web App**: https://localhost (or your domain)
- **Health Check**: https://localhost/api/health

## Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Find what's using port 3000
netstat -tulpn | grep :3000
# Kill the process or change port in docker-compose.yml
```

**Database connection issues:**

```bash
# Check database logs
./docker.sh logs database

# Restart database
docker-compose restart database
```

**Out of disk space:**

```bash
# Clean up Docker resources
./docker.sh clean
docker system prune -a
```

### Reset Everything

```bash
# Stop and remove everything
./docker.sh clean

# Start fresh
./docker.sh dev:start
```

## GitHub OAuth Setup

1. Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: PortPilot Development
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Copy Client ID and Client Secret to `.env` file

## Next Steps

1. **Development**: Start coding! The app has hot reload enabled.
2. **Database**: Use the seeded data or create your own via the dashboard.
3. **Production**: Set up SSL certificates and domain configuration.
4. **Monitoring**: Check logs and health endpoints regularly.

## Support

- 📖 Full documentation: [DOCKER.md](DOCKER.md)
- 🐛 Issues: Check container logs with `./docker.sh logs`
- 💡 Help: Run `./docker.sh help` for all commands

Happy coding! 🎉
