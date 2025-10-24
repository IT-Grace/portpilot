#!/bin/bash

# ============================================
# PortPilot Docker Development Scripts
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.example..."
        cp .env.example .env
        print_warning "Please update .env file with your configuration before running the application."
        exit 1
    fi
}

# Function to build images
build_dev() {
    print_status "Building PortPilot development images..."
    docker-compose build --no-cache
    print_success "Development images built successfully!"
}

build_prod() {
    print_status "Building PortPilot production images..."
    docker-compose -f docker-compose.prod.yml build --no-cache
    print_success "Production images built successfully!"
}

# Function to start development environment
dev_start() {
    check_env
    print_status "Starting PortPilot development environment..."
    
    # Start services in detached mode
    docker-compose up -d
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    docker-compose exec -T database pg_isready -U portpilot -d portpilot || sleep 10
    
    # Run migrations
    print_status "Running database migrations..."
    docker-compose run --rm migrator
    
    # Optional: Seed database
    read -p "Do you want to seed the database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Seeding database..."
        docker-compose exec -T app npm run seed
    fi
    
    print_success "PortPilot development environment is running!"
    print_status "Access the application at: http://localhost:3000"
    print_status "View logs with: docker-compose logs -f"
}

# Function to start production environment
prod_start() {
    check_env
    print_status "Starting PortPilot production environment..."
    
    # Start services
    docker-compose -f docker-compose.prod.yml up -d
    
    print_success "PortPilot production environment is running!"
    print_status "Access the application at: https://localhost"
}

# Function to stop services
stop() {
    print_status "Stopping PortPilot services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "Services stopped!"
}

# Function to view logs
logs() {
    docker-compose logs -f "${2:-}"
}

# Function to clean up
clean() {
    print_warning "This will remove all containers, images, and volumes. Are you sure?"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker resources..."
        
        # Stop and remove containers
        docker-compose down -v --remove-orphans 2>/dev/null || true
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
        
        # Remove images
        docker rmi $(docker images "portpilot*" -q) 2>/dev/null || true
        
        # Remove unused volumes
        docker volume prune -f
        
        print_success "Cleanup completed!"
    fi
}

# Function to run database backup
backup() {
    print_status "Creating database backup..."
    docker-compose -f docker-compose.prod.yml run --rm backup
    print_success "Backup completed!"
}

# Function to restore database from backup
restore() {
    if [ -z "$2" ]; then
        print_error "Please specify backup file: $0 restore <backup-file>"
        exit 1
    fi
    
    print_status "Restoring database from backup: $2"
    # Implementation depends on backup format
    print_warning "Database restore functionality needs to be implemented"
}

# Function to show status
status() {
    print_status "PortPilot Docker Status:"
    echo
    docker-compose ps 2>/dev/null || echo "Development environment not running"
    echo
    docker-compose -f docker-compose.prod.yml ps 2>/dev/null || echo "Production environment not running"
}

# Function to show help
help() {
    echo "PortPilot Docker Management Script"
    echo
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  dev:start     - Start development environment"
    echo "  dev:build     - Build development images"
    echo "  prod:start    - Start production environment"
    echo "  prod:build    - Build production images"
    echo "  stop          - Stop all services"
    echo "  logs [service]- View logs (optionally for specific service)"
    echo "  status        - Show service status"
    echo "  clean         - Clean up all Docker resources"
    echo "  backup        - Create database backup (production)"
    echo "  restore <file>- Restore database from backup"
    echo "  help          - Show this help message"
    echo
    echo "Examples:"
    echo "  $0 dev:start              # Start development environment"
    echo "  $0 logs app              # View application logs"
    echo "  $0 prod:build            # Build production images"
}

# Main command handler
case "${1:-help}" in
    "dev:start")
        dev_start
        ;;
    "dev:build")
        build_dev
        ;;
    "prod:start")
        prod_start
        ;;
    "prod:build")
        build_prod
        ;;
    "stop")
        stop
        ;;
    "logs")
        logs "$@"
        ;;
    "status")
        status
        ;;
    "clean")
        clean
        ;;
    "backup")
        backup
        ;;
    "restore")
        restore "$@"
        ;;
    "help"|*)
        help
        ;;
esac