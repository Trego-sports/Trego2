CREATE TABLE "friend_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"requester_user_id" text NOT NULL,
	"recipient_user_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friend_requests_requester_recipient_unique" UNIQUE("requester_user_id","recipient_user_id"),
	CONSTRAINT "friend_requests_not_self_check" CHECK ("friend_requests"."requester_user_id" <> "friend_requests"."recipient_user_id"),
	CONSTRAINT "friend_requests_status_check" CHECK ("friend_requests"."status" IN ('pending', 'accepted', 'declined', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"requested_by_user_id" text,
	"accepted_by_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_user_a_id_user_b_id_pk" PRIMARY KEY("user_a_id","user_b_id"),
	CONSTRAINT "friendships_order_check" CHECK ("friendships"."user_a_id" < "friendships"."user_b_id")
);
--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_requester_user_id_users_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_requests" ADD CONSTRAINT "friend_requests_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_friend_requests_requester" ON "friend_requests" USING btree ("requester_user_id");--> statement-breakpoint
CREATE INDEX "idx_friend_requests_recipient" ON "friend_requests" USING btree ("recipient_user_id");--> statement-breakpoint
CREATE INDEX "idx_friendships_user_b" ON "friendships" USING btree ("user_b_id");