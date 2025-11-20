# ============================================
# Reset Local PostgreSQL Database
# ============================================
# Creates backup, drops database, recreates with migrations, and seeds data

$ErrorActionPreference = "Stop"

Write-Host "Starting local database reset..." -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_NAME = "portpilot"
$DB_USER = "postgres"
$BACKUP_DIR = "backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "$BACKUP_DIR/local_backup_$TIMESTAMP.sql"

# Create backups directory if it doesn't exist
if (-not (Test-Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR | Out-Null
    Write-Host "Created backups directory" -ForegroundColor Green
}

# Step 1: Create backup
Write-Host "Creating backup..." -ForegroundColor Yellow
try {
    # Use pg_dump to create backup
    pg_dump -U $DB_USER -d $DB_NAME > $BACKUP_FILE
    
    $fileSize = (Get-Item $BACKUP_FILE).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "Backup created: $BACKUP_FILE ($fileSizeKB KB)" -ForegroundColor Green
}
catch {
    Write-Host "Backup failed: $_" -ForegroundColor Red
    Write-Host "Continuing anyway (database might not exist yet)..." -ForegroundColor Yellow
}
Write-Host ""

# Step 2: Drop database
Write-Host "Dropping database '$DB_NAME'..." -ForegroundColor Yellow
try {
    psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME"
    Write-Host "Database dropped" -ForegroundColor Green
}
catch {
    Write-Host "Failed to drop database: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Create fresh database
Write-Host "Creating fresh database '$DB_NAME'..." -ForegroundColor Yellow
try {
    psql -U $DB_USER -c "CREATE DATABASE $DB_NAME"
    Write-Host "Database created" -ForegroundColor Green
}
catch {
    Write-Host "Failed to create database: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Run migrations
Write-Host "Running migrations..." -ForegroundColor Yellow
try {
    npm run db:migrate
    if ($LASTEXITCODE -ne 0) {
        throw "Migration failed with exit code $LASTEXITCODE"
    }
    Write-Host "Migrations completed" -ForegroundColor Green
}
catch {
    Write-Host "Migration failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "To restore from backup:" -ForegroundColor Yellow
    Write-Host "  psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Step 5: Seed database
Write-Host "Seeding database..." -ForegroundColor Yellow
try {
    npm run seed
    if ($LASTEXITCODE -ne 0) {
        throw "Seeding failed with exit code $LASTEXITCODE"
    }
    Write-Host "Database seeded" -ForegroundColor Green
}
catch {
    Write-Host "Seeding failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "To restore from backup:" -ForegroundColor Yellow
    Write-Host "  psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE" -ForegroundColor Cyan
    exit 1
}
Write-Host ""

# Success summary
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database reset completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - Backup: $BACKUP_FILE"
Write-Host "  - Database: $DB_NAME (fresh)"
Write-Host "  - Demo user: http://localhost:3000/u/demo"
Write-Host ""
Write-Host "To restore from backup if needed:" -ForegroundColor Yellow
Write-Host "  psql -U $DB_USER -d $DB_NAME < $BACKUP_FILE" -ForegroundColor Cyan
Write-Host ""
