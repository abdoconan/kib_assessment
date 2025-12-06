import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;
    
    @ApiProperty({ example: 'strongPass123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}