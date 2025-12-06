CREATE TABLE "User_Movies_Rating" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"movie_id" uuid NOT NULL,
	"rating" numeric(2, 1) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "User_Movies_Rating" ADD CONSTRAINT "User_Movies_Rating_user_id_Users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "User_Movies_Rating" ADD CONSTRAINT "User_Movies_Rating_movie_id_Movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."Movies"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "user_movie_unique" ON "User_Movies_Rating" USING btree ("user_id","movie_id");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_genre_unique" ON "Movie_MovieGenres" USING btree ("genre_id","movie_id");