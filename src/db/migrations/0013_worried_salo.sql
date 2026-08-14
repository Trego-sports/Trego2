CREATE TABLE "community_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_user_id" text NOT NULL,
	"parent_comment_id" text,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "community_comments_id_post_unique" UNIQUE("id","post_id"),
	CONSTRAINT "community_comments_not_self_parent_check" CHECK ("community_comments"."parent_comment_id" IS NULL OR "community_comments"."parent_comment_id" <> "community_comments"."id")
);
--> statement-breakpoint
CREATE TABLE "community_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_user_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_same_post_fk" FOREIGN KEY ("parent_comment_id","post_id") REFERENCES "public"."community_comments"("id","post_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_community_comments_post_created" ON "community_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_community_comments_parent_created" ON "community_comments" USING btree ("parent_comment_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_community_comments_author" ON "community_comments" USING btree ("author_user_id");--> statement-breakpoint
CREATE INDEX "idx_community_posts_feed" ON "community_posts" USING btree ("deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "idx_community_posts_author" ON "community_posts" USING btree ("author_user_id","created_at");