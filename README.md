# PortPilot 🚀

Auto-generate developer portfolio sites from your GitHub repositories, with AI-written project descriptions.

Sign in with GitHub, pick the repos you want to show, optionally let AI write them up, choose a theme, and share your portfolio at `/u/<your-github-handle>`.

## ✨ Features

### 🔐 Sign-in

- GitHub OAuth sign-in with **read-only** access (`read:user` scope) — PortPilot never writes to GitHub
- Sessions stored in PostgreSQL, so restarts and redeploys don't sign people out
- Optional username/password login for admin and local production testing

### 📦 GitHub repository sync

- Imports all of your public repositories, including public repos in your organisations
- Updates stars, forks, descriptions, languages and topics on each sync, and handles renamed repos
- Removes projects whose repositories have been deleted
- Choose which projects appear on your portfolio and drag to reorder them

### 🤖 AI project analysis (OpenAI)

- Generates a summary, detailed description, feature list and tech stack for a project
- Reads the README, file structure and dependency manifests (`package.json`, `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`, …)
- Grounded in the repository's contents — no invented features or demo links
- If analysis fails, nothing is saved and the user sees a clear error
- Flags projects that have changed since they were last analysed

### 🎨 Themes

| Theme | Plan | Style |
|---|---|---|
| Sleek | Free | Hero section with project cards |
| CardGrid | Free | Masonry layout with hover details |
| Terminal | Pro | Command-line aesthetic with typing animation |
| Magazine | Pro | Editorial layout with large images |

Accent colours, optional stats, live preview in the dashboard, and a `/u/<handle>/<theme>` URL to preview any theme.

### 🌐 Portfolio pages

- Public URL per user, with per-page titles and Open Graph/Twitter tags so shared links show your name, bio and avatar
- Project image galleries (uploads up to 5MB)
- Portfolio view counter
- Social links (GitHub, X, LinkedIn, website)

### 🛡️ Admin

- `/admin` for users with the `admin` role: user list, plan changes, suspend/unsuspend, delete, and an audit log of admin actions
- Suspended users are signed out immediately and their portfolios are hidden

## 💎 Plans

Limits are enforced on the server.

| | Free | Pro |
|---|---|---|
| Projects on portfolio | 6 | 30 |
| Themes | Sleek, CardGrid | All 4 |
| AI analysis | ✅ | ✅ |
| Custom domain | — | Coming soon |
| Payments (Stripe) | — | Coming soon — upgrade buttons show a notice; admins can change plans in `/admin` |

## 🛠️ Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, wouter, TanStack Query
- **Backend:** Express (one Node process serves the API and the client), Passport (GitHub OAuth + local), express-session with `connect-pg-simple`
- **Data:** PostgreSQL with Drizzle ORM; `shared/schema.ts` is the single source of truth for tables and types
- **Integrations:** GitHub REST API (Octokit), OpenAI (`gpt-5.4-mini` by default)

## 🚀 Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker)
- A GitHub **OAuth App** (see below)
- An OpenAI API key, for AI analysis

### 1. Create a GitHub OAuth App

At [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers) → **New OAuth App**:

- **Homepage URL:** `http://localhost:3000`
- **Authorization callback URL:** `http://localhost:3000/api/auth/github/callback`
- **Expire user access tokens:** leave **unchecked** (PortPilot doesn't refresh tokens yet)

Use a separate OAuth App per environment (dev, prod-local, production) — each only accepts its own callback URL.

> Use an **OAuth App**, not a **GitHub App**. A GitHub App's sign-in only sees repositories where the app is installed.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in `SESSION_SECRET`, `DATABASE_URL`, the three `GITHUB_*` values and `OPENAI_API_KEY`. See [Environment variables](#environment-variables) below.

### 3. Run locally

```bash
npm install
npm run db:migrate   # create tables
npm run seed         # optional: demo user + projects at /u/demo
npm run dev          # API + client with hot reload on http://localhost:3000
```

### Or run with Docker

The Docker Compose files are kept local (they're git-ignored), alongside the committed `Dockerfile`. With `docker-compose.yml` and a `.env.docker` (copied from `.env.example`) in place:

```bash
docker compose -p portpilot-dev up -d --build
```

This starts Postgres (host port 5433), Redis, the app on port 3000 with hot reload, and a one-shot migrator. Use the `-p portpilot-dev` project name every time: without it, the dev stack shares container and volume names with the prod-local stack and will take over its database.

Note that Compose fills `${VAR}` references from the root `.env` file, and those take precedence over `.env.docker` — keep the `GITHUB_*` values in both files in sync.

To seed or promote a user inside the container:

```bash
docker exec portpilot-app-dev npm run seed
docker exec portpilot-app-dev npm run make-admin <github-handle>
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | Signs session cookies — use a long random string |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | ✅ | Must exactly match the OAuth App's callback URL |
| `OPENAI_API_KEY` | For AI analysis | OpenAI key (must start with `sk-`) |
| `OPENAI_MODEL` | — | Override the analysis model (default `gpt-5.4-mini`; must support JSON mode) |
| `PORT` | — | Defaults to `3000` |
| `NODE_ENV` | — | `development` enables Vite dev server and the dev login helper |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` | Docker only | Postgres container credentials |
| `CHOKIDAR_USEPOLLING` | Docker only | `true` makes Vite poll for file changes (set by docker-compose) |

Stripe variables (`STRIPE_*`, `VITE_STRIPE_PUBLIC_KEY`) are placeholders — billing isn't implemented yet.

## 🔄 Scripts

```bash
npm run dev                 # dev server (API + Vite HMR)
npm run build               # build client (dist/public) and server (dist/index.js)
npm start                   # run the production build
npm run check               # TypeScript type check

npm run db:generate         # generate a migration from shared/schema.ts changes
npm run db:migrate          # apply migrations, then verify critical columns
npm run db:migrate:preview  # show pending migration SQL without applying
npm run db:push             # push schema without a migration (dev only)

npm run seed                # demo user + projects (/u/demo)
npm run make-admin <handle> # give a user the admin role
```

There's no test runner yet.

## 🗄️ Database & migrations

1. Edit `shared/schema.ts`
2. `npm run db:generate` — creates a SQL file in `drizzle/`. Rename it to describe its contents (e.g. `0003_add_portfolio_sync_and_views.sql`) and update its `tag` in `drizzle/meta/_journal.json` to match
3. `npm run db:migrate:preview`, then `npm run db:migrate`
4. Commit the SQL file, its snapshot and the journal

Tables: `users`, `portfolios`, `projects`, `integrations` (GitHub tokens), `admin_actions` (audit log), `user_sessions`, plus some unused legacy tables.

More detail: [docs/MIGRATIONS.md](docs/MIGRATIONS.md) and [docs/database-management.md](docs/database-management.md).

## 📁 Project structure

```
client/src/
  pages/                 Route components (Home, SignIn, Dashboard, Portfolio, Admin)
  components/dashboard/  Dashboard tabs (Overview, Repos, Appearance, Billing, Publishing)
  components/themes/     Portfolio themes
  components/ui/         shadcn/ui components
server/
  index.ts               Entry point: sessions, Passport, GitHub OAuth routes
  routes.ts              API routes
  auth.ts                Passport strategies
  storage.ts             Data access layer (routes use this, not db directly)
  portfolioMeta.ts       Server-side meta tags for portfolio link previews
  services/              AI project analyzer
  vite-dev.ts            Dev-only Vite middleware (the only server file that imports vite)
shared/schema.ts         Drizzle schema, insert schemas, shared types, plan limits, theme list
drizzle/                 SQL migrations
```

## 🚢 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/DOCKER.md](docs/DOCKER.md). The production image (`Dockerfile`, `production` target) needs `node_modules`, `dist/`, `shared/` and `drizzle/` at runtime, and migrations should be run (with a backup first — see `scripts/backup.sh`) before starting a new version.

## 🗺️ Roadmap

- Stripe checkout and subscription management
- Custom domains
- Read-only access to private repositories (via a GitHub App)
- Refresh support for expiring GitHub tokens
- Tests
