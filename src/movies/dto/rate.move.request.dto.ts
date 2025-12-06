import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min, Max } from "class-validator";

export class RateMovieDto {
  @ApiProperty({ example: 5.0, description: 'Rating value between 1 and 10' })
  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;
}