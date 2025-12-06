import { ApiProperty } from '@nestjs/swagger';

export class GenreResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;
}