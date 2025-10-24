@echo off
REM ============================================
REM PortPilot Docker Management Script (Windows)
REM ============================================

setlocal enabledelayedexpansion

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found. Creating from .env.example...
    copy .env.example .env >nul
    echo [WARNING] Please update .env file with your configuration before running.
    pause
    exit /b 1
)

REM Main command handler
if "%1"=="dev:start" goto dev_start
if "%1"=="dev:build" goto dev_build
if "%1"=="prod:start" goto prod_start
if "%1"=="prod:build" goto prod_build
if "%1"=="stop" goto stop_services
if "%1"=="logs" goto view_logs
if "%1"=="status" goto show_status
if "%1"=="clean" goto clean_up
if "%1"=="backup" goto create_backup
if "%1"=="help" goto show_help
goto show_help

:dev_start
echo [INFO] Starting PortPilot development environment...
docker-compose up -d
echo [INFO] Waiting for database...
timeout /t 10 /nobreak >nul
echo [INFO] Running database migrations...
docker-compose run --rm migrator
echo [SUCCESS] Development environment is running at http://localhost:3000
goto end

:dev_build
echo [INFO] Building development images...
docker-compose build --no-cache
echo [SUCCESS] Development images built!
goto end

:prod_start
echo [INFO] Starting PortPilot production environment...
docker-compose -f docker-compose.prod.yml up -d
echo [SUCCESS] Production environment is running at https://localhost
goto end

:prod_build
echo [INFO] Building production images...
docker-compose -f docker-compose.prod.yml build --no-cache
echo [SUCCESS] Production images built!
goto end

:stop_services
echo [INFO] Stopping PortPilot services...
docker-compose down 2>nul
docker-compose -f docker-compose.prod.yml down 2>nul
echo [SUCCESS] Services stopped!
goto end

:view_logs
if "%2"=="" (
    docker-compose logs -f
) else (
    docker-compose logs -f %2
)
goto end

:show_status
echo [INFO] PortPilot Docker Status:
echo.
docker-compose ps 2>nul
echo.
docker-compose -f docker-compose.prod.yml ps 2>nul
goto end

:clean_up
echo [WARNING] This will remove all containers, images, and volumes.
set /p confirm="Continue? (y/n): "
if /i "%confirm%"=="y" (
    echo [INFO] Cleaning up Docker resources...
    docker-compose down -v --remove-orphans 2>nul
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>nul
    docker volume prune -f
    echo [SUCCESS] Cleanup completed!
)
goto end

:create_backup
echo [INFO] Creating database backup...
docker-compose -f docker-compose.prod.yml run --rm backup
echo [SUCCESS] Backup completed!
goto end

:show_help
echo PortPilot Docker Management Script (Windows)
echo.
echo Usage: %0 [command]
echo.
echo Commands:
echo   dev:start     - Start development environment
echo   dev:build     - Build development images
echo   prod:start    - Start production environment  
echo   prod:build    - Build production images
echo   stop          - Stop all services
echo   logs [service]- View logs (optionally for specific service)
echo   status        - Show service status
echo   clean         - Clean up all Docker resources
echo   backup        - Create database backup (production)
echo   help          - Show this help message
echo.
echo Examples:
echo   %0 dev:start              # Start development environment
echo   %0 logs app              # View application logs
echo   %0 prod:build            # Build production images
goto end

:end
pause