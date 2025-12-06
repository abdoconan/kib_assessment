import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'me@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'myuser' })
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'strongPass123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @MinLength(2)
  fullName?: string;
}