# PortPilot 🚀

Auto-generate beautiful developer portfolio sites from your GitHub repositories.

## Features

- 🔐 **GitHub OAuth Authentication** - Sign in with your GitHub account
- 📦 **Automatic Repository Sync** - Import projects from your GitHub repos
- 🎨 **4 Professional Themes** - Sleek, CardGrid, Terminal, and Magazine layouts
- 💎 **Smart README Parsing** - Extracts features, tech stack, and images automatically
- 💳 **Stripe Integration** - Free and Pro plans with subscription management
- 🌐 **Custom Domains** - Connect your own domain (Pro feature)
- 📊 **Portfolio Analytics** - Track views and engagement
- 🎯 **Drag-n-Drop Ordering** - Organize your projects visually

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express + Drizzle ORM
- **Database**: PostgreSQL (Neon)
- **Auth**: NextAuth with GitHub OAuth
- **Payments**: Stripe Checkout + Webhooks
- **Queue**: BullMQ with Upstash Redis

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or use Replit's built-in database)
- GitHub OAuth App
- Stripe account (for payments)

### Setup

1. **Clone and install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

3. **Create GitHub OAuth App**

- Go to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
- Click "New OAuth App"
- Set Authorization callback URL to: `http://localhost:5000/api/auth/callback/github`
- Copy Client ID and Client Secret to `.env`

4. **Configure Stripe**

- Go to [Stripe Dashboard > API Keys](https://dashboard.stripe.com/apikeys)
- Copy Publishable and Secret keys to `.env`
- Create a Pro plan product and price, add Price ID to `.env`
- Set up webhook endpoint: `http://localhost:5000/api/billing/webhook`
- Copy webhook signing secret to `.env`

5. **Set up database**

```bash
npm run db:push
```

6. **Seed demo data**

```bash
npm run seed
```

7. **Start development server**

```bash
npm run dev
```

8. **View demo portfolio**

Open http://localhost:5000/u/demo to see the demo portfolio

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your app URL (e.g., http://localhost:5000)
- `NEXTAUTH_SECRET` - Random secret for NextAuth (min 32 characters)
- `GITHUB_ID` - GitHub OAuth App Client ID
- `GITHUB_SECRET` - GitHub OAuth App Client Secret
- `SESSION_SECRET` - Session encryption secret

### Optional Variables

- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key (for payments)
- `STRIPE_SECRET_KEY` - Stripe secret key (for payments)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `STRIPE_PRICE_ID` - Stripe Price ID for Pro plan
- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL (for background jobs)
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis token

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run seed` - Seed database with demo data
- `npm run db:push` - Push schema changes to database

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   └── seed.ts          # Seed script
├── shared/              # Shared types and schemas
│   └── schema.ts        # Drizzle schema + types
└── attached_assets/     # Static assets
```

## Themes

PortPilot includes 4 professionally designed themes:

1. **Sleek** (Free) - Hero section + grid cards with cover images
2. **CardGrid** (Free) - Pinterest-style masonry layout
3. **Terminal** (Pro) - Command-line aesthetic with typing animation
4. **Magazine** (Pro) - Editorial layout with large hero images

## Plans

### Free Plan
- Up to 6 projects
- 2 themes (Sleek, CardGrid)
- Public portfolio URL
- GitHub sync
- README parsing
- Basic statistics

### Pro Plan (£9/month)
- Up to 30 projects
- All 4 themes
- Custom domain
- Priority sync
- Advanced analytics
- Remove PortPilot branding
- Priority support

## Deployment

This app is designed to run on Replit with a single command:

```bash
npm run dev
```

For production deployment:

1. Set all environment variables
2. Run `npm run build`
3. Start with `npm start`

## Contributing

This is a showcase project. Feel free to fork and customize for your own use!

## License

MIT
