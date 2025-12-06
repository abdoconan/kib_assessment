import { Controller, Get, Param, Query, ParseUUIDPipe, Body, Req, UseGuards, Put, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { MovieWithGenresDto } from './dto/movies.reponse.dto';
import { RateMovieDto } from './dto/rate.move.request.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';



@ApiTags('movies')
@Controller('movies')
export class MoviesController {

    constructor(private moviesService: MoviesService) {}

    @Get()
    @ApiOkResponse({ type: MovieWithGenresDto, isArray: true })
    @ApiQuery({
        name: 'genreName',
        required: false,
        type: String,
    })
    async getMovies(
        @Query('genreName') genreName?: string,
    ): Promise<MovieWithGenresDto[]> {
        return await this.moviesService.GetMoviesWithGenres(genreName);
    }

    @Put(":movieId/rate")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOkResponse({ type: Object, description: 'Rating submission result' })
    async rateMovie(@Req() req
                    , @Param('movieId', ParseUUIDPipe) movieId: string
                    , @Body(new ValidationPipe()) body: RateMovieDto): Promise<{message: string}> {
        const userId = req.user.userId;
        const rating = body.rating;
        await this.moviesService.rateMovie(userId, movieId, rating);
        return { message: 'Rating submitted successfully' };
    }   

}
