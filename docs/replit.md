# PortPilot - Auto-Generated Developer Portfolios

## Project Overview

PortPilot is a production-ready SaaS application that automatically generates beautiful developer portfolio sites from GitHub repositories. Users can sign in with GitHub OAuth, select their best projects, and get a professional portfolio with customizable themes.

## Current State

**Status**: MVP Complete with Frontend + Backend Integration

The application includes:
- ✅ Complete data model with PostgreSQL database (Users, Portfolios, Projects, Integrations, SyncJobs)
- ✅ Beautiful frontend with 4 professional themes (Sleek, CardGrid, Terminal, Magazine)
- ✅ Dashboard with 5 tabs (Overview, Repos, Appearance, Billing, Publishing)
- ✅ Theme customization with accent colors and drag-n-drop project ordering
- ✅ Public portfolio pages at /u/[handle]
- ✅ Dark mode support with ThemeProvider
- ✅ Database seed script with demo user and 3 sample projects
- ✅ Backend API routes for portfolio data
- ✅ Comprehensive README and .env.example

## Recent Changes

- **2025-01-17**: Built complete MVP with all frontend components and backend infrastructure
- **2025-01-17**: Created 4 polished themes following design_guidelines.md
- **2025-01-17**: Integrated frontend with backend API using TanStack Query
- **2025-01-17**: Added database seed script with demo portfolio at /u/demo

## Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: TanStack Query for server state
- **Theme Engine**: Custom theme system with 4 templates

### Backend (Express + Drizzle)
- **Server**: Express.js
- **ORM**: Drizzle with PostgreSQL
- **Database**: Replit PostgreSQL (Neon-backed)
- **Storage Layer**: Comprehensive IStorage interface with DatabaseStorage implementation

### Data Model
```typescript
Users (id, githubId, handle, name, email, avatarUrl, bio, location, website, plan)
Portfolios (id, userId, themeId, accentColor, isPublic, customDomain, showStats, social)
Projects (id, portfolioId, repoId, name, repoUrl, description, summary, features, images, topics, languages, stars, forks, stack, order)
Integrations (id, userId, provider, accessToken, refreshToken, scopes, etagCache)
SyncJobs (id, userId, repoId, status, error)
```

## Key Features

### For MVP
1. **Authentication** - GitHub OAuth (TODO: NextAuth integration)
2. **Repository Management** - List, search, filter, and select repos
3. **Theme Engine** - 4 responsive themes with customization
4. **Portfolio Publishing** - Public URLs at /u/[handle]
5. **Billing** - Free (6 projects) and Pro plans (30 projects) with Stripe (TODO: integration)

### Themes
1. **Sleek** (Free) - Hero section + grid cards with stats
2. **CardGrid** (Free) - Pinterest-style masonry layout
3. **Terminal** (Pro) - Command-line aesthetic with typing animation
4. **Magazine** (Pro) - Editorial layout with large hero images

## User Preferences

- **Design System**: Following design_guidelines.md with Inter font, JetBrains Mono for code
- **Color Palette**: Primary blue (#3b82f6), developer-focused aesthetics
- **Component Library**: shadcn/ui components exclusively
- **Dark Mode**: Default dark mode with light mode support

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/      # Dashboard tabs
│   │   │   ├── themes/         # 4 portfolio themes
│   │   │   ├── ui/             # shadcn components
│   │   │   ├── ThemeToggle.tsx
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── SignIn.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Portfolio.tsx
│   │   │   └── not-found.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── db.ts               # Database connection
│   ├── storage.ts          # Storage layer
│   ├── routes.ts           # API routes
│   ├── seed.ts             # Database seed script
│   └── index.ts
├── shared/
│   └── schema.ts           # Drizzle schema + types
├── design_guidelines.md    # Design system documentation
├── README.md              # Setup instructions
└── .env.example           # Environment variables template
```

## Environment Setup

Required environment variables (see .env.example):
- `DATABASE_URL` - PostgreSQL connection (auto-configured on Replit)
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret key
- `GITHUB_ID` - GitHub OAuth App Client ID (TODO: setup)
- `GITHUB_SECRET` - GitHub OAuth App Secret (TODO: setup)
- `SESSION_SECRET` - Session encryption secret

Optional (for full features):
- Stripe keys for payments
- Upstash Redis for background jobs

## Next Steps

### To complete full production readiness:

1. **Authentication Integration**
   - Set up NextAuth with GitHub provider
   - Implement session management
   - Add protected routes

2. **GitHub API Integration**
   - Implement real repository sync
   - Add README parsing with remark/rehype
   - Extract features, images, tech stack
   - Implement rate limiting with ETag caching

3. **Stripe Integration**
   - Complete checkout flow
   - Add webhook handling
   - Implement customer portal
   - Add subscription management

4. **Background Jobs**
   - Set up BullMQ with Redis
   - Implement async repo ingestion
   - Add retry logic with exponential backoff

5. **Testing**
   - Unit tests for README parser
   - API route tests
   - Playwright E2E tests for critical flows

## Demo Access

The application includes a pre-seeded demo portfolio:
- **URL**: /u/demo
- **User**: Alex Johnson (@demo)
- **Projects**: 3 sample projects with images and metadata

Run `tsx server/seed.ts` to reset demo data.

## Deployment

The app is configured to run on Replit:
1. Database auto-configured with Replit PostgreSQL
2. Single `npm run dev` command starts both frontend and backend
3. Environment secrets managed through Replit Secrets

## Notes

- All frontend components follow design_guidelines.md for visual consistency
- Using DatabaseStorage instead of MemStorage for persistence
- Image assets stored in attached_assets/ and served via @assets alias
- Dark mode preference persisted to localStorage
- Portfolio data cached with TanStack Query
