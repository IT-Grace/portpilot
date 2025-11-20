import dotenv from "dotenv";

// Load environment variables from .env file only if DATABASE_URL is not already set
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

import { portfolios, projects, users } from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "./db";

async function seed() {
  console.log("🌱 Seeding database...");

  // Determine if this is production-local environment
  const isProdLocal =
    process.env.NODE_ENV === "production" ||
    process.env.DATABASE_URL?.includes("5434");

  // Create admin users for production-local testing
  if (isProdLocal) {
    console.log("\n👑 Creating admin users for production-local testing...");

    // Admin on PRO plan
    const adminProHandle = "admin-pro";
    let adminPro = await db.query.users.findFirst({
      where: eq(users.handle, adminProHandle),
    });

    if (!adminPro) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      [adminPro] = await db
        .insert(users)
        .values({
          handle: adminProHandle,
          name: "Admin Pro",
          email: "admin-pro@portpilot.local",
          password: hashedPassword,
          role: "admin",
          plan: "PRO",
          bio: "Administrator account with PRO plan for testing",
          avatarUrl: null,
        })
        .returning();

      console.log(
        "✅ Created admin-pro user (username: admin-pro, password: Admin@123)"
      );
    } else {
      console.log("ℹ️  admin-pro user already exists");
    }

    // Admin on FREE plan
    const adminFreeHandle = "admin-free";
    let adminFree = await db.query.users.findFirst({
      where: eq(users.handle, adminFreeHandle),
    });

    if (!adminFree) {
      const hashedPassword = await bcrypt.hash("Admin@123", 10);
      [adminFree] = await db
        .insert(users)
        .values({
          handle: adminFreeHandle,
          name: "Admin Free",
          email: "admin-free@portpilot.local",
          password: hashedPassword,
          role: "admin",
          plan: "FREE",
          bio: "Administrator account with FREE plan for testing",
          avatarUrl: null,
        })
        .returning();

      console.log(
        "✅ Created admin-free user (username: admin-free, password: Admin@123)"
      );
    } else {
      console.log("ℹ️  admin-free user already exists");
    }
  }

  // Check if demo user already exists
  let user = await db.query.users.findFirst({
    where: eq(users.handle, "demo"),
  });

  if (user) {
    console.log("ℹ️  Demo user already exists, skipping user creation");
  } else {
    // Create demo user
    [user] = await db
      .insert(users)
      .values({
        githubId: "demo-github-id",
        handle: "demo",
        name: "Alex Johnson",
        email: "demo@portpilot.app",
        avatarUrl: null,
        bio: "Full-stack developer passionate about building beautiful, functional web applications. I love open source and sharing knowledge with the community.",
        location: "San Francisco, CA",
        website: "https://alexjohnson.dev",
        plan: "FREE",
      })
      .returning();

    console.log("✅ Created demo user");
  }

  // Check if portfolio already exists for demo user
  let portfolio = await db.query.portfolios.findFirst({
    where: eq(portfolios.userId, user.id),
  });

  if (portfolio) {
    console.log(
      "ℹ️  Demo portfolio already exists, skipping portfolio creation"
    );
  } else {
    // Create portfolio
    [portfolio] = await db
      .insert(portfolios)
      .values({
        userId: user.id,
        themeId: "sleek",
        accentColor: "#3b82f6",
        isPublic: true,
        showStats: true,
        social: {
          github: "https://github.com/demo",
          x: "https://x.com/demo",
          linkedin: "https://linkedin.com/in/demo",
          website: "https://alexjohnson.dev",
        },
      })
      .returning();

    console.log("✅ Created portfolio");
  }

  // Create sample projects
  const projectsData: Array<{
    portfolioId: string;
    repoId: string;
    name: string;
    repoUrl: string;
    homepage: string | null;
    description: string;
    summary: string;
    features: string[];
    images: Array<{ url: string; alt: string }>;
    topics: string[];
    languages: Record<string, number>;
    stars: number;
    forks: number;
    lastUpdated: Date;
    stack: Record<string, any>;
    order: number;
  }> = [
    {
      portfolioId: portfolio.id,
      repoId: "demo-repo-1",
      name: "awesome-react-dashboard",
      repoUrl: "https://github.com/demo/awesome-react-dashboard",
      homepage: "https://dashboard-demo.com",
      description:
        "A modern, feature-rich dashboard built with React and TypeScript",
      summary:
        "This dashboard provides a complete admin interface with real-time data visualization, user management, and customizable widgets.",
      features: [
        "Real-time data updates",
        "Customizable dashboard widgets",
        "Role-based access control",
        "Dark mode support",
        "Responsive design",
      ],
      images: [
        {
          url: "/assets/generated_images/Developer_dashboard_project_screenshot_971254ae.png",
          alt: "Dashboard screenshot",
        },
      ],
      topics: ["react", "typescript", "dashboard", "admin"],
      languages: { TypeScript: 45000, JavaScript: 12000, CSS: 5000 },
      stars: 24,
      forks: 5,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      stack: {
        framework: "React",
        runtime: "Node.js",
        packageManager: "npm",
        docker: true,
      },
      order: 0,
    },
    {
      portfolioId: portfolio.id,
      repoId: "demo-repo-2",
      name: "ecommerce-mobile-app",
      repoUrl: "https://github.com/demo/ecommerce-mobile-app",
      homepage: null,
      description:
        "Full-stack mobile e-commerce application with payment integration",
      summary:
        "A complete e-commerce solution with product catalog, shopping cart, payment processing, and order management.",
      features: [
        "Stripe payment integration",
        "Product search and filters",
        "Shopping cart management",
        "Order tracking",
        "Push notifications",
      ],
      images: [
        {
          url: "/assets/generated_images/E-commerce_mobile_app_screenshot_fcbf7ae1.png",
          alt: "Mobile app screenshot",
        },
      ],
      topics: ["react-native", "ecommerce", "stripe", "mobile"],
      languages: { JavaScript: 38000, TypeScript: 15000, CSS: 8000 },
      stars: 12,
      forks: 3,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      stack: {
        framework: "React Native",
        runtime: "Node.js",
        packageManager: "yarn",
      },
      order: 1,
    },
    {
      portfolioId: portfolio.id,
      repoId: "demo-repo-3",
      name: "cli-tools-collection",
      repoUrl: "https://github.com/demo/cli-tools-collection",
      homepage: null,
      description: "Collection of useful command-line tools for developers",
      summary:
        "A curated set of CLI utilities that boost developer productivity, from file processing to git workflows.",
      features: [
        "Git workflow automation",
        "File processing utilities",
        "Code generation helpers",
        "Development server tools",
      ],
      images: [
        {
          url: "/assets/generated_images/Terminal_CLI_project_screenshot_9b7e9e50.png",
          alt: "CLI tools in action",
        },
      ],
      topics: ["cli", "tools", "python", "developer-tools"],
      languages: { Python: 28000, Shell: 5000 },
      stars: 6,
      forks: 1,
      lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
      stack: {
        runtime: "Python",
        packageManager: "pip",
      },
      order: 2,
    },
  ];

  // Check if projects already exist for this portfolio
  const existingProjects = await db.query.projects.findMany({
    where: eq(projects.portfolioId, portfolio.id),
  });

  if (existingProjects.length > 0) {
    console.log(
      `ℹ️  ${existingProjects.length} demo projects already exist, skipping project creation`
    );
  } else {
    await db.insert(projects).values(projectsData);
    console.log("✅ Created sample projects");
  }

  console.log("\n✨ Seed completed!");
  console.log(`\n🌐 View demo portfolio at: http://localhost:3000/u/demo`);

  // Show admin credentials for production-local
  if (isProdLocal) {
    console.log("\n👤 Admin Credentials for Testing:");
    console.log("   PRO Plan:  username=admin-pro  password=Admin@123");
    console.log("   FREE Plan: username=admin-free password=Admin@123");
  }

  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
