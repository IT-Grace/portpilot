ALTER TABLE "portfolios" ADD COLUMN "last_synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "portfolios" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;