#!/bin/bash
# ============================================
# PortPilot Production Deployment Script
# ============================================
# This script automates the deployment process with safety checks
# Usage: ./deploy.sh

set -e  # Exit on any error

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

# Ensure we're in the right directory
if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found!"
    print_error "Please run this script from the project root directory."
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_error "Please create .env.production with required environment variables."
    exit 1
fi

print_header "🚀 PortPilot Production Deployment"

# Step 1: Pull latest code
print_header "📥 Step 1: Pulling Latest Code"
git fetch origin
CURRENT_BRANCH=$(git branch --show-current)
print_info "Current branch: $CURRENT_BRANCH"

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
print_success "Code updated to latest version"

# Step 2: Preview migrations
print_header "📋 Step 2: Migration Preview"
npm run db:migrate:preview

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

# Step 4: Build new images
print_header "🔨 Step 4: Building Docker Images"
print_info "Building images with no cache to ensure fresh build..."
docker compose -f docker-compose.prod.yml build --no-cache
print_success "Docker images built successfully"

# Step 5: Pre-deployment backup (automatic via docker-compose dependency)
print_header "💾 Step 5: Pre-Deployment Backup"
print_info "Backup will be created automatically when starting services..."

# Step 6: Run migrations with backup
print_header "🗄️  Step 6: Running Database Migrations"
print_info "This will create a backup before running migrations..."
docker compose -f docker-compose.prod.yml up pre-deploy-backup migrator

# Check if migration was successful
if [ $? -ne 0 ]; then
    print_error "Migration failed!"
    print_error "Database backup is available in ./backups/ directory"
    print_error "Check logs: docker logs portpilot-migrator"
    exit 1
fi
print_success "Migrations completed successfully"

# Step 7: Validate schema
print_header "🔍 Step 7: Validating Database Schema"
docker compose -f docker-compose.prod.yml run --rm migrator npx tsx scripts/validate-schema.ts

if [ $? -ne 0 ]; then
    print_error "Schema validation failed!"
    print_error "Please review the errors above and fix schema issues"
    exit 1
fi
print_success "Schema validation passed"

# Step 8: Deploy application with zero-downtime
print_header "🔄 Step 8: Deploying Application"
print_info "Starting services..."
docker compose -f docker-compose.prod.yml up -d app nginx redis

print_success "Services started"

# Step 9: Health check
print_header "🏥 Step 9: Health Check"
print_info "Waiting for application to start (5 seconds)..."
sleep 5

print_info "Checking application health..."
if curl -f -s http://localhost/api/health > /dev/null 2>&1; then
    print_success "Application health check passed!"
else
    print_warning "Health check failed - application may still be starting"
    print_info "Check logs: docker compose -f docker-compose.prod.yml logs app"
    
    read -p "Continue despite health check failure? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deployment rollback initiated..."
        docker compose -f docker-compose.prod.yml restart app
        exit 1
    fi
fi

# Step 10: Deployment summary
print_header "📊 Step 10: Deployment Summary"
echo ""
docker compose -f docker-compose.prod.yml ps
echo ""

print_success "Deployment completed successfully!"
echo ""
print_info "Useful commands:"
echo "  • View logs:          docker compose -f docker-compose.prod.yml logs -f app"
echo "  • Restart app:        docker compose -f docker-compose.prod.yml restart app"
echo "  • Make user admin:    docker compose -f docker-compose.prod.yml run --rm migrator npx tsx scripts/make-admin.ts <handle>"
echo "  • Validate schema:    docker compose -f docker-compose.prod.yml run --rm migrator npx tsx scripts/validate-schema.ts"
echo "  • Check backups:      ls -lh backups/"
echo ""
print_success "🎉 PortPilot is now live!"
