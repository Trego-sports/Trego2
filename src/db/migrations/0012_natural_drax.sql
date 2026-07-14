CREATE TABLE "friend_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"sender_user_id" text NOT NULL,
	"body" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "friend_messages_order_check" CHECK ("friend_messages"."user_a_id" < "friend_messages"."user_b_id"),
	CONSTRAINT "friend_messages_sender_check" CHECK ("friend_messages"."sender_user_id" = "friend_messages"."user_a_id" OR "friend_messages"."sender_user_id" = "friend_messages"."user_b_id")
);
--> statement-breakpoint
ALTER TABLE "friend_messages" ADD CONSTRAINT "friend_messages_user_a_id_users_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_messages" ADD CONSTRAINT "friend_messages_user_b_id_users_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friend_messages" ADD CONSTRAINT "friend_messages_sender_user_id_users_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_friend_messages_pair_created" ON "friend_messages" USING btree ("user_a_id","user_b_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_friend_messages_unread" ON "friend_messages" USING btree ("user_a_id","user_b_id","sender_user_id","read_at");