CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE "game_participants" (
	"game_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "game_participants_game_id_user_id_pk" PRIMARY KEY("game_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"sport" text NOT NULL,
	"title" text NOT NULL,
	"location_name" text NOT NULL,
	"location" geography(point) NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"duration_minutes" integer DEFAULT 90 NOT NULL,
	"allowed_skill_levels" text[] NOT NULL,
	"spots_total" integer NOT NULL,
	"host_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"provider_id" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "oauth_accounts_provider_id_provider_account_id_pk" PRIMARY KEY("provider_id","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "player_sports" (
	"user_id" text NOT NULL,
	"sport" text NOT NULL,
	"skill_level" text NOT NULL,
	"position" text,
	CONSTRAINT "player_sports_user_id_sport_unique" UNIQUE("user_id","sport")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"location" geography(point),
	"profile_picture_url" text
);
--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_participants" ADD CONSTRAINT "game_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_sports" ADD CONSTRAINT "player_sports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_game_participants_game_id" ON "game_participants" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "idx_game_participants_user_id" ON "game_participants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_games_sport" ON "games" USING btree ("sport");--> statement-breakpoint
CREATE INDEX "idx_games_scheduled_at" ON "games" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_games_host_id" ON "games" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "idx_games_location" ON "games" USING gist ("location");--> statement-breakpoint
CREATE INDEX "idx_users_location" ON "users" USING gist ("location");