CREATE TABLE "game_announcement_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"announcement_id" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"thread_participant_user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_announcement_recipients" ADD COLUMN "acknowledged_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "game_announcements" ADD COLUMN "requires_ack" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "game_announcement_messages" ADD CONSTRAINT "game_announcement_messages_announcement_id_game_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."game_announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_announcement_messages" ADD CONSTRAINT "game_announcement_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_announcement_messages" ADD CONSTRAINT "game_announcement_messages_thread_participant_user_id_users_id_fk" FOREIGN KEY ("thread_participant_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_game_announcement_messages_announcement_thread" ON "game_announcement_messages" USING btree ("announcement_id","thread_participant_user_id","created_at");