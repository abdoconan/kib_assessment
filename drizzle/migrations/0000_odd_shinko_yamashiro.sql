CREATE TABLE "Movies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"original_title" varchar(255),
	"overview" varchar(1000),
	"release_date" timestamp with time zone,
	"server_id" integer NOT NULL,
	"vote_average" numeric(2, 1),
	"vote_count" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Movies_server_id_unique" UNIQUE("server_id")
);
--> statement-breakpoint
CREATE TABLE "MovieGenres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"server_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "MovieGenres_name_unique" UNIQUE("name"),
	CONSTRAINT "MovieGenres_server_id_unique" UNIQUE("server_id")
);
--> statement-breakpoint
CREATE TABLE "Movie_MovieGenres" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"movie_id" uuid NOT NULL,
	"genre_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(255),
	"last_login" timestamp with time zone,
	"retry_count" varchar(10) DEFAULT '0',
	"next_retry" timestamp with time zone,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "Users_email_unique" UNIQUE("email"),
	CONSTRAINT "Users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "Movie_MovieGenres" ADD CONSTRAINT "Movie_MovieGenres_movie_id_Movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."Movies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "Movie_MovieGenres" ADD CONSTRAINT "Movie_MovieGenres_genre_id_MovieGenres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."MovieGenres"("id") ON DELETE cascade ON UPDATE cascade;