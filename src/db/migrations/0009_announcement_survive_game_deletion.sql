ALTER TABLE "game_announcements" DROP CONSTRAINT "game_announcements_game_id_games_id_fk";
--> statement-breakpoint
ALTER TABLE "game_announcements" ALTER COLUMN "game_id" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "game_announcements" ADD COLUMN "host_user_id" text;
--> statement-breakpoint
ALTER TABLE "game_announcements" ADD COLUMN "game_title" text;
--> statement-breakpoint
UPDATE "game_announcements" ga
SET
  "host_user_id" = g."host_id",
  "game_title"   = g."title"
FROM "games" g
WHERE g."id" = ga."game_id";
--> statement-breakpoint
UPDATE "game_announcements"
SET "host_user_id" = "sender_user_id"
WHERE "host_user_id" IS NULL;
--> statement-breakpoint
UPDATE "game_announcements"
SET "game_title" = 'Deleted game'
WHERE "game_title" IS NULL;
--> statement-breakpoint
ALTER TABLE "game_announcements" ALTER COLUMN "host_user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "game_announcements" ALTER COLUMN "game_title" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "game_announcements" ADD CONSTRAINT "game_announcements_host_user_id_users_id_fk" FOREIGN KEY ("host_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "game_announcements" ADD CONSTRAINT "game_announcements_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;
