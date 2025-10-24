-- ============================================
-- PortPilot Database Initialization Script
-- ============================================

-- Create database user and set permissions
-- Note: This runs as superuser during initialization

-- Ensure the database exists
\c portpilot;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE portpilot TO portpilot;
GRANT ALL ON SCHEMA public TO portpilot;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO portpilot;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO portpilot;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO portpilot;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO portpilot;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for performance (if not handled by Drizzle migrations)
-- These will be created by Drizzle, but keeping as backup

\echo 'Database initialization completed successfully!'