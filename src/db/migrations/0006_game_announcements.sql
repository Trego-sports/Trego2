CREATE TABLE "game_announcement_recipients" (
	"announcement_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "game_announcement_recipients_announcement_id_user_id_pk" PRIMARY KEY("announcement_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "game_announcements" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"body" text NOT NULL,
	"audience_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_announcements_audience_type_check" CHECK ("game_announcements"."audience_type" IN ('all', 'selected'))
);
--> statement-breakpoint
ALTER TABLE "game_announcement_recipients" ADD CONSTRAINT "game_announcement_recipients_announcement_id_game_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."game_announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_announcement_recipients" ADD CONSTRAINT "game_announcement_recipients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_announcements" ADD CONSTRAINT "game_announcements_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_announcements" ADD CONSTRAINT "game_announcements_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_game_announcement_recipients_user_id" ON "game_announcement_recipients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_game_announcements_game_id" ON "game_announcements" USING btree ("game_id");