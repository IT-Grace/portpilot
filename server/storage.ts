import {
  integrations,
  portfolios,
  projects,
  syncJobs,
  users,
  type InsertIntegration,
  type InsertPortfolio,
  type InsertProject,
  type InsertSyncJob,
  type InsertUser,
  type Integration,
  type Portfolio,
  type Project,
  type SyncJob,
  type User,
} from "@shared/schema";
import { and, desc, eq } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  getUserByHandle(handle: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Portfolios
  getPortfolio(userId: string): Promise<Portfolio | undefined>;
  getPortfolioByHandle(handle: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(
    id: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio | undefined>;
  updatePortfolioVisibility(
    portfolioId: string,
    isPublic: boolean
  ): Promise<Portfolio | undefined>;

  // Projects
  getProjects(portfolioId: string): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | undefined>;
  deleteProject(id: string): Promise<void>;
  updateProjectOrder(projectId: string, order: number): Promise<void>;

  // Integrations
  getIntegration(
    userId: string,
    provider: string
  ): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(
    id: string,
    updates: Partial<Integration>
  ): Promise<Integration | undefined>;

  // Sync Jobs
  createSyncJob(job: InsertSyncJob): Promise<SyncJob>;
  updateSyncJob(
    id: string,
    updates: Partial<SyncJob>
  ): Promise<SyncJob | undefined>;
  getUserSyncJobs(userId: string, limit?: number): Promise<SyncJob[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.githubId, githubId));
    return user || undefined;
  }

  async getUserByHandle(handle: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.handle, handle));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(
    id: string,
    updates: Partial<User>
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Portfolios
  async getPortfolio(userId: string): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId));
    return portfolio || undefined;
  }

  async getPortfolioByHandle(handle: string): Promise<Portfolio | undefined> {
    const [result] = await db
      .select({
        portfolio: portfolios,
      })
      .from(portfolios)
      .innerJoin(users, eq(portfolios.userId, users.id))
      .where(eq(users.handle, handle));

    return result?.portfolio || undefined;
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [portfolio] = await db
      .insert(portfolios)
      .values(insertPortfolio as any)
      .returning();
    return portfolio;
  }

  async updatePortfolio(
    id: string,
    updates: Partial<Portfolio>
  ): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .update(portfolios)
      .set(updates)
      .where(eq(portfolios.id, id))
      .returning();
    return portfolio || undefined;
  }

  async updatePortfolioVisibility(
    portfolioId: string,
    isPublic: boolean
  ): Promise<Portfolio | undefined> {
    const [portfolio] = await db
      .update(portfolios)
      .set({ isPublic })
      .where(eq(portfolios.id, portfolioId))
      .returning();
    return portfolio || undefined;
  }

  // Projects
  async getProjects(portfolioId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.portfolioId, portfolioId))
      .orderBy(projects.order);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject as any)
      .returning();
    return project;
  }

  async updateProject(
    id: string,
    updates: Partial<Project>
  ): Promise<Project | undefined> {
    const [project] = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  async updateProjectOrder(projectId: string, order: number): Promise<void> {
    await db.update(projects).set({ order }).where(eq(projects.id, projectId));
  }

  // Integrations
  async getIntegration(
    userId: string,
    provider: string
  ): Promise<Integration | undefined> {
    const [integration] = await db
      .select()
      .from(integrations)
      .where(
        and(
          eq(integrations.userId, userId),
          eq(integrations.provider, provider)
        )
      );
    return integration || undefined;
  }

  async createIntegration(
    insertIntegration: InsertIntegration
  ): Promise<Integration> {
    const [integration] = await db
      .insert(integrations)
      .values(insertIntegration)
      .returning();
    return integration;
  }

  async updateIntegration(
    id: string,
    updates: Partial<Integration>
  ): Promise<Integration | undefined> {
    const [integration] = await db
      .update(integrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(integrations.id, id))
      .returning();
    return integration || undefined;
  }

  // Sync Jobs
  async createSyncJob(insertJob: InsertSyncJob): Promise<SyncJob> {
    const [job] = await db.insert(syncJobs).values(insertJob).returning();
    return job;
  }

  async updateSyncJob(
    id: string,
    updates: Partial<SyncJob>
  ): Promise<SyncJob | undefined> {
    const [job] = await db
      .update(syncJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(syncJobs.id, id))
      .returning();
    return job || undefined;
  }

  async getUserSyncJobs(
    userId: string,
    limit: number = 10
  ): Promise<SyncJob[]> {
    return await db
      .select()
      .from(syncJobs)
      .where(eq(syncJobs.userId, userId))
      .orderBy(desc(syncJobs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
