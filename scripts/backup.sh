#!/bin/sh

# ============================================
# PortPilot Database Backup Script
# ============================================

set -e

# Configuration
DB_HOST="database"
DB_NAME="${POSTGRES_DB:-portpilot}"
DB_USER="${POSTGRES_USER:-portpilot}"
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="portpilot_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
echo "Creating database backup: $BACKUP_FILE"
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > "$BACKUP_DIR/$BACKUP_FILE"

# Compress the backup
echo "Compressing backup..."
gzip "$BACKUP_DIR/$BACKUP_FILE"

# Clean up old backups (keep last 7 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "portpilot_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed successfully: ${BACKUP_FILE}.gz"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/${BACKUP_FILE}.gz" s3://your-bucket/backups/