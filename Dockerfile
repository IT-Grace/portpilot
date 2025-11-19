# ============================================
# Stage 1: Base - Install dependencies
# ============================================
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl

# Copy package files
COPY package*.json ./

# ============================================
# Stage 2: Development
# ============================================
FROM base AS development

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["npm", "run", "dev"]

# ============================================
# Stage 3: Builder - Build production assets
# ============================================
FROM base AS builder

# Install all dependencies for building
RUN npm ci

# Copy application code
COPY . .

# Build client (Vite) and server (esbuild)
RUN npm run build

# ============================================
# Stage 4: Production dependencies only
# ============================================
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Install libc6-compat for compatibility
RUN apk add --no-cache libc6-compat && \
    rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# ============================================
# Stage 5: Production Runtime
# ============================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodejs

# Copy production node_modules from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy package.json for npm start
COPY --from=builder /app/package.json ./

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy shared code (imported at runtime)
COPY --from=builder /app/shared ./shared

# Copy drizzle migrations (needed by db:migrate)
COPY --from=builder /app/drizzle ./drizzle

# Create uploads directory with correct permissions
RUN mkdir -p uploads && \
    chown -R nodejs:nodejs uploads

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check using Node.js (no curl dependency)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Switch to non-root user
USER nodejs

# Use dumb-init as entrypoint for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["npm", "start"]