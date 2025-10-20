# PortPilot 🚀

Auto-generate beautiful developer portfolio sites from your GitHub repositories with AI-powered project analysis.

## ✨ Features

### 🔐 **Authentication & Security**

- GitHub OAuth integration with comprehensive repository access
- Secure session management with Express sessions
- User profile synchronization from GitHub

### 🤖 **AI-Powered Project Analysis**

- **OpenAI GPT-4 Integration** - Automatically generates detailed project descriptions
- **Smart Feature Extraction** - AI identifies key features and capabilities
- **Technology Stack Analysis** - Intelligent detection of frameworks and libraries
- **Professional Insights** - AI-generated key insights and project highlights
- **Re-analysis Detection** - Smart detection when projects need fresh AI analysis after updates

### 📦 **GitHub Repository Management**

- **Automatic Repository Sync** - Import and update projects from GitHub
- **Smart Repository Detection** - Handles repository creation, updates, and removal
- **Metadata Extraction** - Stars, forks, languages, topics, and homepage links
- **Repository Filtering** - Select which repositories to showcase
- **Update Tracking** - Detects when repositories have been modified

### 🎨 **Professional Themes**

- **4 Premium Themes**: Sleek (free), CardGrid (free), Terminal (pro), MagazineTheme (pro)
- **Live Theme Preview** - Real-time theme switching in the dashboard
- **Custom Accent Colors** - Personalize your portfolio appearance
- **Responsive Design** - Mobile-first approach with perfect cross-device compatibility

### 🖼️ **Advanced Media Management**

- **Manual Gallery System** - Upload and manage project images
- **Professional Gallery UI** - Lightbox with hover slideshow effects
- **Image Optimization** - Automatic file validation and cleanup
- **Click-to-View Details** - Interactive image galleries with project modals

### 💳 **Subscription & Billing**

- **Stripe Integration** - Secure payment processing
- **Free & Pro Plans** - Tiered feature access
- **Webhook Handling** - Real-time subscription status updates
- **Plan Limitations** - Automatic enforcement of project and theme limits

### 🌐 **Portfolio Features**

- **Public Portfolio URLs** - Clean, SEO-friendly portfolio pages
- **Custom Domains** - Connect your own domain (Pro feature)
- **Social Media Integration** - GitHub, X (Twitter), LinkedIn, and website links
- **Portfolio Analytics** - View tracking and engagement metrics
- **Project Showcase** - Highlight your best work with detailed descriptions

## 🛠️ Tech Stack

### **Frontend**

- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **shadcn/ui** - High-quality, accessible component library
- **Vite** - Lightning-fast build tool and development server
- **wouter** - Minimalist client-side routing
- **React Hook Form** - Performant forms with validation
- **Zod** - TypeScript-first schema validation

### **Backend**

- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Full-stack type safety
- **Drizzle ORM** - Type-safe database operations with relations
- **PostgreSQL** - Robust relational database
- **Express Sessions** - Secure session management
- **Passport.js** - GitHub OAuth authentication
- **Multer** - File upload handling for images

### **AI & External APIs**

- **OpenAI GPT-4** - Advanced AI for project analysis and content generation
- **GitHub API** - Repository data fetching and synchronization
- **Stripe API** - Payment processing and subscription management

### **Infrastructure**

- **Session Storage** - PostgreSQL-backed session persistence
- **File Storage** - Local file system with static serving
- **Environment Configuration** - dotenv for secure configuration management

## 🚀 Getting Started

### Prerequisites

- **Node.js 20+** - Latest LTS version recommended
- **PostgreSQL** - Local instance or cloud database (Neon, Supabase, etc.)
- **GitHub OAuth App** - For repository access
- **OpenAI API Key** - For AI-powered project analysis
- **Stripe Account** - For payment processing (optional)

### Installation & Setup

1. **Clone the repository**

```bash
npm install
```

2. **Environment Configuration**

Copy the example environment file and configure all required variables:

```bash
cp .env.example .env
```

3. **Database Setup**

Initialize your PostgreSQL database and push the schema:

```bash
npm run db:push
```

4. **Seed Demo Data**

Create demo user and sample projects:

```bash
npm run seed
```

5. **Start Development Server**

```bash
npm run dev
```

6. **View Demo Portfolio**

Visit http://localhost:3000/u/demo to see the demo portfolio in action.

## ⚙️ Environment Variables

### **Required Configuration**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/portpilot"

# Authentication
AUTH_SECRET="your-32-character-secret-key"
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"

# AI Integration
OPENAI_API_KEY="sk-your-openai-api-key"

# Application
NODE_ENV="development"
PORT="3000"
```

### **Optional Integrations**

```env
# Stripe Payments
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# Session Security
SESSION_SECRET="your-session-encryption-secret"
```

## 🔧 API Integration Setup

### **GitHub OAuth App**

1. Navigate to [GitHub Settings > Developer Settings > OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Configure the application:
   - **Application name**: PortPilot
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env` file

### **OpenAI API Key**

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add the key to your `.env` file as `OPENAI_API_KEY`
4. Ensure you have sufficient credits for GPT-4 usage

### **Stripe Configuration**

1. Create a [Stripe account](https://dashboard.stripe.com/register)
2. Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
3. Create a Pro plan product and price
4. Set up webhook endpoint: `http://localhost:3000/api/billing/webhook`
5. Configure webhook events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

## 📁 Project Structure

```
portpilot/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── dashboard/  # Dashboard-specific components
│   │   │   ├── themes/     # Portfolio theme components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── contexts/       # React contexts (theme, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── pages/          # Page components
│   ├── index.html          # HTML entry point
│   └── vite.config.ts      # Vite configuration
├── server/                 # Express.js backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Database abstraction layer
│   ├── auth.ts             # Passport.js configuration
│   ├── db.ts               # Database connection
│   ├── seed.ts             # Database seeding script
│   └── index.ts            # Server entry point
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Drizzle ORM schema & types
├── uploads/                # File upload storage
└── attached_assets/        # Static assets
```

## 🎨 Theme System

PortPilot features a sophisticated theme system with 4 professionally designed layouts:

### **Free Themes**

1. **SleekTheme** - Clean, modern design with hero sections and project cards
2. **CardGridTheme** - Pinterest-style masonry layout with hover effects

### **Pro Themes**

3. **TerminalTheme** - Command-line aesthetic with typing animations
4. **MagazineTheme** - Editorial layout with large hero images and typography focus

Each theme is fully responsive and supports:

- Custom accent colors
- Dark/light mode compatibility
- Social media integration
- Project galleries and descriptions
- Live preview in dashboard

## 🤖 AI-Powered Features

### **Project Analysis Engine**

The AI system uses OpenAI's GPT-4 to analyze GitHub repositories and generate:

- **Detailed Descriptions** - Professional project summaries
- **Feature Lists** - Comprehensive capability breakdowns
- **Technology Stack** - Framework and library identification
- **Key Insights** - Strategic project highlights
- **Professional Recommendations** - Improvement suggestions

### **Smart Re-analysis**

- **Change Detection** - Monitors repository updates
- **Intelligent Triggers** - Suggests re-analysis when projects evolve
- **Preserves User Data** - Maintains custom configurations during updates
- **Warning System** - Visual indicators for outdated analysis

## 💎 Subscription Plans

### **Free Plan**

- ✅ Up to 6 projects
- ✅ 2 themes (Sleek, CardGrid)
- ✅ GitHub synchronization
- ✅ AI project analysis
- ✅ Manual image galleries
- ✅ Public portfolio URL

### **Pro Plan** (£9/month)

- ✅ Up to 30 projects
- ✅ All 4 premium themes
- ✅ Custom domain support
- ✅ Advanced analytics
- ✅ Priority AI analysis
- ✅ Remove PortPilot branding
- ✅ Priority support

## 🚀 Deployment

### **Development**

```bash
npm run dev
```

### **Production Build**

```bash
npm run build
npm start
```

### **Docker Deployment**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Database Schema

The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **users** - User accounts and GitHub profiles
- **portfolios** - Portfolio configurations and themes
- **projects** - Repository data and AI analysis results
- **integrations** - Third-party service connections

## 🔄 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run db:push      # Push schema changes to database
npm run seed         # Seed database with demo data
npm run type-check   # Run TypeScript type checking
```

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the inline code comments and TypeScript types
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join our GitHub Discussions for questions and ideas

---

Built with ❤️ using modern web technologies and AI to help developers showcase their work beautifully.
