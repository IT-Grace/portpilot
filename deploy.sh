#!/bin/bash
# ============================================
# PortPilot Production Deployment Script
# ============================================
# This script automates the deployment process with safety checks
# Usage: ./deploy.sh
#
# Order matters: the new image is built while the old version keeps serving,
# the database is backed up while it's running, and the app is only restarted
# once migrations have succeeded.

set -eo pipefail  # Exit on any error, including failures inside pipes

COMPOSE="docker compose -f docker-compose.prod.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${BLUE}$1${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Printed whenever a step fails after the code has been updated
print_rollback_help() {
    echo ""
    print_info "To roll back:"
    echo "  1. git checkout $PREVIOUS_COMMIT"
    echo "  2. $COMPOSE build app migrator"
    echo "  3. If migrations ran, restore the backup:"
    echo "       gunzip -c ${BACKUP_FILE:-backups/<pre-deploy backup>.sql.gz} | $COMPOSE exec -T database psql -U \${POSTGRES_USER:-portpilot} -d \${POSTGRES_DB:-portpilot}"
    echo "     (restore into a freshly emptied database to avoid conflicts)"
    echo "  4. $COMPOSE up -d app nginx redis"
}

# Ensure we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found!"
    print_error "Please run this script from the project root directory."
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    print_error "Please create .env with required environment variables."
    exit 1
fi

# Check required settings are present in .env and passed to the app container
MISSING=()
for VAR in DATABASE_URL POSTGRES_PASSWORD SESSION_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET GITHUB_CALLBACK_URL; do
    if ! grep -qE "^${VAR}=.+" .env; then
        MISSING+=("$VAR (in .env)")
    fi
done
for VAR in SESSION_SECRET GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET GITHUB_CALLBACK_URL DATABASE_URL; do
    if ! grep -qE "^\s+${VAR}:" docker-compose.prod.yml; then
        MISSING+=("$VAR (not passed to a service in docker-compose.prod.yml)")
    fi
done
if [ ${#MISSING[@]} -gt 0 ]; then
    print_error "Missing required configuration:"
    for ITEM in "${MISSING[@]}"; do echo "   - $ITEM"; done
    exit 1
fi

print_header "🚀 PortPilot Production Deployment"

# Step 1: Pull latest code
print_header "📥 Step 1: Pulling Latest Code"
git fetch origin
CURRENT_BRANCH=$(git branch --show-current)
PREVIOUS_COMMIT=$(git rev-parse --short HEAD)
print_info "Current branch: $CURRENT_BRANCH (at $PREVIOUS_COMMIT)"

if [ "$CURRENT_BRANCH" != "main" ]; then
    print_warning "You are not on the 'main' branch!"
    read -p "Continue with deployment from '$CURRENT_BRANCH'? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment cancelled"
        exit 1
    fi
fi

git pull origin "$CURRENT_BRANCH"
NEW_COMMIT=$(git rev-parse --short HEAD)
print_success "Code updated: $PREVIOUS_COMMIT → $NEW_COMMIT"

# Step 2: Show what's being deployed
print_header "📋 Step 2: Changes Being Deployed"
if [ "$PREVIOUS_COMMIT" = "$NEW_COMMIT" ]; then
    print_info "No new commits (redeploying $NEW_COMMIT)"
else
    git log --oneline "$PREVIOUS_COMMIT..$NEW_COMMIT"
    NEW_MIGRATIONS=$(git diff --name-only --diff-filter=A "$PREVIOUS_COMMIT" "$NEW_COMMIT" -- 'drizzle/*.sql')
    if [ -n "$NEW_MIGRATIONS" ]; then
        print_warning "New database migrations:"
        echo "$NEW_MIGRATIONS" | sed 's/^/   - /'
    else
        print_info "No new database migrations"
    fi
fi

# Step 3: Confirm deployment
print_header "🤔 Step 3: Deployment Confirmation"
echo ""
print_warning "This will deploy the changes to PRODUCTION environment"
print_warning "A backup will be created automatically before migrations"
echo ""
read -p "Continue with production deployment? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_error "Deployment cancelled by user"
    exit 1
fi

trap 'print_error "Deployment failed at line $LINENO"; print_rollback_help' ERR

# Step 4: Build new images while the current version keeps serving
print_header "🔨 Step 4: Building Docker Images"
print_info "Building images with no cache to ensure fresh build..."
print_info "The current version stays online during the build"
$COMPOSE build --no-cache app migrator
print_success "Docker images built successfully"

# Step 5: Pre-deployment backup (database must be running)
print_header "💾 Step 5: Pre-Deployment Backup"
print_info "Creating database backup..."
mkdir -p backups
$COMPOSE up -d database
$COMPOSE run --rm pre-deploy-backup
BACKUP_FILE=$(ls -t backups/pre-deploy_*.sql.gz | head -1)

# A failed pg_dump still produces a small gzip file, so check the contents.
# (|| true: head closing the pipe early makes gunzip exit non-zero under pipefail)
BACKUP_HEADER=$(gunzip -c "$BACKUP_FILE" 2>/dev/null | head -5 || true)
if gzip -t "$BACKUP_FILE" && grep -q "PostgreSQL database dump" <<< "$BACKUP_HEADER"; then
    print_success "Backup created and verified: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
else
    print_error "Backup $BACKUP_FILE is empty or invalid - aborting before migrations"
    exit 1
fi

# Step 6: Run migrations (--no-deps: the backup above already ran)
print_header "🗄️  Step 6: Running Database Migrations"
print_info "Running migrations..."
$COMPOSE run --rm --no-deps migrator
print_success "Migrations completed successfully"

# Step 6.5: Seed demo user
print_header "🌱 Step 6.5: Seeding Demo User"
print_info "Creating demo user and portfolio (if not exists)..."
if $COMPOSE run --rm --no-deps migrator npm run seed; then
    print_success "Demo user seeded successfully"
else
    print_warning "Seeding failed - this is non-critical, continuing deployment"
    print_info "You can manually seed later: $COMPOSE run --rm --no-deps migrator npm run seed"
fi

# Step 7: Validate schema
print_header "🔍 Step 7: Validating Database Schema"
$COMPOSE run --rm --no-deps migrator npx tsx scripts/validate-schema.ts
print_success "Schema validation passed"

# Step 8: Restart the application on the new image
print_header "🔄 Step 8: Deploying Application"
print_info "Starting services..."
$COMPOSE up -d app nginx redis
print_success "Services started"

trap - ERR

# Step 9: Health check against the app itself (port 80 only redirects to HTTPS)
print_header "🏥 Step 9: Health Check"
print_info "Waiting for the application to become healthy (up to 90 seconds)..."
HEALTHY=false
for _ in $(seq 1 30); do
    if curl -fsS http://localhost:3000/api/health > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    sleep 3
done

if [ "$HEALTHY" = true ]; then
    print_success "Application health check passed!"
else
    print_error "Application did not become healthy"
    print_info "Check logs: $COMPOSE logs --tail=100 app"
    print_rollback_help
    exit 1
fi

# Step 10: Deployment summary
print_header "📊 Step 10: Deployment Summary"
echo ""
$COMPOSE ps
echo ""
print_success "Deployed $NEW_COMMIT (previously $PREVIOUS_COMMIT)"
print_info "Pre-deploy backup: $BACKUP_FILE"
echo ""
print_info "Useful commands:"
echo "  • View logs:          $COMPOSE logs -f app"
echo "  • Restart app:        $COMPOSE restart app"
echo "  • Make user admin:    $COMPOSE run --rm --no-deps migrator npx tsx scripts/make-admin.ts <handle>"
echo "  • Validate schema:    $COMPOSE run --rm --no-deps migrator npx tsx scripts/validate-schema.ts"
echo "  • Check backups:      ls -lh backups/"
echo ""
print_success "🎉 PortPilot is now live!"
