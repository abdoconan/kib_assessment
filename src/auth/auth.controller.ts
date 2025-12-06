import { Body, Controller, Get, Inject, Post, Req, UnauthorizedException, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserResponseDto } from './dto/user-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    @Post('signup')
    @ApiCreatedResponse({ type: UserResponseDto })
    async signUp(@Body(new ValidationPipe()) dto: CreateUserDto): Promise<UserResponseDto> {
        return await this.authService.signUp(dto);
    }

    @Post('login')
    @ApiCreatedResponse({ type: UserResponseDto })
    async login(@Body(new ValidationPipe()) dto: LoginDto): Promise<{ access_token: string }> {
        return await this.authService.login(dto);
    }

    @Get('users')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiCreatedResponse({ type: UserResponseDto, isArray: true })
    async getAllUsers(@Req() req: any): Promise<UserResponseDto[]> {
        if (req.user.isAdmin !== true) {
            throw new UnauthorizedException('Admin privileges required');
        }
        return await this.authService.getAllUsers();
    }

}
