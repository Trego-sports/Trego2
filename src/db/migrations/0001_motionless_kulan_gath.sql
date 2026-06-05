ALTER TABLE "game_participants" ADD COLUMN "attendance_status" text;--> statement-breakpoint
ALTER TABLE "game_participants" ADD COLUMN "attendance_marked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game_participants" ADD COLUMN "attendance_marked_by" text;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "requires_attendance_score" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "minimum_attendance_score" integer;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "allow_players_without_attendance_history" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_attendance_marked_by_users_id_fk" FOREIGN KEY ("attendance_marked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_attendance_status_check" CHECK ("game_participants"."attendance_status" IS NULL OR "game_participants"."attendance_status" IN ('present', 'absent'));--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_minimum_attendance_score_check" CHECK ("games"."minimum_attendance_score" IS NULL OR ("games"."minimum_attendance_score" >= 0 AND "games"."minimum_attendance_score" <= 100));