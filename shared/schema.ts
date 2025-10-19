import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const planEnum = pgEnum("plan", ["FREE", "PRO"]);
export const syncStatusEnum = pgEnum("sync_status", [
  "queued",
  "running",
  "success",
  "error",
]);

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  githubId: varchar("github_id").unique(),
  handle: varchar("handle").unique(),
  name: text("name"),
  email: varchar("email").unique(),
  emailVerified: timestamp("emailVerified"),
  image: text("image"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  location: text("location"),
  website: text("website"),
  plan: planEnum("plan").default("FREE").notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
});

export const portfolios = pgTable("portfolios", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  themeId: varchar("theme_id").default("sleek").notNull(),
  accentColor: varchar("accent_color"),
  isPublic: boolean("is_public").default(false).notNull(),
  customDomain: varchar("custom_domain"),
  showStats: boolean("show_stats").default(true).notNull(),
  social: json("social").$type<{
    github?: string;
    x?: string;
    linkedin?: string;
    website?: string;
  }>(),
});

export const projects = pgTable("projects", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  portfolioId: varchar("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  repoId: varchar("repo_id").notNull(),
  name: text("name").notNull(),
  repoUrl: text("repo_url").notNull(),
  homepage: text("homepage"),
  description: text("description"),
  summary: text("summary"),
  features: json("features")
    .$type<string[]>()
    .default(sql`'[]'`),
  images: json("images")
    .$type<Array<{ url: string; alt: string }>>()
    .default(sql`'[]'`),
  topics: json("topics")
    .$type<string[]>()
    .default(sql`'[]'`),
  languages: json("languages")
    .$type<Record<string, number>>()
    .default(sql`'{}'`),
  stars: integer("stars").default(0).notNull(),
  forks: integer("forks").default(0).notNull(),
  lastUpdated: timestamp("last_updated"),
  stack: json("stack").$type<{
    framework?: string;
    runtime?: string;
    packageManager?: string;
    docker?: boolean;
  }>(),
  order: integer("order").default(0).notNull(),
});

export const integrations = pgTable("integrations", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  scopes: text("scopes").notNull(),
  etagCache: json("etag_cache").$type<Record<string, string>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const syncJobs = pgTable("sync_jobs", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  repoId: varchar("repo_id").notNull(),
  status: syncStatusEnum("status").default("queued").notNull(),
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Auth.js tables
export const accounts = pgTable(
  "accounts",
  {
    userId: varchar("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type").notNull(),
    provider: varchar("provider").notNull(),
    providerAccountId: varchar("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: sql`PRIMARY KEY (${account.provider}, ${account.providerAccountId})`,
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken").primaryKey(),
  userId: varchar("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const verificationTokens = pgTable(
  "verificationTokens",
  {
    identifier: varchar("identifier").notNull(),
    token: varchar("token").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (vt) => ({
    compoundKey: sql`PRIMARY KEY (${vt.identifier}, ${vt.token})`,
  })
);

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  portfolio: one(portfolios, {
    fields: [users.id],
    references: [portfolios.userId],
  }),
  integrations: many(integrations),
  syncJobs: many(syncJobs),
}));

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [projects.portfolioId],
    references: [portfolios.id],
  }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  user: one(users, {
    fields: [integrations.userId],
    references: [users.id],
  }),
}));

export const syncJobsRelations = relations(syncJobs, ({ one }) => ({
  user: one(users, {
    fields: [syncJobs.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSyncJobSchema = createInsertSchema(syncJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;

export type InsertSyncJob = z.infer<typeof insertSyncJobSchema>;
export type SyncJob = typeof syncJobs.$inferSelect;

export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;

// Portfolio model for rendering
export type PortfolioModel = {
  user: {
    name: string | null;
    handle: string | null;
    avatarUrl: string | null;
    bio?: string | null;
    location?: string | null;
    website?: string | null;
  };
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    summary: string | null;
    features: string[];
    images: Array<{ url: string; alt: string }>;
    languages: Record<string, number>;
    topics: string[];
    stars: number;
    forks: number;
    homepage: string | null;
    repoUrl: string;
    lastUpdated: Date | null;
    stack?: {
      framework?: string;
      runtime?: string;
      packageManager?: string;
      docker?: boolean;
    };
  }>;
  social: {
    github?: string;
    x?: string;
    linkedin?: string;
    website?: string;
  };
  layout: {
    themeId: string;
    accentColor?: string | null;
    showStats: boolean;
  };
};

// Theme configuration
export const themes = [
  {
    id: "sleek",
    name: "Sleek",
    description: "Hero + grid cards with cover images and language badges",
    isPro: false,
  },
  {
    id: "cardgrid",
    name: "CardGrid",
    description: "Pinterest-style masonry layout with hover details",
    isPro: false,
  },
  {
    id: "terminal",
    name: "Terminal",
    description: "Monospace, command-prompt aesthetic with typing animation",
    isPro: true,
  },
  {
    id: "magazine",
    name: "Magazine",
    description: "Large image lead-ins with editorial excerpt sections",
    isPro: true,
  },
] as const;

export type ThemeId = (typeof themes)[number]["id"];
