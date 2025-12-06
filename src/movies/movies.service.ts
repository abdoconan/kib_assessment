import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DB_PROVIDER } from 'src/db/database.module';
import { Movie, MovieGenre, MovieGenresRelation, MovieGenreRow, UserMoviesRating } from 'src/db/schema';
import { MovieDto } from 'src/integration/dto/movies.dto';
import { MovieGenreDto } from 'src/integration/dto/movies.gerne.dto';
import { RedisService } from 'src/redis/redis.service';
import { and, eq, ilike, inArray } from "drizzle-orm";


@Injectable()
export class MoviesService {
    private readonly GENRE_CACHE_KEY = 'movie_genres';
    

    constructor(@Inject(DB_PROVIDER) private db: any
                ,@Inject(RedisService) private redisService: RedisService) {}

    async SaveGenresFromIntegration(genres: MovieGenreDto[]): Promise<void> {
        const existing = await this.db
        .select({ serverId: MovieGenre.serverId })
        .from(MovieGenre);

        const existingIds = new Set(existing.map(x => x.serverId));

        const newGenres = genres.filter(g => !existingIds.has(g.id));

        if (newGenres.length > 0) { 
            await this.db
            .insert(MovieGenre)
            .values(    
                newGenres.map(g => ({
                    name: g.name,
                    serverId: g.id,
                }))
            );
            await this.redisService.del(this.GENRE_CACHE_KEY);
        }
    }

    async GetAllGenres(): Promise<MovieGenreRow[]> {
        const cached = await this.redisService.get(this.GENRE_CACHE_KEY);
        if (cached) {
            return JSON.parse(cached);
        }
        const genres = await this.db
            .select()
            .from(MovieGenre);
        await this.redisService.set(this.GENRE_CACHE_KEY, JSON.stringify(genres), 1 * 60 * 60);
        return genres;  
    }

    async SaveMoviesFromIntegration(movies: MovieDto[]): Promise<void> {
        // 1. Fetch existing serverIds
        const existing = await this.db
            .select({ serverId: Movie.serverId })
            .from(Movie);

        const existingIds = new Set(existing.map(x => x.serverId));

        // 2. Filter new movies from input
        const newMovies = movies.filter(m => !existingIds.has(m.id));
        if (newMovies.length === 0) return;

        // 3. Insert new movies AND get generated movie IDs
        const insertedMovies = await this.db
            .insert(Movie)
            .values(
                newMovies.map(m => ({
                    title: m.title,
                    originalTitle: m.original_title,
                    overview: m.overview,
                    releaseDate: m.release_date ? new Date(m.release_date) : null,
                    serverId: m.id,
                    voteAverage: m.vote_average,
                    voteCount: m.vote_count,
                }))
            )
            .returning({
                id: Movie.id,
                serverId: Movie.serverId,
            });

        // Map: serverId -> generated movie.id
        const movieIdMap: Map<number, string> = new Map(
            insertedMovies.map(m => [m.serverId as number, m.id])
        );

        // 4. Load genres once and build map: genreServerId -> genreDbId
        const genres = await this.GetAllGenres(); // assume returns { id: number; serverId: number }[]
        const genreMap: Map<number, string> = new Map(
            genres.map(g => [g.serverId , g.id])
        );

        // 5. Build relations only for newly inserted movies, and only if genre exists
        const relations: { movieId: string; genreId: string }[] = [];

        for (const m of newMovies) {
            const movieId = movieIdMap.get(m.id);
            if (movieId === undefined) continue;

            for (const genreServerId of m.genre_ids ?? []) {
                const genreDbId = genreMap.get(genreServerId);
                if (genreDbId === undefined) {
                    continue;
                }

                relations.push({
                    movieId,
                    genreId: genreDbId,
                });
            }
        }

        if (relations.length === 0) return;

        // 6. Deduplicate relations (avoid unique constraint violations)
        const uniqueRelations = Array.from(
            new Map(relations.map(r => [`${r.movieId}-${r.genreId}`, r])).values()
        );

        // 7. Insert relations
        await this.db.insert(MovieGenresRelation).values(uniqueRelations);
    }

    async GetMoviesWithGenres(genreName?: string): Promise<any[]> {
        const filteredMovieIds = genreName
            ? await this.db.select({ id: Movie.id })
                .from(Movie)
                .leftJoin(MovieGenresRelation, eq(Movie.id, MovieGenresRelation.movieId))
                .leftJoin(MovieGenre, eq(MovieGenresRelation.genreId, MovieGenre.id))
                .where(ilike(MovieGenre.name, `%${genreName}%`))
            : null;
        const rows = await this.db
            .select({
                movie: Movie,
                rel: MovieGenresRelation,
                genre: MovieGenre,
            })
            .from(Movie)
            .leftJoin(MovieGenresRelation, eq(Movie.id, MovieGenresRelation.movieId))
            .leftJoin(MovieGenre, eq(MovieGenresRelation.genreId, MovieGenre.id))
            .where(
                filteredMovieIds
                    ? inArray(Movie.id, filteredMovieIds.map(m => m.id))
                    : undefined
            );
        const movieMap = new Map<string, any>();

        for (const row of rows) {
            const movie = row.movie;
            const rel = row.rel;
            const genre = row.genre;

            if (!movieMap.has(movie.id)) {
                movieMap.set(movie.id, {
                    id: movie.id,
                    title: movie.title,
                    originalTitle: movie.originalTitle,
                    overview: movie.overview,
                    releaseDate: movie.releaseDate,
                    serverId: movie.serverId,
                    voteAverage: movie.voteAverage,
                    voteCount: movie.voteCount,
                    genres: [],
                });
            }

            if (rel?.genreId && genre?.id) {
                movieMap.get(movie.id).genres.push({
                    id: genre.id,
                    name: genre.name,
                });
            }
        }

        return [...movieMap.values()];
    }

    async rateMovie(userId: string, movieId: string, rating: number): Promise<void> {
        await this.db.transaction(async (tx) => {
            // 1. Check if user already rated (FIXED where clause)
            const existingRating = await tx
                .select()
                .from(UserMoviesRating)
                .where(
                    and(
                        eq(UserMoviesRating.userId, userId),
                        eq(UserMoviesRating.movieId, movieId)
                    )
                )
                .limit(1);

            if (existingRating.length > 0) {
                throw new BadRequestException('User has already rated this movie');
            }

            // 2. Check movie exists
            const movie = await tx
                .select()
                .from(Movie)
                .where(eq(Movie.id, movieId))
                .limit(1);

            if (movie.length === 0) {
                throw new BadRequestException('Movie does not exist');
            }

            // 3. Calculate new average rating
            const dbMovie = movie[0];
            const curAvg = dbMovie.voteAverage ?? 0;
            const curCount = dbMovie.voteCount ?? 0;

            const currentTotal = curAvg * curCount;
            const newVoteCount = curCount + 1;
            const newVoteAverage = (currentTotal + rating) / newVoteCount;

            // 4. Update movie stats
            await tx
                .update(Movie)
                .set({
                    voteAverage: newVoteAverage,
                    voteCount: newVoteCount,
                })
                .where(eq(Movie.id, movieId));

            // 5. Insert user rating
            await tx
                .insert(UserMoviesRating)
                .values({
                    userId,
                    movieId,
                    rating,
                });
        });
    }
}