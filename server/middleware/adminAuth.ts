import type { NextFunction, Request, Response } from "express";
import { storage } from "../storage";

/**
 * Middleware to check if user is authenticated
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !(req.user as any).id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

/**
 * Middleware to check if user has admin role
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !(req.user as any).id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await storage.getUser((req.user as any).id);
  if (!user || user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }

  next();
}

/**
 * Middleware to check if user has moderator or admin role
 */
export async function requireModerator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !(req.user as any).id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await storage.getUser((req.user as any).id);
  if (!user || (user.role !== "moderator" && user.role !== "admin")) {
    return res
      .status(403)
      .json({ error: "Forbidden: Moderator access required" });
  }

  next();
}

/**
 * Middleware to check if user is active (not suspended)
 */
export async function requireActiveAccount(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || !(req.user as any).id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user = await storage.getUser((req.user as any).id);
  if (!user || !user.isActive) {
    return res
      .status(403)
      .json({ error: "Account suspended. Please contact support." });
  }

  next();
}
