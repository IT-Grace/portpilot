import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// GitHub API function to fetch repositories
async function fetchGitHubRepositories(accessToken: string): Promise<any[]> {
  const response = await fetch(
    "https://api.github.com/user/repos?type=owner&sort=updated&per_page=50",
    {
      headers: {
        Authorization: `token ${accessToken}`,
        "User-Agent": "PortPilot/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return await response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // TODO: NextAuth will handle /api/auth/* routes

  // User API - Get current authenticated user
  app.get("/api/user/me", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        name: user.name,
        handle: user.handle,
        email: user.email,
        avatarUrl: user.image,
        plan: user.plan,
      });
    } catch (error: any) {
      console.error("Error getting current user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Dashboard API - Get user's dashboard data
  app.get("/api/dashboard", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get user's portfolio
      const portfolio = await storage.getPortfolio(userId);
      let projects: any[] = [];

      if (portfolio) {
        projects = await storage.getProjects(portfolio.id);
      }

      // Calculate stats
      const totalStars = projects.reduce(
        (sum, project) => sum + (project.stars || 0),
        0
      );
      const totalForks = projects.reduce(
        (sum, project) => sum + (project.forks || 0),
        0
      );

      const dashboardData = {
        user: {
          name: user.name,
          handle: user.handle,
          plan: user.plan,
        },
        stats: {
          totalProjects: projects.length,
          totalViews: 0, // TODO: Implement view tracking
          totalStars,
          totalForks,
          planName: user.plan === "PRO" ? "Pro" : "Free",
          isPro: user.plan === "PRO",
        },
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          language: p.languages ? Object.keys(p.languages)[0] : null, // Get primary language from languages object
          stars: p.stars || 0,
          forks: p.forks || 0,
          lastUpdated: p.lastUpdated,
          repoUrl: p.repoUrl,
          homepage: p.homepage,
          topics: p.topics || [],
        })),
        recentActivity: [
          // TODO: Implement activity tracking
          {
            type: "sync",
            message: `Synced ${projects.length} repositories`,
            time: "Recently",
          },
        ],
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error("Error getting dashboard data:", error);
      res.status(500).json({ error: "Failed to get dashboard data" });
    }
  });

  // Portfolio API - Get portfolio data for public view
  app.get("/api/portfolio/:handle", async (req, res) => {
    try {
      const { handle } = req.params;

      // Get user by handle
      const user = await storage.getUserByHandle(handle);
      if (!user) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      // Get portfolio
      const portfolio = await storage.getPortfolio(user.id);
      if (!portfolio || !portfolio.isPublic) {
        return res
          .status(404)
          .json({ error: "Portfolio not found or not public" });
      }

      // Get projects
      const projects = await storage.getProjects(portfolio.id);

      // Build portfolio model
      const portfolioModel = {
        user: {
          name: user.name,
          handle: user.handle,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          location: user.location,
          website: user.website,
        },
        projects: projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          summary: p.summary,
          features: p.features || [],
          images: p.images || [],
          languages: p.languages || {},
          topics: p.topics || [],
          stars: p.stars,
          forks: p.forks,
          homepage: p.homepage,
          repoUrl: p.repoUrl,
          lastUpdated: p.lastUpdated,
          stack: p.stack,
        })),
        social: portfolio.social || {},
        layout: {
          themeId: portfolio.themeId,
          accentColor: portfolio.accentColor,
          showStats: portfolio.showStats,
        },
      };

      res.json(portfolioModel);
    } catch (error: any) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  // GitHub Repos - List user's repositories
  app.get("/api/github/repos", async (req, res) => {
    // TODO: Implement with NextAuth session and GitHub API
    // For now, return mock data
    res.json({
      repos: [],
      lastSync: new Date().toISOString(),
    });
  });

  // Sync - Trigger repository sync
  app.post("/api/sync", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;

      // Get GitHub integration
      const integration = await storage.getIntegration(userId, "github");
      if (!integration) {
        return res
          .status(400)
          .json({
            error: "GitHub integration not found. Please re-authenticate.",
          });
      }

      // Get or create portfolio
      let portfolio = await storage.getPortfolio(userId);
      if (!portfolio) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        portfolio = await storage.createPortfolio({
          userId: user.id,
          themeId: "sleek",
          accentColor: "#3b82f6",
          isPublic: true,
        });
      }

      // Fetch repositories from GitHub
      const repos = await fetchGitHubRepositories(integration.accessToken);

      // Sync repositories to database
      let syncedCount = 0;
      for (const repo of repos) {
        try {
          // Check if project already exists
          const existingProject = await storage.getProjects(portfolio.id);
          const exists = existingProject.some(
            (p) => p.repoUrl === repo.html_url
          );

          if (!exists) {
            await storage.createProject({
              portfolioId: portfolio.id,
              repoId: repo.id.toString(),
              name: repo.name,
              description: repo.description,
              summary:
                repo.description || `A ${repo.language || "code"} project`,
              repoUrl: repo.html_url,
              homepage: repo.homepage,
              stars: repo.stargazers_count,
              forks: repo.forks_count,
              languages: repo.language ? { [repo.language]: 100 } : {},
              topics: repo.topics || [],
              features: [],
              images: [],
              lastUpdated: new Date(repo.updated_at),
            });
            syncedCount++;
          }
        } catch (error) {
          console.error(`Error syncing repo ${repo.name}:`, error);
        }
      }

      res.json({
        success: true,
        message: `Synced ${syncedCount} new repositories`,
        totalRepos: repos.length,
        syncedCount,
      });
    } catch (error: any) {
      console.error("Error syncing repositories:", error);
      res.status(500).json({ error: "Failed to sync repositories" });
    }
  });

  // Portfolio Management - Update theme
  app.post("/api/portfolio/theme", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;
      const { themeId, accentColor } = req.body;

      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      const updated = await storage.updatePortfolio(portfolio.id, {
        themeId,
        accentColor,
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error updating theme:", error);
      res.status(500).json({ error: "Failed to update theme" });
    }
  });

  // Portfolio Management - Update project order
  app.post("/api/portfolio/order", async (req, res) => {
    try {
      const { projectOrders } = req.body; // Array of { projectId, order }

      for (const { projectId, order } of projectOrders) {
        await storage.updateProjectOrder(projectId, order);
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error updating project order:", error);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Stripe Billing - Create checkout session
  app.post("/api/billing/checkout", async (req, res) => {
    // TODO: Implement Stripe Checkout
    res.json({ url: "https://checkout.stripe.com/placeholder" });
  });

  // Stripe Billing - Webhook
  app.post("/api/billing/webhook", async (req, res) => {
    // TODO: Implement Stripe webhook handling
    res.json({ received: true });
  });

  // GitHub Webhook - Receive updates
  app.post("/api/webhooks/github", async (req, res) => {
    // TODO: Verify signature and process webhook
    res.json({ received: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
