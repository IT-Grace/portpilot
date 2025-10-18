# PortPilot AI Coding Assistant Instructions

## Project Overview
PortPilot is a SaaS platform that auto-generates developer portfolio sites from GitHub repositories. It features a **monolithic Express + React architecture** with shared TypeScript schemas and a **theme-based portfolio rendering system**.

## Architecture & Key Patterns

### Monorepo Structure
- **`client/`**: React frontend (Vite build, wouter routing)
- **`server/`**: Express backend with Drizzle ORM
- **`shared/`**: Common TypeScript schemas and types
- **Aliases**: `@/` → client/src, `@shared/` → shared, `@assets/` → attached_assets

### Database Layer (`shared/schema.ts`)
- **Drizzle ORM** with PostgreSQL, using relations() for type-safe joins
- **Key entities**: users → portfolios → projects (cascade deletes)
- **JSON columns** for flexible data: `features: string[]`, `languages: Record<string, number>`, `social: object`
- **Enums**: `planEnum` (FREE/PRO), `syncStatusEnum` (queued/running/success/error)

### Theme System (`client/src/components/themes/`)
- **4 themes**: SleekTheme (free), CardGridTheme (free), TerminalTheme (pro), MagazineTheme (pro)
- **Pattern**: Each theme accepts `{ data: PortfolioModel }` prop
- **Switching**: URL-based (`/u/:handle/:theme?`) with fallback to user's saved `themeId`
- **Styling**: Uses shadcn/ui components + Tailwind with CSS custom properties for theming

### Data Storage Pattern (`server/storage.ts`)
- **Interface-first**: `IStorage` interface implemented by singleton `storage` object
- **Relations**: Manual joins using Drizzle's `eq()` and relations for type safety
- **Portfolio rendering**: `PortfolioModel` type shapes public API responses

## Development Workflows

### Environment Setup
```bash
npm install                    # Install dependencies
cp .env.example .env          # Configure environment variables
npm run db:push               # Push schema to database
npm run seed                  # Create demo user and portfolio
npm run dev                   # Start development server (TSX + Vite)
```

### Database Changes
```bash
# After editing shared/schema.ts:
npm run db:push               # Push changes directly (no migrations in dev)
```

### Build Process
- **Development**: `tsx server/index.ts` (TypeScript execution)
- **Production**: `vite build` (client) + `esbuild` (server bundle)
- **Output**: `dist/public/` (client), `dist/index.js` (server)

## Component Conventions

### UI Components (`client/src/components/ui/`)
- **shadcn/ui** components with consistent API patterns
- **Compound patterns**: `<Card><CardHeader><CardTitle>` structure
- **Variant props**: Most components accept `variant` and `size` props

### Theme Components
- **Props pattern**: `{ data: PortfolioModel }` for all theme components
- **Layout structure**: Navigation → Hero → Projects grid → Footer
- **Responsive**: Mobile-first with `max-w-7xl mx-auto px-6` containers

### Form Handling
- **react-hook-form** + **zod validation** via `@hookform/resolvers/zod`
- **Pattern**: `useForm({ resolver: zodResolver(schema) })`

## Integration Points

### Authentication Flow
- **GitHub OAuth** handled by NextAuth patterns (TODO: implementation pending)
- **Session management** via Express sessions with PostgreSQL store

### GitHub API Integration
- **Repository sync** via `integrations` table storing access tokens
- **ETags caching** in `etag_cache` JSON column for efficient API calls
- **Background jobs** tracked in `sync_jobs` table

### Stripe Integration
- **Subscription handling** via webhooks at `/api/billing/webhook`
- **Plan limits**: Free (6 projects, 2 themes) vs Pro (30 projects, 4 themes, custom domains)

## Common Patterns

### API Routes (`server/routes.ts`)
- **Public portfolios**: `GET /api/portfolio/:handle` returns `PortfolioModel`
- **Error handling**: Consistent JSON responses with error messages
- **Database queries**: Always use the `storage` interface, never direct Drizzle calls

### Type Safety
- **Shared schemas**: Import types from `@shared/schema`
- **Database operations**: Use `InsertUser`, `User` types from schema
- **API responses**: Shape data using `PortfolioModel` for frontend consumption

### Styling Approach
- **Dark mode first** with `ThemeProvider` context managing light/dark toggle
- **Color system**: CSS custom properties in `index.css` referencing design guidelines
- **Component styling**: Tailwind classes with `cn()` utility for conditional classes

## Key Files for Context
- **`shared/schema.ts`**: Database schema and TypeScript types
- **`server/storage.ts`**: Database abstraction layer
- **`client/src/App.tsx`**: Route definitions and provider setup
- **`design_guidelines.md`**: UI/UX patterns and color system
- **`vite.config.ts`**: Build configuration and aliases