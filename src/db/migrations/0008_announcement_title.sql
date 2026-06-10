ALTER TABLE "game_announcements" ADD COLUMN "title" text;--> statement-breakpoint
UPDATE "game_announcements" SET "title" = 'Announcement' WHERE "title" IS NULL;--> statement-breakpoint
ALTER TABLE "game_announcements" ALTER COLUMN "title" SET NOT NULL;
