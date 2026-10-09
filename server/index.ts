import dotenv from "dotenv";
dotenv.config();

import connectPgSimple from "connect-pg-simple";
import express, { NextFunction, type Request, Response } from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./auth";
import { injectPortfolioMeta } from "./portfolioMeta";
import { pool } from "./db";
import { registerRoutes } from "./routes";

const app = express();
app.set("env", process.env.NODE_ENV || "development");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session middleware. Sessions live in Postgres so restarts and redeploys
// don't log everyone out.
const PgSessionStore = connectPgSimple(session);

app.use(
  session({
    store: new PgSessionStore({
      pool,
      tableName: "user_sessions",
    }),
    secret:
      process.env.SESSION_SECRET ||
      process.env.AUTH_SECRET ||
      "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    proxy: process.env.NODE_ENV === "production", // Trust proxy in production
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Simple logger utility
const log = (message: string, source = "express") => {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
};

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Auth routes
app.get("/api/auth/signin/github", passport.authenticate("github"));

app.get("/api/auth/github/callback", (req, res, next) => {
  passport.authenticate("github", (err: any, user: any, info: any) => {
    if (err || !user) {
      if (err) console.error("GitHub sign-in failed:", err);
      const reason = info?.message === "suspended" ? "suspended" : "auth_failed";
      return res.redirect(`/signin?error=${reason}`);
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error("GitHub sign-in failed:", loginErr);
        return res.redirect("/signin?error=auth_failed");
      }
      console.log("Successfully authenticated user:", user.handle);
      res.redirect("/dashboard");
    });
  })(req, res, next);
});

app.get("/api/auth/signout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.redirect("/");
  });
});

app.get("/api/auth/session", (req, res) => {
  if (req.user) {
    const { id, handle, name, email, role, plan } = req.user as any;
    res.json({ user: { id, handle, name, email, role, plan } });
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Setup routes based on environment
  console.log(
    `Environment: NODE_ENV=${process.env.NODE_ENV}, app.get('env')=${app.get(
      "env"
    )}`
  );

  if (app.get("env") === "development") {
    console.log("Setting up Vite development server...");
    // Import from vite-dev.ts which has vite dependency
    // Using .js extension for runtime resolution
    const { setupVite } = await import("./vite-dev.js");
    await setupVite(app, server);
  } else {
    console.log("Setting up static file serving for production...");

    // Production static file serving - no vite dependency
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const publicDir = path.join(__dirname, "public");

    log(`Serving static files from: ${publicDir}`);

    // Serve static assets
    app.use(express.static(publicDir));

    // Catch-all route for client-side routing
    const indexPath = path.join(publicDir, "index.html");
    app.use("*", async (req, res) => {
      // Skip API routes - they should have been handled already
      if (req.originalUrl.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      // Public portfolio pages get per-user title/Open Graph tags for link previews
      if (req.originalUrl.startsWith("/u/")) {
        const template = await fs.promises.readFile(indexPath, "utf-8");
        const page = await injectPortfolioMeta(template, req);
        return res.status(200).set({ "Content-Type": "text/html" }).end(page);
      }

      res.sendFile(indexPath);
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => {
    log(`Server listening on port ${port}`);
  });
})();
