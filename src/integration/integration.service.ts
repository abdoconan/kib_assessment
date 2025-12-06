import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { MovieGenreDto } from './dto/movies.gerne.dto';
import { MovieDto } from './dto/movies.dto';

@Injectable()
export class IntegrationService {
    constructor(private readonly http: HttpService) {}

    async getMoviesGenres(): Promise<MovieGenreDto[]> {
        const url = 'https://api.themoviedb.org/3/genre/movie/list?language=en';

        const response = await lastValueFrom(
        this.http.get(url, {
                headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                Accept: 'application/json',
            },
        })
        );

        return response.data.genres;
    }

    async getMovies(): Promise<MovieDto[]> {
        const url = 'https://api.themoviedb.org/4/list/1?language=en-US&page=1';
        const response = await lastValueFrom(
        this.http.get(url, {
                headers: {
                Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
                Accept: 'application/json',
            },
        })
        );

        return response.data.results;
    }

}
