import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // TODO: NextAuth will handle /api/auth/* routes
  
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
        return res.status(404).json({ error: "Portfolio not found or not public" });
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
        projects: projects.map(p => ({
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
    // TODO: Implement with job queue
    res.json({ success: true, message: "Sync started" });
  });

  // Portfolio Management - Update theme
  app.post("/api/portfolio/theme", async (req, res) => {
    try {
      // TODO: Get userId from session
      const userId = "demo-user-id";
      
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
