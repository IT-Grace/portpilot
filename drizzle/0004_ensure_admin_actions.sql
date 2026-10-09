-- Production's database was missing admin_actions even though 0000 creates it
-- (0000 was recorded as applied without its SQL having run there). Recreate
-- it exactly as 0000 defines it, guarded so this is a no-op where it exists.
CREATE TABLE IF NOT EXISTS "admin_actions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" varchar NOT NULL,
	"target_user_id" varchar,
	"action" text NOT NULL,
	"details" json,
	"ip_address" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_actions_admin_id_users_id_fk') THEN
		ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'admin_actions_target_user_id_users_id_fk') THEN
		ALTER TABLE "admin_actions" ADD CONSTRAINT "admin_actions_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
	END IF;
END $$;
