import { ApiProperty } from "@nestjs/swagger";
import { GenreResponseDto } from "./genre.response.dto";

export class MovieWithGenresDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  originalTitle: string;

  @ApiProperty()
  overview: string;

  @ApiProperty({ type: Date })
  releaseDate: Date;

  @ApiProperty()
  serverId: number;

  @ApiProperty()
  voteAverage: string; // numeric is returned as string in pg

  @ApiProperty()
  voteCount: number;

  @ApiProperty({ type: [GenreResponseDto] })
  genres: GenreResponseDto[];
}