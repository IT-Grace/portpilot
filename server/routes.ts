import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import path from "path";
import { ProjectAnalyzer } from "./services/projectAnalyzer";
import { storage } from "./storage";
import { deleteFile, getFileUrl, imageUpload } from "./utils/fileUpload";

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
          summary: p.summary,
          detailedDescription: p.detailedDescription,
          features: p.features || [],
          images: p.images || [],
          language: p.languages ? Object.keys(p.languages)[0] : null, // Get primary language from languages object
          stars: p.stars || 0,
          forks: p.forks || 0,
          lastUpdated: p.lastUpdated,
          lastAnalyzed: p.lastAnalyzed,
          analyzed: p.analyzed || false,
          repoUrl: p.repoUrl,
          homepage: p.homepage,
          topics: p.topics || [],
          stack: p.stack,
          selected: p.selected !== false, // Default to true if not set
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

      // Get projects (only selected ones for public portfolio)
      const allProjects = await storage.getProjects(portfolio.id);
      const selectedProjects = allProjects.filter((p) => p.selected === true);

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
        projects: selectedProjects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          summary: p.summary,
          detailedDescription: p.detailedDescription,
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
        return res.status(400).json({
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
      let updatedCount = 0;
      let removedCount = 0;
      const existingProjects = await storage.getProjects(portfolio.id);

      // Create a set of current GitHub repo URLs for efficient lookup
      const currentRepoUrls = new Set(repos.map((repo) => repo.html_url));

      // Remove projects that no longer exist on GitHub
      for (const project of existingProjects) {
        if (project.repoUrl && !currentRepoUrls.has(project.repoUrl)) {
          try {
            await storage.deleteProject(project.id);
            removedCount++;
            console.log(
              `Removed project ${project.name} (no longer exists on GitHub)`
            );
          } catch (error) {
            console.error(`Error removing project ${project.name}:`, error);
          }
        }
      }

      // Refresh existing projects list after removals
      const updatedExistingProjects = await storage.getProjects(portfolio.id);

      for (const repo of repos) {
        try {
          // Check if project already exists
          const existingProject = updatedExistingProjects.find(
            (p) => p.repoUrl === repo.html_url
          );

          if (!existingProject) {
            // Create new project
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
              analyzed: false,
            });
            syncedCount++;
          } else {
            // Update existing project with latest data from GitHub
            const repoLastUpdated = new Date(repo.updated_at);
            const projectLastUpdated = existingProject.lastUpdated
              ? new Date(existingProject.lastUpdated)
              : new Date(0); // Use epoch if null

            // Check if the repo has been updated since we last synced
            const hasContentUpdates = repoLastUpdated > projectLastUpdated;
            const hasMetadataUpdates =
              existingProject.stars !== repo.stargazers_count ||
              existingProject.forks !== repo.forks_count ||
              existingProject.description !== repo.description;

            if (hasContentUpdates || hasMetadataUpdates) {
              const updateData: any = {
                name: repo.name,
                description: repo.description,
                summary: repo.description || existingProject.summary,
                homepage: repo.homepage,
                stars: repo.stargazers_count,
                forks: repo.forks_count,
                languages: repo.language
                  ? { [repo.language]: 100 }
                  : existingProject.languages,
                topics: repo.topics || [],
                lastUpdated: repoLastUpdated,
              };

              // If repo content was updated (not just metadata), mark as needing re-analysis
              if (hasContentUpdates) {
                console.log(
                  `Repo ${repo.name} has been updated and may need re-analysis`
                );
              }

              await storage.updateProject(existingProject.id, updateData);
              updatedCount++;
            }
          }
        } catch (error) {
          console.error(`Error syncing repo ${repo.name}:`, error);
        }
      }

      const message = [
        syncedCount > 0 ? `${syncedCount} new repositories` : null,
        updatedCount > 0 ? `${updatedCount} updated repositories` : null,
        removedCount > 0 ? `${removedCount} removed repositories` : null,
      ]
        .filter(Boolean)
        .join(", ");

      res.json({
        success: true,
        message: message
          ? `Synced ${message}`
          : "All repositories are up to date",
        totalRepos: repos.length,
        syncedCount,
        updatedCount,
        removedCount,
      });
    } catch (error: any) {
      console.error("Error syncing repositories:", error);
      res.status(500).json({ error: "Failed to sync repositories" });
    }
  });

  // Project Analysis - Analyze repository with AI
  app.post("/api/projects/:projectId/analyze", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { projectId } = req.params;
      const userId = (req.user as any).id;

      // Get the project and verify ownership
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      // Verify user owns this project through portfolio
      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio || project.portfolioId !== portfolio.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Extract GitHub repo info from project.repoUrl
      const repoMatch = project.repoUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+)/
      );
      if (!repoMatch) {
        return res.status(400).json({ error: "Invalid GitHub repository URL" });
      }

      const [, owner, repo] = repoMatch;

      // Check if OpenAI API key is configured
      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({
          error:
            "AI analysis not configured. Please add OPENAI_API_KEY to environment variables.",
        });
      }

      // Validate OpenAI API key format
      if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
        return res.status(400).json({
          error:
            "Invalid OpenAI API key format. Please check your OPENAI_API_KEY environment variable.",
        });
      }

      // Get GitHub access token for API calls
      const integration = await storage.getIntegration(userId, "github");
      if (!integration) {
        return res.status(400).json({
          error:
            "GitHub integration not found. Please reconnect your GitHub account.",
        });
      }

      const accessToken = integration.accessToken;

      // Use ProjectAnalyzer
      const analyzer = new ProjectAnalyzer(
        process.env.OPENAI_API_KEY,
        accessToken
      );

      // Perform AI analysis with fallback
      let analysis;
      try {
        analysis = await analyzer.analyzeRepository(
          owner,
          repo.replace(".git", "")
        );
      } catch (aiError) {
        console.error("AI analysis failed, using fallback:", aiError);

        // Fallback analysis if AI fails
        analysis = {
          summary: `${project.name} is a ${
            project.description || "software project"
          } that demonstrates modern development practices. This project showcases technical expertise and attention to detail in software development.`,
          detailedDescription: `${project.name} represents a well-architected ${
            project.description || "software solution"
          } built with modern development practices and industry standards.\n\nThe project demonstrates strong technical implementation using ${
            Object.keys(project.languages || {})[0] || "modern technologies"
          } and follows established patterns for maintainable code. The architecture supports scalability and follows best practices for software development.\n\nWith ${
            project.stars
          } stars and ${
            project.forks
          } forks on GitHub, this project shows community engagement and demonstrates the developer's ability to create valuable, reusable software solutions. The codebase reflects attention to detail and professional development standards.\n\nThis project serves as an excellent example of modern software development practices and showcases technical capabilities in ${
            Object.keys(project.languages || {})[0] || "software engineering"
          }.`,
          features: [
            "Well-structured and maintainable codebase",
            "Modern development practices and patterns",
            project.description
              ? "Comprehensive project documentation"
              : "Professional development standards",
            `Built with ${
              Object.keys(project.languages || {})[0] || "modern technologies"
            }`,
            "Community engagement and open-source contribution",
          ].slice(0, 5),
          techStack: {
            framework: Object.keys(project.languages || {})[0] || "JavaScript",
            runtime: "Node.js",
            packageManager: "npm",
          },
          projectType: "web-app" as const,
          suggestedImages: [
            {
              type: "interface",
              prompt: `A professional, clean interface for ${project.name} showing its main dashboard with modern UI elements, clean typography, and intuitive navigation`,
            },
            {
              type: "screenshot",
              prompt: `A detailed view of ${project.name} application interface showcasing key features and functionality with modern design patterns`,
            },
          ],
          demoUrl: project.homepage || undefined,
          keyInsights: [
            `This project showcases expertise in ${
              Object.keys(project.languages || {})[0] || "software development"
            } and modern development practices`,
            `Repository demonstrates professional code quality with ${project.stars} stars and active community engagement`,
            `Architecture follows industry best practices for scalable and maintainable software solutions`,
          ],
        };
      }

      // Update project with analysis results (keeping existing manually uploaded images)
      const updatedProject = await storage.updateProject(projectId, {
        summary: analysis.summary,
        detailedDescription: analysis.detailedDescription,
        features: (analysis as any).keyFeatures || analysis.features || [], // Handle both field names
        stack: analysis.techStack,
        lastAnalyzed: new Date(),
        analyzed: true,
        // Keep existing images - they are manually managed now
      });

      res.json({
        success: true,
        analysis,
        project: updatedProject,
      });
    } catch (error: any) {
      console.error("Error analyzing project:", error);
      res.status(500).json({
        error: error.message || "Failed to analyze project",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  // Project Images - Upload image file to project
  app.post(
    "/api/projects/:projectId/images",
    imageUpload.single("image"),
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { projectId } = req.params;
        const { alt } = req.body;
        const userId = (req.user as any).id;

        if (!req.file) {
          return res.status(400).json({ error: "No image file provided" });
        }

        // Verify ownership
        const project = await storage.getProject(projectId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        const portfolio = await storage.getPortfolio(userId);
        if (!portfolio || project.portfolioId !== portfolio.id) {
          return res.status(403).json({ error: "Access denied" });
        }

        // Add image to project
        const currentImages = project.images || [];
        const imageUrl = getFileUrl(req.file.filename);
        const newImages = [
          ...currentImages,
          {
            url: imageUrl,
            alt: alt || req.file.originalname,
            filename: req.file.filename, // Store filename for deletion
          },
        ];

        const updatedProject = await storage.updateProject(projectId, {
          images: newImages,
        });

        res.json({ success: true, project: updatedProject });
      } catch (error: any) {
        console.error("Error uploading image:", error);

        // Clean up uploaded file on error
        if (req.file) {
          deleteFile(req.file.filename);
        }

        // Handle multer errors specifically
        if (error.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .json({ error: "File size too large. Maximum size is 5MB." });
        }
        if (error.message.includes("Only image files are allowed")) {
          return res.status(400).json({ error: error.message });
        }

        res.status(500).json({ error: "Failed to upload image" });
      }
    }
  );

  // Project Images - Remove image from project
  app.delete(
    "/api/projects/:projectId/images/:imageIndex",
    async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Not authenticated" });
        }

        const { projectId, imageIndex } = req.params;
        const userId = (req.user as any).id;

        // Verify ownership
        const project = await storage.getProject(projectId);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }

        const portfolio = await storage.getPortfolio(userId);
        if (!portfolio || project.portfolioId !== portfolio.id) {
          return res.status(403).json({ error: "Access denied" });
        }

        // Remove image from project
        const currentImages = project.images || [];
        const index = parseInt(imageIndex);

        if (index < 0 || index >= currentImages.length) {
          return res.status(400).json({ error: "Invalid image index" });
        }

        const imageToDelete = currentImages[index] as {
          url: string;
          alt: string;
          filename?: string;
        };

        // Delete physical file if it has a filename (uploaded file)
        if (imageToDelete.filename) {
          deleteFile(imageToDelete.filename);
        }

        const newImages = currentImages.filter((_, i) => i !== index);

        const updatedProject = await storage.updateProject(projectId, {
          images: newImages,
        });

        res.json({ success: true, project: updatedProject });
      } catch (error: any) {
        console.error("Error removing image:", error);
        res.status(500).json({ error: "Failed to remove image" });
      }
    }
  );

  // Project Management - Update project details
  app.put("/api/projects/:projectId", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { projectId } = req.params;
      const { name, description, detailedDescription, features, technologies } =
        req.body;
      const userId = (req.user as any).id;

      // Verify ownership
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio || project.portfolioId !== portfolio.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Update project
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (detailedDescription !== undefined)
        updateData.detailedDescription = detailedDescription;
      if (features !== undefined) updateData.features = features;
      if (technologies !== undefined) updateData.technologies = technologies;

      const updatedProject = await storage.updateProject(projectId, updateData);

      res.json({ success: true, project: updatedProject });
    } catch (error: any) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Portfolio Management - Update project selection
  app.post("/api/portfolio/projects/selection", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;
      const { projectId, selected } = req.body;

      // Get user's portfolio to verify ownership
      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      // Update the project's selected status
      const updatedProject = await storage.updateProject(projectId, {
        selected: selected,
      });

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json({ success: true, project: updatedProject });
    } catch (error: any) {
      console.error("Error updating project selection:", error);
      res.status(500).json({ error: "Failed to update project selection" });
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

  // Portfolio Management - Update portfolio settings (visibility, etc.)
  app.post("/api/portfolio/settings", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { isPublic } = req.body;
      const userId = (req.user as any).id;

      // Get user's portfolio
      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      // Update portfolio visibility
      const updated = await storage.updatePortfolioVisibility(
        portfolio.id,
        isPublic
      );

      res.json({ success: true, portfolio: updated });
    } catch (error: any) {
      console.error("Error updating portfolio settings:", error);
      res.status(500).json({ error: "Failed to update portfolio settings" });
    }
  });

  // Portfolio Management - Update custom domain (Pro only)
  app.post("/api/portfolio/custom-domain", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { customDomain } = req.body;
      const userId = (req.user as any).id;

      // Get user to check if they have Pro plan
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.plan !== "PRO") {
        return res
          .status(403)
          .json({ error: "Custom domains are only available for Pro users" });
      }

      // Get user's portfolio
      const portfolio = await storage.getPortfolio(userId);
      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      // Update custom domain
      const updated = await storage.updatePortfolio(portfolio.id, {
        customDomain,
      });

      res.json({ success: true, portfolio: updated });
    } catch (error: any) {
      console.error("Error updating custom domain:", error);
      res.status(500).json({ error: "Failed to update custom domain" });
    }
  });

  // Get authenticated user's portfolio data (private)
  app.get("/api/portfolio", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;
      const portfolio = await storage.getPortfolio(userId);

      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      res.json({
        id: portfolio.id,
        isPublic: portfolio.isPublic,
        customDomain: portfolio.customDomain,
        themeId: portfolio.themeId,
        accentColor: portfolio.accentColor,
        showStats: portfolio.showStats,
        social: portfolio.social,
      });
    } catch (error: any) {
      console.error("Error getting user portfolio:", error);
      res.status(500).json({ error: "Failed to get portfolio" });
    }
  });

  // Stripe Billing - Create checkout session
  app.post("/api/billing/checkout", async (req, res) => {
    // TODO: Implement Stripe Checkout
    res.json({ url: "https://checkout.stripe.com/placeholder" });
  });

  // Development Login Endpoints (only in development)
  if (process.env.NODE_ENV === "development") {
    app.post("/api/dev/login", async (req, res) => {
      try {
        console.log("Development login request received:", req.body);
        const { userType } = req.body;

        if (!userType || !["free", "pro"].includes(userType)) {
          return res
            .status(400)
            .json({ error: "Invalid user type. Must be 'free' or 'pro'" });
        }

        let handle: string;
        let plan: "FREE" | "PRO";

        if (userType === "pro") {
          handle = "dev-pro-user";
          plan = "PRO";
        } else {
          handle = "dev-free-user";
          plan = "FREE";
        }

        console.log(`Attempting to get user with handle: ${handle}`);
        // Check if development user exists, create if not
        let user = await storage.getUserByHandle(handle);

        if (!user) {
          console.log(`Creating new development user: ${handle}`);
          // Create development user
          const userData = {
            githubId: `dev-${userType}-${Date.now()}`,
            handle,
            name:
              userType === "pro"
                ? "Pro Development User"
                : "Free Development User",
            email: `dev-${userType}@portpilot.dev`,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userType}`,
            bio: `Development ${plan.toLowerCase()} user for testing PortPilot features`,
            location: "Development Environment",
            website: "https://portpilot.dev",
            plan,
          };

          user = await storage.createUser(userData);
          console.log(`Created user:`, user.id, user.handle);

          // Create portfolio for the user
          const portfolioData = {
            userId: user.id,
            themeId: userType === "pro" ? "terminal" : "sleek",
            accentColor: userType === "pro" ? "#00ff00" : "#3b82f6",
            isPublic: true,
            showStats: true,
            social: {
              github: `https://github.com/dev-${userType}`,
              x: `https://x.com/dev_${userType}`,
              linkedin: `https://linkedin.com/in/dev-${userType}`,
              website: "https://portpilot.dev",
            },
          };

          const portfolio = await storage.createPortfolio(portfolioData);
          console.log(`Created portfolio:`, portfolio.id);
        } else {
          console.log(`Using existing user: ${user.handle} (${user.plan})`);
          // Update plan if it's different
          if (user.plan !== plan) {
            console.log(`Updating user plan from ${user.plan} to ${plan}`);
            await storage.updateUser(user.id, { plan });
          }
        }

        // Log the user in
        console.log(`Attempting to log in user: ${user.handle}`);
        req.login(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res
              .status(500)
              .json({ error: "Login failed", details: err.message });
          }
          console.log(
            `Successfully logged in user: ${user.handle} (${user.plan})`
          );
          res.json({
            success: true,
            user: {
              id: user.id,
              handle: user.handle,
              name: user.name,
              plan: user.plan,
            },
          });
        });
      } catch (error: any) {
        console.error("Error during dev login:", error);
        res.status(500).json({
          error: "Development login failed",
          details: error.message,
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        });
      }
    });

    app.post("/api/dev/logout", async (req, res) => {
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        res.json({ success: true });
      });
    });
  }

  // Migration endpoint to fix analyzed field for existing projects
  app.post("/api/migrate-analyzed", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const userId = (req.user as any).id;
      const portfolio = await storage.getPortfolio(userId);

      if (!portfolio) {
        return res.status(404).json({ error: "Portfolio not found" });
      }

      const projects = await storage.getProjects(portfolio.id);
      let updated = 0;

      for (const project of projects) {
        const hasAiContent = !!(
          project.detailedDescription ||
          (project.features && project.features.length > 0)
        );

        if (hasAiContent && !project.analyzed) {
          await storage.updateProject(project.id, {
            analyzed: true,
            lastAnalyzed: project.lastAnalyzed || new Date(),
          });
          updated++;
        }
      }

      res.json({
        success: true,
        message: `Updated ${updated} projects with analyzed field`,
        updatedCount: updated,
      });
    } catch (error: any) {
      console.error("Error migrating analyzed field:", error);
      res.status(500).json({ error: "Failed to migrate analyzed field" });
    }
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

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  const httpServer = createServer(app);

  return httpServer;
}
