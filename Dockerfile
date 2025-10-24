# ============================================
# PortPilot Multi-Stage Docker Build
# ============================================

# ============================================
# Stage 1: Base Node.js Environment
# ============================================
FROM node:20-alpine AS base

# Install system dependencies for native modules
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base AS deps

# Install all dependencies (dev + prod)
RUN npm ci --include=dev

# ============================================
# Stage 3: Development Environment
# ============================================
FROM deps AS development

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose development port
EXPOSE 3000

# Development command with hot reload
CMD ["npm", "run", "dev"]

# ============================================
# Stage 4: Build Stage
# ============================================
FROM deps AS builder

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ============================================
# Stage 5: Production Dependencies
# ============================================
FROM base AS prod-deps

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# ============================================
# Stage 6: Production Runtime
# ============================================
FROM node:20-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create app user for security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nodejs

# Set working directory
WORKDIR /app

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose production port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]