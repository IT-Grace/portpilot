# PortPilot - Next Steps

## Current State Assessment

### ✅ What's Complete

**Database & Infrastructure**
- Complete PostgreSQL schema with Drizzle ORM (users, portfolios, projects, integrations, sync_jobs)
- Database seed script with demo user and 3 sample projects
- Storage layer with comprehensive IStorage interface and DatabaseStorage implementation

**Frontend (Production-Ready)**
- All 4 polished portfolio themes:
  - **Sleek** - Hero section with grid cards
  - **CardGrid** - Pinterest-style masonry layout
  - **Terminal** - Command-line aesthetic with typing animation
  - **Magazine** - Editorial layout with large hero images
- Dashboard UI with 5 tabs (Overview, Repos, Appearance, Billing, Publishing)
- Public portfolio pages at `/u/[handle]` with real API integration
- Beautiful loading states, error handling, and responsive design
- Dark mode support with ThemeProvider
- Design system following design_guidelines.md

**Working Features**
- Demo portfolio viewable at `/u/demo` (fetches from database)
- Theme rendering with all 4 layouts
- Portfolio page with proper loading/error states
- Basic API endpoint: GET `/api/portfolio/:handle`

### ❌ Critical Gaps (MVP Blockers)

**Authentication (Highest Priority)**
- No GitHub OAuth configured (NextAuth not set up)
- No session management or user authentication
- Dashboard is accessible but non-functional without auth
- No user registration or profile sync

**Backend Integration**
- Dashboard tabs use hard-coded mock data instead of real APIs
- No mutations or persistence flows for user actions
- No GitHub API integration for repository syncing
- Missing CRUD endpoints for projects, themes, settings

**Core Features Not Implemented**
- README parser for extracting project metadata
- Repository selection and management
- Theme customization persistence
- Stripe billing integration (checkout, webhooks, portal)
- Background job queue for async processing
- Image asset extraction from repositories

---

## Implementation Roadmap

### Phase 1: Core Authentication & Data Flow (Critical Path)

#### Task 1: GitHub OAuth Authentication
**Delivers**: Users can sign in, create accounts, and access their dashboard

- Set up NextAuth with GitHub provider
- Configure database sessions with express-session
- Add authentication middleware to protect routes
- Implement sign-in/sign-out flows
- Handle user registration with profile sync (name, email, avatar, handle)
- Add session persistence to all dashboard pages

**Dependencies**: None  
**Blocks**: All other features (everything requires auth)

---

#### Task 2: GitHub API Integration
**Delivers**: Users can see their real GitHub repositories

- Implement GitHub REST API client with token management
- Build `/api/repos` endpoint with pagination/filtering/sorting
- Add language detection and topic extraction
- Implement ETag caching for rate limit optimization
- Create `/api/repos/sync` endpoint to refresh repositories
- Handle API errors gracefully with user feedback

**Dependencies**: Task 1 (requires authenticated user tokens)  
**Blocks**: Task 3, Task 4

---

#### Task 3: Repository Selection & Project Management
**Delivers**: Users can select repos to include in their portfolio

- Build `/api/projects` CRUD endpoints (POST, DELETE, PATCH)
- Implement `/api/projects/reorder` for drag-n-drop
- Connect ReposTab to real API with TanStack Query mutations
- Add optimistic updates for instant UI feedback
- Implement project limit enforcement (6 for Free, 30 for Pro)
- Add loading states and error handling

**Dependencies**: Task 2 (requires repo data)  
**Blocks**: Task 4

---

### Phase 2: Content Processing & Publishing

#### Task 4: Automated README Parsing & Ingestion
**Delivers**: Portfolios show rich project details automatically extracted from repos

- Build intelligent README parser:
  - Extract summary from description/first paragraph
  - Parse features lists (bullet points, numbered lists)
  - Detect installation steps and usage examples
  - Extract tech stack from shields.io badges, package.json, etc.
- Implement image asset discovery from README/docs folders
- Resolve relative image URLs to absolute GitHub URLs
- Store parsed data in projects table
- Add fallback logic for repos without READMEs

**Dependencies**: Task 3 (requires selected projects)  
**Blocks**: None (enriches existing data)

---

#### Task 5: Theme Customization & Publishing
**Delivers**: Users can customize appearance and publish portfolios

- Implement `/api/portfolio/theme` endpoint (PATCH)
- Build `/api/portfolio/publish` toggle endpoint
- Add accent color picker persistence
- Connect AppearanceTab to real backend with mutations
- Connect PublishingTab with public/private toggle
- Add theme preview functionality
- Store custom domain field (verification in Phase 3)

**Dependencies**: Task 1 (requires auth)  
**Blocks**: None (independent feature)

---

### Phase 3: Monetization & Performance

#### Task 6: Stripe Billing Integration
**Delivers**: Users can upgrade to Pro plan and manage subscriptions

- Set up Stripe API with test keys (ask user for STRIPE_SECRET_KEY)
- Implement `/api/billing/checkout` for creating checkout sessions
- Build `/api/billing/webhook` handler for subscription events:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Add `/api/billing/portal` for customer portal sessions
- Update user plan status in database
- Connect BillingTab to real Stripe data
- Enforce plan limits (projects, themes) throughout app

**Dependencies**: Task 1 (requires authenticated users)  
**Blocks**: None (monetization layer)

---

#### Task 7: Dashboard Overview & Analytics
**Delivers**: Users see portfolio stats and recent activity

- Connect OverviewTab to real data:
  - Total projects selected
  - Current theme and plan status
  - Portfolio visibility (public/private)
- Add recent activity feed from sync_jobs table
- Implement quick actions:
  - Sync repositories button
  - Publish/unpublish toggle
  - Theme switcher
- Show project selection progress bar
- Add welcome state for new users

**Dependencies**: Tasks 1-3 (requires auth and project data)  
**Blocks**: None (dashboard feature)

---

#### Task 8: Background Job Queue (BullMQ + Redis)
**Delivers**: Heavy operations run asynchronously without blocking UI

- Install BullMQ and configure Upstash Redis connection
- Create job processors:
  - `repo-ingestion`: Parse README, fetch images, extract metadata
  - `portfolio-rebuild`: Regenerate OG images and static assets
- Implement job status tracking in sync_jobs table
- Add retry logic with exponential backoff
- Handle GitHub API rate limiting gracefully
- Display job progress in dashboard with live updates

**Dependencies**: Task 4 (README parsing logic)  
**Note**: Requires user to provide Redis credentials (Upstash free tier)

---

### Phase 4: Testing & Validation

#### Task 9: End-to-End Testing
**Delivers**: Confidence that core user journey works

Test complete flow using Playwright:
1. Sign in with GitHub OAuth
2. Sync repositories from GitHub
3. Select 3 projects to include
4. Customize theme and accent color
5. Publish portfolio
6. Verify public portfolio at `/u/[handle]` displays correctly
7. Test theme switching
8. Verify responsive design on mobile

**Dependencies**: Tasks 1-5 (requires complete feature set)

---

### Phase 5: Advanced Features (Next Phase)

#### Task 10: GitHub Webhook Integration
**Delivers**: Portfolios update automatically when repos change

- Implement `/api/webhooks/github` endpoint
- Add HMAC signature verification for security
- Handle events:
  - `push` - Update repo metadata
  - `repository.edited` - Sync name/description/topics
  - `release.published` - Add release info
- Register webhook during OAuth flow
- Update projects in real-time

**Dependencies**: Task 2 (GitHub integration)

---

#### Task 11: Custom Domain Mapping
**Delivers**: Users can use their own domains for portfolios

- Add `custom_domains` table with DNS verification fields
- Implement DNS verification logic (TXT/CNAME records)
- Build domain management UI in PublishingTab
- Add domain validation and conflict checking
- Display DNS setup instructions for users
- Handle SSL/TLS certificate provisioning

**Dependencies**: Task 5 (publishing system)

---

#### Task 12: Advanced Portfolio Customization
**Delivers**: More personalized portfolios with custom content

- Add custom About Me section:
  - Markdown editor in dashboard
  - Rich text rendering in themes
- Build Skills showcase:
  - Tag management UI
  - Skill categories and proficiency levels
  - Display in all 4 themes
- Implement Contact form:
  - Email relay service integration
  - Spam protection (reCAPTCHA or Turnstile)
  - Form submission handling

**Dependencies**: Task 1 (requires auth)

---

#### Task 13: Testing Suite
**Delivers**: Automated test coverage for confidence in changes

- Write Vitest unit tests:
  - README parser utilities
  - API route authentication middleware
  - Data validation schemas
  - Helper functions
- Create Playwright E2E tests:
  - Sign-in flow with GitHub OAuth
  - Repository selection and syncing
  - Theme customization
  - Portfolio publishing
  - Public portfolio viewing

**Dependencies**: All features implemented

---

## Critical Path Summary

**Minimum Viable Product (Working App):**
1. Task 1: GitHub OAuth (Required for everything)
2. Task 2: GitHub API Integration (Get user repos)
3. Task 3: Repository Selection (Let users choose projects)
4. Task 5: Theme Customization (Let users personalize)
5. Task 9: Test everything works

**Enhanced MVP (Production-Ready):**
- Add Task 4: README Parsing (Rich content)
- Add Task 6: Stripe Billing (Monetization)
- Add Task 7: Dashboard Overview (Better UX)

**Full Feature Set:**
- Add Task 8: Background Jobs (Performance)
- Add Tasks 10-13: Advanced features and testing

---

## Development Notes

### Current Limitations
- Dashboard is accessible but shows mock data
- Users cannot save any changes (no mutations)
- Only demo portfolio (`/u/demo`) works with real data
- No authentication means anyone can access dashboard
- Stripe integration is UI-only (no actual payment processing)

### Technical Debt
- Replace hard-coded mock data in all dashboard tabs
- Implement proper error boundaries
- Add request validation for all API endpoints
- Set up proper logging and monitoring
- Add rate limiting to public endpoints

### Environment Variables Needed
```env
# Currently Missing (Required)
GITHUB_ID=                    # GitHub OAuth App Client ID
GITHUB_SECRET=                # GitHub OAuth App Secret
NEXTAUTH_SECRET=              # NextAuth encryption key
NEXTAUTH_URL=                 # Application URL

# Optional (For Full Features)
STRIPE_SECRET_KEY=            # Stripe API key
TESTING_STRIPE_SECRET_KEY=    # Stripe test mode key
VITE_STRIPE_PUBLIC_KEY=       # Stripe publishable key
REDIS_URL=                    # Upstash Redis for jobs
```

### Quick Start Commands
```bash
# Run database migrations
npm run db:push

# Seed demo data
tsx server/seed.ts

# Start development server
npm run dev

# View demo portfolio
# Navigate to http://localhost:5000/u/demo
```

---

## Success Metrics

**MVP Complete When:**
- [ ] Users can sign in with GitHub
- [ ] Users can see and select their repositories
- [ ] Users can customize theme and colors
- [ ] Users can publish portfolio at `/u/[handle]`
- [ ] Public portfolios display correctly with selected projects
- [ ] All 4 themes render properly

**Production Ready When:**
- [ ] Stripe payments work (checkout + webhooks)
- [ ] README parsing extracts meaningful content
- [ ] Background jobs process repos asynchronously
- [ ] E2E tests pass for critical flows
- [ ] Error handling covers all edge cases
- [ ] Performance is acceptable (< 2s page loads)

---

*Last Updated: January 17, 2025*
