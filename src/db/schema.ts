import { pgTable, timestamp, uuid, varchar, boolean, numeric, integer } from "drizzle-orm/pg-core";
import { InferSelectModel, sql } from "drizzle-orm";
import { uniqueIndex } from "drizzle-orm/pg-core";

export const User = pgTable(
  "Users",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    fullName: varchar("full_name", { length: 255 }),
    lastLogin: timestamp("last_login", { withTimezone: true }),
    retryCount: varchar("retry_count", { length: 10 }).default("0"),
    nextRetry: timestamp("next_retry", { withTimezone: true }),
    isAdmin:  boolean("is_admin").default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow(),
  },
  (table) => ({
    schema: "public",
  })
);

export const MovieGenre = pgTable( 
  "MovieGenres",
  {
  id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  serverId: integer("server_id").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    schema: "public",
  })
);
export type MovieGenreRow = InferSelectModel<typeof MovieGenre>;

export const Movie = pgTable(
  "Movies",
  {
    id: uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    originalTitle: varchar("original_title", { length: 255 }),
    overview: varchar("overview", { length: 1000 }),
    releaseDate: timestamp("release_date", { withTimezone: true }),
    serverId: integer("server_id").notNull().unique(),
    voteAverage: numeric("vote_average", { precision: 2, scale: 1 }),
    voteCount: integer("vote_count"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    schema: "public",
  })
);


export const MovieGenresRelation = pgTable(
  "Movie_MovieGenres",
  {
    id : uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    movieId: uuid("movie_id")
      .notNull()
      .references(() => Movie.id, { onDelete: "cascade", onUpdate: "cascade" }),
    genreId: uuid("genre_id")
      .notNull()
      .references(() => MovieGenre.id, { onDelete: "cascade", onUpdate: "cascade" }),
  },
  (table) => ({
    schema: "public",
    MovieGenreUnique: uniqueIndex("movie_genre_unique").on(table.genreId, table.movieId),
  })
);


export const UserMoviesRating = pgTable(
  "User_Movies_Rating",
  {
    id : uuid("id").default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid("user_id").notNull().references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" }),
    movieId: uuid("movie_id").notNull().references(() => Movie.id, { onDelete: "cascade", onUpdate: "cascade" }),
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    schema: "public",
    userMovieUnique: uniqueIndex("user_movie_unique").on(table.userId, table.movieId),
  })
);
