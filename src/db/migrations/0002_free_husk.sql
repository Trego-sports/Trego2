ALTER TABLE "games" ADD COLUMN "attendance_finalized_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "attendance_finalized_by" text;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_attendance_finalized_by_users_id_fk" FOREIGN KEY ("attendance_finalized_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;