ALTER TABLE "game_participants" ADD COLUMN "joined_via_invite" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "game_participants" ADD COLUMN "invited_by" text;--> statement-breakpoint
ALTER TABLE "game_participants" ADD COLUMN "invited_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;