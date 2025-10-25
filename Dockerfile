# ============================================
# Stage 1: Base Node.js Environment
# ============================================
FROM node:20-alpine AS base
# Add build tools for any native deps
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*
WORKDIR /app
# Copy package manifests so we can install deps
COPY package*.json ./
# ============================================
# Stage 2: Install ALL deps (dev + prod) for building
# ============================================
FROM base AS deps
# install all deps including dev deps (we need vite, esbuild, etc. to build)
RUN npm ci --include=dev
# ============================================
# Stage 3: Builder (runs your build script)
# ============================================
FROM deps AS builder
# bring in the rest of the source code
COPY . .
# run your build:
# - vite build -> dist/public
# - esbuild server/index.ts -> dist/index.js
RUN npm run build
# At this point, /app/dist now contains:
#   dist/index.js
#   dist/public/*
# ============================================
# Stage 4: Production deps only
# We'll create a clean node_modules with just prod deps
# ============================================
FROM node:20-alpine AS prod-deps
WORKDIR /app
RUN apk add --no-cache libc6-compat && rm -rf /var/cache/apk/*
COPY package*.json ./
# install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force
# ============================================
# Stage 5: Production runtime
# ============================================
FROM node:20-alpine AS production
# add dumb-init for signal handling
RUN apk add --no-cache dumb-init && rm -rf /var/cache/apk/*
# create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nodejs
WORKDIR /app
# copy production node_modules from prod-deps
COPY --from=prod-deps /app/node_modules ./node_modules
# copy package.json so "npm start" works
COPY --from=builder /app/package.json ./
# copy built app output
#   dist/index.js (server runtime)
#   dist/public/* (static frontend)
COPY --from=builder /app/dist ./dist
# OPTIONAL: if your runtime code imports from ./shared at runtime
# (not just types), keep this. Otherwise you can delete it.
COPY --from=builder /app/shared ./shared
# make uploads dir writable
RUN mkdir -p uploads && chown -R nodejs:nodejs uploads
# env for runtime
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
# healthcheck (adjust /api/health if your route differs)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
# run as non-root
USER nodejs
ENTRYPOINT ["dumb-init", "--"]
# npm start = "NODE_ENV=production node dist/index.js"
CMD ["npm", "start"]