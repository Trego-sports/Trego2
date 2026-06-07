CREATE TABLE "game_calendar_events" (
	"user_id" text NOT NULL,
	"game_id" text NOT NULL,
	"google_event_id" text NOT NULL,
	"synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_calendar_events_user_id_game_id_pk" PRIMARY KEY("user_id","game_id")
);
--> statement-breakpoint
CREATE TABLE "user_calendar_integrations" (
	"user_id" text PRIMARY KEY NOT NULL,
	"refresh_token_encrypted" text NOT NULL,
	"calendar_id" text DEFAULT 'primary' NOT NULL,
	"sync_enabled" boolean DEFAULT true NOT NULL,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_sync_error" text
);
--> statement-breakpoint
ALTER TABLE "game_calendar_events" ADD CONSTRAINT "game_calendar_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_calendar_events" ADD CONSTRAINT "game_calendar_events_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_calendar_integrations" ADD CONSTRAINT "user_calendar_integrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_game_calendar_events_game_id" ON "game_calendar_events" USING btree ("game_id");